<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'price' => $this->price,
            'total' => $this->total,
            'stock_status' => $this->product->stock_status ?? 'always_in_stock',
            'stock_quantity' => $this->product_variant_id && $this->variant ? $this->variant->stock_quantity : $this->product->stock_quantity,
            'manage_stock' => ($this->product->stock_status ?? '') === 'stock_based',
            'product' => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
                'price' => $this->product->price,
                'original_price' => $this->product->original_price,
                'discount_percentage' => $this->product->discount_percentage,
                'sku' => $this->product->sku,
                'in_stock' => $this->product->in_stock,
                'stock_quantity' => $this->product->stock_quantity,
                'category' => $this->product->category ? [
                    'id' => $this->product->category->id,
                    'name' => $this->product->category->name,
                    'slug' => $this->product->category->slug,
                ] : null,
                'brand' => $this->product->brand ? [
                    'id' => $this->product->brand->id,
                    'name' => $this->product->brand->name,
                    'slug' => $this->product->brand->slug,
                ] : null,
                'images' => collect($this->product->images ?? [])->map(function ($image) {
                    return [
                        'id' => $image->id ?? ($image['id'] ?? null),
                        'image_path' => $image->image_path ?? ($image['image_path'] ?? ''),
                        'alt_text' => $image->alt_text ?? ($image['alt_text'] ?? null),
                        'is_primary' => $image->is_primary ?? ($image['is_primary'] ?? false),
                    ];
                }),
                'cover_image' => $this->product->cover_image ? (str_starts_with($this->product->cover_image, 'http') ? $this->product->cover_image : asset('storage/' . $this->product->cover_image)) : null,
            ],
            'product_variant_id' => $this->product_variant_id,
            'variant_values' => $this->variant_values,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
