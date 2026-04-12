<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\SiteSetting;
use App\Support\MediaUrl;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Collection;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderPlacedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $recipientType = 'customer'
    ) {
    }

    public function build(): static
    {
        $this->order->loadMissing(['items.product.images', 'items.productVariant']);

        $siteName = SiteSetting::getValue('site_name', config('app.name'));
        $frontendUrl = rtrim((string) env('FRONTEND_URL', 'https://ropita.ps/V1'), '/');
        $backendUrl = $this->resolveBackendPublicUrl($frontendUrl);
        $headerLogo = SiteSetting::getValue('header_logo', '/logo.webp');
        $headerPhone = SiteSetting::getValue('header_phone', '');
        $logoUrl = $this->resolveMailLogoUrl($headerLogo, $frontendUrl, $backendUrl);
        $successUrl = $frontendUrl . '/order-success';

        return $this
            ->subject($this->recipientType === 'admin'
                ? "طلب جديد {$this->order->order_number} - {$siteName}"
                : "تم استلام طلبك {$this->order->order_number} - {$siteName}")
            ->view('emails.orders.placed')
            ->with([
                'order' => $this->order,
                'siteName' => $siteName,
                'recipientType' => $this->recipientType,
                'frontendUrl' => $frontendUrl,
                'successUrl' => $successUrl,
                'logoUrl' => $logoUrl,
                'headerPhone' => $headerPhone,
                'paymentMethodLabel' => $this->getPaymentMethodLabel(),
                'orderStatusLabel' => $this->getOrderStatusLabel(),
                'customerAddress' => $this->getCustomerAddress(),
                'orderItems' => $this->buildOrderItems($frontendUrl, $backendUrl),
            ]);
    }

    private function getPaymentMethodLabel(): string
    {
        return match ($this->order->payment_method) {
            'cod' => 'الدفع عند الاستلام',
            'credit_card' => 'بطاقة ائتمان',
            'paypal' => 'PayPal',
            default => (string) $this->order->payment_method,
        };
    }

    private function getOrderStatusLabel(): string
    {
        return match ($this->order->order_status) {
            'pending' => 'قيد التحضير',
            'processing' => 'قيد المعالجة',
            'shipped' => 'تم الشحن',
            'delivered' => 'تم التسليم',
            'cancelled' => 'ملغي',
            default => (string) $this->order->order_status,
        };
    }

    private function getCustomerAddress(): string
    {
        $parts = array_filter([
            $this->order->customer_city,
            $this->order->customer_district,
            $this->order->customer_street,
            $this->order->customer_building,
        ], fn ($value) => filled($value));

        return implode('، ', $parts);
    }

    private function buildOrderItems(string $frontendUrl, string $backendUrl): Collection
    {
        return $this->order->items->map(function ($item) use ($frontendUrl, $backendUrl) {
            $product = $item->product;

            $imagePath = null;
            if ($product) {
                $productImages = $this->resolveProductImages($product);

                $primaryImage = $productImages
                    ->sortBy([
                        ['is_primary', 'desc'],
                        ['sort_order', 'asc'],
                    ])
                    ->first();

                $imagePath = $product->cover_image
                    ?: ($primaryImage?->image_path);
            }

            return [
                'name' => $item->product_name,
                'sku' => $item->product_sku,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
                'original_price' => (float) ($item->original_price ?? 0),
                'total' => (float) $item->total,
                'variant_values' => is_array($item->variant_values) ? $item->variant_values : [],
                'image_url' => MediaUrl::publicUrl($imagePath),
                'product_url' => $product ? $frontendUrl . '/product/' . $product->id : null,
            ];
        });
    }

    private function resolveProductImages($product): Collection
    {
        if (!$product) {
            return collect();
        }

        // Product has both an "images" casted attribute and an "images()" relation.
        // Always normalize to a Collection so mail rendering does not break checkout.
        if ($product->relationLoaded('images')) {
            $images = $product->getRelation('images');
            return $images instanceof Collection ? $images : collect($images);
        }

        try {
            return $product->images()->get();
        } catch (\Throwable) {
            $images = $product->images ?? [];
            return collect(is_array($images) ? $images : []);
        }
    }

    private function makeFrontendAssetUrl(?string $path, string $frontendUrl, string $backendUrl): string
    {
        if (blank($path)) {
            return $this->extractUrlOrigin($frontendUrl) . '/logo.webp';
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        if ($path === '/logo.webp' || $path === 'logo.webp') {
            return $this->extractUrlOrigin($frontendUrl) . '/logo.webp';
        }

        return MediaUrl::publicUrl($path) ?? $this->makeStorageAwareUrl($path, $frontendUrl, $backendUrl);
    }

    private function makeStorageAwareUrl(?string $path, string $frontendUrl, string $backendUrl): ?string
    {
        if (blank($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return MediaUrl::publicUrl($path);
        }

        if (str_contains($path, '/storage/')) {
            $relativePath = explode('/storage/', $path, 2)[1];
            return $backendUrl . '/storage/' . ltrim($relativePath, '/');
        }

        if (str_starts_with($path, '/storage')) {
            return $backendUrl . $path;
        }

        if (str_starts_with($path, 'storage/')) {
            return $backendUrl . '/' . $path;
        }

        if (str_starts_with($path, '/')) {
            return $frontendUrl . $path;
        }

        return $backendUrl . '/storage/' . ltrim($path, '/');
    }

    private function resolveBackendPublicUrl(string $frontendUrl): string
    {
        $configuredUrl = rtrim((string) env('BACKEND_PUBLIC_URL', ''), '/');
        if ($configuredUrl !== '') {
            return $configuredUrl;
        }

        $appUrl = rtrim((string) config('app.url'), '/');
        if ($appUrl !== '' && !str_contains($appUrl, 'localhost') && !str_contains($appUrl, '127.0.0.1')) {
            return $appUrl;
        }

        $origin = $this->extractUrlOrigin($frontendUrl);
        return $origin . '/ropita/public';
    }

    private function extractUrlOrigin(string $url): string
    {
        $parts = parse_url($url);

        $scheme = $parts['scheme'] ?? 'https';
        $host = $parts['host'] ?? 'ropita.ps';
        $port = isset($parts['port']) ? ':' . $parts['port'] : '';

        return "{$scheme}://{$host}{$port}";
    }

    private function resolveMailLogoUrl(?string $headerLogo, string $frontendUrl, string $backendUrl): string
    {
        $mailLogoUrl = trim((string) env('MAIL_LOGO_URL', ''));
        if ($mailLogoUrl !== '') {
            return $mailLogoUrl;
        }

        // Email clients are stricter than browsers. Prefer a stable public logo
        // outside /storage unless the user explicitly provides MAIL_LOGO_URL.
        $origin = $this->extractUrlOrigin($frontendUrl);

        if ($headerLogo === '/logo.webp' || $headerLogo === 'logo.webp' || blank($headerLogo)) {
            return $origin . '/logo.webp';
        }

        return $this->makeFrontendAssetUrl($headerLogo, $frontendUrl, $backendUrl);
    }
}
