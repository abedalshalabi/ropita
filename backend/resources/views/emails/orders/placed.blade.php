<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>تفاصيل الطلب</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <div style="max-width:720px;margin:0 auto;padding:24px 16px;">
        <div style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
            <div style="background:#059669;padding:24px;color:#ffffff;">
                <h1 style="margin:0 0 8px;font-size:24px;">{{ $recipientType === 'admin' ? 'طلب جديد في المتجر' : 'تم استلام طلبك بنجاح' }}</h1>
                <p style="margin:0;font-size:15px;opacity:.95;">
                    {{ $recipientType === 'admin' ? 'تم إنشاء طلب جديد ويحتوي هذا البريد على كامل التفاصيل.' : 'شكرًا لك. هذه نسخة من تفاصيل طلبك.' }}
                </p>
            </div>

            <div style="padding:24px;">
                <div style="margin-bottom:24px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                    <div style="margin-bottom:8px;"><strong>رقم الطلب:</strong> {{ $order->order_number }}</div>
                    <div style="margin-bottom:8px;"><strong>تاريخ الطلب:</strong> {{ optional($order->created_at)->format('Y-m-d h:i A') }}</div>
                    <div style="margin-bottom:8px;"><strong>طريقة الدفع:</strong> {{ $order->payment_method === 'cod' ? 'الدفع عند الاستلام' : $order->payment_method }}</div>
                    <div><strong>حالة الطلب:</strong> {{ $order->order_status }}</div>
                </div>

                <h2 style="margin:0 0 12px;font-size:18px;">بيانات الزبون</h2>
                <div style="margin-bottom:24px;padding:16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
                    <div style="margin-bottom:8px;"><strong>الاسم:</strong> {{ $order->customer_name }}</div>
                    <div style="margin-bottom:8px;"><strong>الإيميل:</strong> {{ $order->customer_email }}</div>
                    <div style="margin-bottom:8px;"><strong>الهاتف:</strong> {{ $order->customer_phone }}</div>
                    <div style="margin-bottom:8px;"><strong>المدينة:</strong> {{ $order->customer_city }}</div>
                    <div style="margin-bottom:8px;"><strong>المنطقة:</strong> {{ $order->customer_district }}</div>
                    @if($order->customer_street)
                        <div style="margin-bottom:8px;"><strong>الشارع:</strong> {{ $order->customer_street }}</div>
                    @endif
                    @if($order->customer_building)
                        <div style="margin-bottom:8px;"><strong>البناية:</strong> {{ $order->customer_building }}</div>
                    @endif
                    @if($order->customer_additional_info)
                        <div style="margin-bottom:8px;"><strong>معلومات إضافية:</strong> {{ $order->customer_additional_info }}</div>
                    @endif
                    @if($order->notes)
                        <div><strong>ملاحظات الطلب:</strong> {{ $order->notes }}</div>
                    @endif
                </div>

                <h2 style="margin:0 0 12px;font-size:18px;">المنتجات</h2>
                <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                    <thead>
                        <tr style="background:#f3f4f6;">
                            <th style="padding:12px;border:1px solid #e5e7eb;text-align:right;">المنتج</th>
                            <th style="padding:12px;border:1px solid #e5e7eb;text-align:right;">الكمية</th>
                            <th style="padding:12px;border:1px solid #e5e7eb;text-align:right;">السعر</th>
                            <th style="padding:12px;border:1px solid #e5e7eb;text-align:right;">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($order->items as $item)
                            <tr>
                                <td style="padding:12px;border:1px solid #e5e7eb;vertical-align:top;">
                                    <div style="font-weight:700;">{{ $item->product_name }}</div>
                                    @if($item->product_sku)
                                        <div style="margin-top:4px;font-size:13px;color:#6b7280;">SKU: {{ $item->product_sku }}</div>
                                    @endif
                                    @if(is_array($item->variant_values) && count($item->variant_values) > 0)
                                        <div style="margin-top:6px;font-size:13px;color:#374151;">
                                            @foreach($item->variant_values as $variantKey => $variantValue)
                                                <div>{{ $variantKey }}: {{ $variantValue }}</div>
                                            @endforeach
                                        </div>
                                    @endif
                                </td>
                                <td style="padding:12px;border:1px solid #e5e7eb;">{{ $item->quantity }}</td>
                                <td style="padding:12px;border:1px solid #e5e7eb;">{{ number_format((float) $item->price, 2) }} شيكل</td>
                                <td style="padding:12px;border:1px solid #e5e7eb;">{{ number_format((float) $item->total, 2) }} شيكل</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

                <div style="padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                    <div style="margin-bottom:8px;"><strong>المجموع الفرعي:</strong> {{ number_format((float) $order->subtotal, 2) }} شيكل</div>
                    <div style="margin-bottom:8px;"><strong>رسوم الشحن:</strong> {{ number_format((float) $order->shipping_cost, 2) }} شيكل</div>
                    <div style="font-size:18px;font-weight:700;color:#059669;"><strong>الإجمالي النهائي:</strong> {{ number_format((float) $order->total, 2) }} شيكل</div>
                </div>

                <p style="margin:24px 0 0;font-size:14px;color:#6b7280;">
                    {{ $recipientType === 'admin' ? 'تم إرسال هذا البريد إلى قائمة إشعارات الطلبات الجديدة.' : "مع تحيات فريق {$siteName}" }}
                </p>
            </div>
        </div>
    </div>
</body>
</html>
