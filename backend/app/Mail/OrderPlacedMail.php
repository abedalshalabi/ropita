<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
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
        $siteName = SiteSetting::getValue('site_name', config('app.name'));

        return $this
            ->subject($this->recipientType === 'admin'
                ? "طلب جديد {$this->order->order_number} - {$siteName}"
                : "تم استلام طلبك {$this->order->order_number} - {$siteName}")
            ->view('emails.orders.placed')
            ->with([
                'order' => $this->order,
                'siteName' => $siteName,
                'recipientType' => $this->recipientType,
            ]);
    }
}
