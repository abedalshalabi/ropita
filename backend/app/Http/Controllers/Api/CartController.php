<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Cart::with(['product.category', 'product.brand', 'product.images']);

        if (Auth::check()) {
            $query->where('user_id', Auth::id());
        } else {
            $query->where('session_id', $request->session()->getId());
        }

        $cartItems = $query->get();
        $total = $cartItems->sum('total');

        return response()->json([
            'data' => CartResource::collection($cartItems),
            'meta' => [
                'total_items' => $cartItems->count(),
                'total_amount' => $total,
                'shipping_cost' => $total > 500 ? 0 : 25,
                'final_total' => $total + ($total > 500 ? 0 : 25),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'variant_values' => 'nullable|array',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        
        // Validation: if product has variants, a variant must be selected
        if ($product->variants()->exists() && empty($validated['product_variant_id'])) {
            return response()->json([
                'message' => 'يرجى اختيار خيارات المنتج أولاً'
            ], 400);
        }

        $variant = null;
        if (!empty($validated['product_variant_id'])) {
            $variant = \App\Models\ProductVariant::where('product_id', $product->id)
                ->where('id', $validated['product_variant_id'])
                ->firstOrFail();
        }

        // Check stock availability based on stock_status
        // Server-side verification to prevent "Inspect Element" modification bypass
        $isAvailable = false;
        if ($product->stock_status === 'out_of_stock') {
            $isAvailable = false;
        } elseif ($product->stock_status === 'in_stock' || $product->stock_status === 'on_backorder') {
            $isAvailable = true;
        } elseif ($product->stock_status === 'stock_based') {
            if ($variant) {
                // Verification: variant must have enough stock
                $isAvailable = $variant->stock_quantity >= $validated['quantity'];
            } else {
                // Verification: main product must have enough stock
                $isAvailable = $product->stock_quantity >= $validated['quantity'];
            }
        }

        if (!$isAvailable) {
            return response()->json([
                'message' => 'المنتج غير متوفر بالكمية المطلوبة'
            ], 400);
        }

        // Find existing item with same product AND same variant
        $query = Cart::where('product_id', $validated['product_id'])
            ->where('product_variant_id', $validated['product_variant_id'] ?? null);

        if (Auth::check()) {
            $query->where('user_id', Auth::id());
        } else {
            $query->where('session_id', $request->session()->getId());
        }

        $existingItem = $query->first();
        $unitPrice = $variant ? $variant->price : $product->price;

        if ($existingItem) {
            $newQuantity = $existingItem->quantity + $validated['quantity'];
            
            // Re-verify stock for cumulative quantity
            if ($product->stock_status === 'stock_based') {
                $stockQty = $variant ? $variant->stock_quantity : $product->stock_quantity;
                if ($newQuantity > $stockQty) {
                    return response()->json([
                        'message' => 'الكمية الإجمالية في السلة تتجاوز المخزون المتوفر'
                    ], 400);
                }
            }

            $existingItem->update([
                'quantity' => $newQuantity,
                'price' => $unitPrice,
            ]);
            $cartItem = $existingItem;
        } else {
            $cartItem = Cart::create([
                'user_id' => Auth::id(),
                'session_id' => Auth::check() ? null : $request->session()->getId(),
                'product_id' => $validated['product_id'],
                'product_variant_id' => $validated['product_variant_id'] ?? null,
                'variant_values' => $validated['variant_values'] ?? null,
                'quantity' => $validated['quantity'],
                'price' => $unitPrice,
            ]);
        }

        return response()->json([
            'message' => 'تمت إضافة المنتج للسلة بنجاح',
            'data' => new CartResource($cartItem->load(['product.category', 'product.brand', 'product.images']))
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Cart $cart): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        // Check if user can update this cart item
        if (Auth::check() && $cart->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!Auth::check() && $cart->session_id !== $request->session()->getId()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product = $cart->product;
        $variant = $cart->product_variant_id ? \App\Models\ProductVariant::find($cart->product_variant_id) : null;

        // Check stock availability based on stock_status
        $isAvailable = false;
        if ($product->stock_status === 'out_of_stock') {
            $isAvailable = false;
        } elseif ($product->stock_status === 'in_stock' || $product->stock_status === 'on_backorder') {
            $isAvailable = true;
        } elseif ($product->stock_status === 'stock_based') {
            if ($variant) {
                $isAvailable = $variant->stock_quantity >= $validated['quantity'];
            } else {
                $isAvailable = $product->stock_quantity >= $validated['quantity'];
            }
        }

        if (!$isAvailable) {
            return response()->json([
                'message' => 'الكمية المطلوبة غير متوفرة حالياً'
            ], 400);
        }

        $cart->update([
            'quantity' => $validated['quantity'],
            'price' => $variant ? $variant->price : $product->price,
        ]);

        return response()->json([
            'message' => 'تم تحديث السلة بنجاح',
            'data' => new CartResource($cart->load(['product.category', 'product.brand', 'product.images']))
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cart $cart, Request $request): JsonResponse
    {
        // Check if user can delete this cart item
        if (Auth::check() && $cart->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!Auth::check() && $cart->session_id !== $request->session()->getId()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cart->delete();

        return response()->json([
            'message' => 'Cart item removed successfully'
        ]);
    }

    /**
     * Clear all cart items
     */
    public function clear(Request $request): JsonResponse
    {
        $query = Cart::query();

        if (Auth::check()) {
            $query->where('user_id', Auth::id());
        } else {
            $query->where('session_id', $request->session()->getId());
        }

        $query->delete();

        return response()->json([
            'message' => 'Cart cleared successfully'
        ]);
    }

    /**
     * Get cart summary
     */
    public function summary(Request $request): JsonResponse
    {
        $query = Cart::with('product');

        if (Auth::check()) {
            $query->where('user_id', Auth::id());
        } else {
            $query->where('session_id', $request->session()->getId());
        }

        $cartItems = $query->get();
        $total = $cartItems->sum('total');
        $shippingCost = $total > 500 ? 0 : 25;

        return response()->json([
            'data' => [
                'total_items' => $cartItems->count(),
                'total_amount' => $total,
                'shipping_cost' => $shippingCost,
                'final_total' => $total + $shippingCost,
            ]
        ]);
    }
}
