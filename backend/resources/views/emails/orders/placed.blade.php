<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تفاصيل الطلب</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <div style="max-width:760px;margin:0 auto;padding:24px 14px;">
        <div style="text-align:center;margin-bottom:18px;">
            <img src="{{ $logoUrl }}" alt="{{ $siteName }}" style="max-height:56px;max-width:180px;width:auto;">
        </div>

        <div style="background:#ffffff;border-radius:22px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 8px 30px rgba(15,23,42,.06);">
            <div style="background:linear-gradient(135deg,#0f766e 0%,#059669 100%);padding:28px 24px;color:#ffffff;text-align:center;">
                <div style="font-size:72px;line-height:1;margin-bottom:12px;">✓</div>
                <h1 style="margin:0 0 8px;font-size:34px;font-weight:700;">{{ $recipientType === 'admin' ? 'تم استلام طلب جديد' : 'تم تأكيد طلبك بنجاح!' }}</h1>
                <p style="margin:0;font-size:18px;opacity:.95;">
                    {{ $recipientType === 'admin' ? 'تم إنشاء طلب جديد في متجر روبيتا' : 'شكراً لك على التسوق معنا' }}
                </p>
            </div>

            <div style="padding:24px;">
                <div style="background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:22px;margin-bottom:22px;">
                    <div style="font-size:23px;font-weight:700;margin-bottom:16px;text-align:center;">تفاصيل الطلب</div>

                    <div style="display:block;">
                        <div style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                            <span style="font-weight:700;">رقم الطلب:</span>
                            <span style="float:left;color:#0f766e;font-weight:700;">{{ $order->order_number }}</span>
                        </div>
                        <div style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                            <span style="font-weight:700;">اسم العميل:</span>
                            <span style="float:left;">{{ $order->customer_name }}</span>
                        </div>
                        <div style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                            <span style="font-weight:700;">رقم الهاتف:</span>
                            <span style="float:left;" dir="ltr">{{ $order->customer_phone }}</span>
                        </div>
                        <div style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                            <span style="font-weight:700;">البريد الإلكتروني:</span>
                            <span style="float:left;" dir="ltr">{{ $order->customer_email }}</span>
                        </div>
                        <div style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                            <span style="font-weight:700;">عنوان المشتري:</span>
                            <span style="float:left;max-width:60%;text-align:left;">{{ $customerAddress ?: 'غير محدد' }}</span>
                        </div>
                        @if($order->customer_additional_info)
                            <div style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                                <span style="font-weight:700;">معلومات إضافية:</span>
                                <span style="float:left;max-width:60%;text-align:left;">{{ $order->customer_additional_info }}</span>
                            </div>
                        @endif
                        <div style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                            <span style="font-weight:700;">طريقة الدفع:</span>
                            <span style="float:left;">{{ $paymentMethodLabel }}</span>
                        </div>
                        <div style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                            <span style="font-weight:700;">موعد التوصيل المتوقع:</span>
                            <span style="float:left;">2 أيام عمل</span>
                        </div>
                        <div style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                            <span style="font-weight:700;">حالة الطلب:</span>
                            <span style="float:left;color:#d97706;font-weight:700;">{{ $orderStatusLabel }}</span>
                        </div>
                        <div style="padding:12px 0;">
                            <span style="font-weight:700;">تاريخ الطلب:</span>
                            <span style="float:left;">{{ optional($order->created_at)->format('Y-m-d h:i A') }}</span>
                        </div>
                    </div>
                </div>

                <div style="background:#fefce8;border:1px solid #fde68a;border-radius:18px;padding:20px;margin-bottom:22px;">
                    <div style="font-size:19px;font-weight:700;color:#0f172a;margin-bottom:12px;">الخطوات التالية</div>
                    <div style="margin-bottom:10px;"><strong>1.</strong> تحضير الطلب: سنقوم بتحضير طلبك وتعبئته بعناية.</div>
                    <div style="margin-bottom:10px;"><strong>2.</strong> الشحن: سيتم شحن طلبك خلال 24 ساعة.</div>
                    <div><strong>3.</strong> التوصيل: سيصل الطلب إلى العنوان المحدد خلال 2-3 أيام.</div>
                </div>

                <div style="margin-bottom:22px;">
                    <div style="font-size:20px;font-weight:700;margin-bottom:14px;">عناصر الطلب</div>

                    @foreach($orderItems as $item)
                        <div style="border:1px solid #e5e7eb;border-radius:18px;background:#ffffff;padding:14px;margin-bottom:14px;">
                            <table role="presentation" style="width:100%;border-collapse:collapse;">
                                <tr>
                                    <td style="width:108px;vertical-align:top;padding-left:12px;">
                                        @if($item['image_url'])
                                            @if($item['product_url'])
                                                <a href="{{ $item['product_url'] }}" target="_blank" style="text-decoration:none;">
                                                    <img src="{{ $item['image_url'] }}" alt="{{ $item['name'] }}" style="width:96px;height:96px;object-fit:cover;border-radius:14px;border:1px solid #e5e7eb;display:block;">
                                                </a>
                                            @else
                                                <img src="{{ $item['image_url'] }}" alt="{{ $item['name'] }}" style="width:96px;height:96px;object-fit:cover;border-radius:14px;border:1px solid #e5e7eb;display:block;">
                                            @endif
                                        @endif
                                    </td>
                                    <td style="vertical-align:top;">
                                        <div style="font-size:17px;font-weight:700;margin-bottom:6px;">
                                            @if($item['product_url'])
                                                <a href="{{ $item['product_url'] }}" target="_blank" style="color:#111827;text-decoration:none;">{{ $item['name'] }}</a>
                                            @else
                                                {{ $item['name'] }}
                                            @endif
                                        </div>
                                        @if($item['sku'])
                                            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">SKU: {{ $item['sku'] }}</div>
                                        @endif
                                        @if(!empty($item['variant_values']))
                                            <div style="font-size:13px;color:#374151;margin-bottom:8px;">
                                                @foreach($item['variant_values'] as $variantKey => $variantValue)
                                                    <div>{{ $variantKey }}: {{ $variantValue }}</div>
                                                @endforeach
                                            </div>
                                        @endif
                                        <div style="font-size:14px;color:#374151;margin-bottom:4px;">الكمية: {{ $item['quantity'] }}</div>
                                        <div style="font-size:14px;color:#374151;margin-bottom:4px;">السعر: {{ number_format($item['price'], 2) }} شيكل</div>
                                        @if($item['original_price'] > $item['price'])
                                            <div style="font-size:12px;color:#9ca3af;text-decoration:line-through;margin-bottom:4px;">قبل الخصم: {{ number_format($item['original_price'], 2) }} شيكل</div>
                                        @endif
                                        <div style="font-size:16px;color:#059669;font-weight:700;">الإجمالي: {{ number_format($item['total'], 2) }} شيكل</div>
                                        @if($item['product_url'])
                                            <div style="margin-top:10px;">
                                                <a href="{{ $item['product_url'] }}" target="_blank" style="display:inline-block;color:#0f766e;text-decoration:none;font-weight:700;">عرض المنتج</a>
                                            </div>
                                        @endif
                                    </td>
                                </tr>
                            </table>
                        </div>
                    @endforeach
                </div>

                <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;margin-bottom:22px;">
                    <div style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
                        <span style="font-weight:700;">المجموع الفرعي:</span>
                        <span style="float:left;">{{ number_format((float) $order->subtotal, 2) }} شيكل</span>
                    </div>
                    <div style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
                        <span style="font-weight:700;">تكلفة الشحن:</span>
                        <span style="float:left;{{ (float) $order->shipping_cost === 0.0 ? 'color:#16a34a;font-weight:700;' : '' }}">
                            {{ (float) $order->shipping_cost === 0.0 ? 'مجاني' : number_format((float) $order->shipping_cost, 2) . ' شيكل' }}
                        </span>
                    </div>
                    <div style="padding:14px 0 0;font-size:22px;font-weight:700;">
                        <span>المجموع الكلي:</span>
                        <span style="float:left;color:#059669;">{{ number_format((float) $order->total, 2) }} شيكل</span>
                    </div>
                </div>

                <div style="margin-bottom:22px;">
                    <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:12px 0;">
                        <tr>
                            <td style="width:50%;vertical-align:top;">
                                <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;text-align:center;height:100%;">
                                    <div style="font-size:28px;margin-bottom:8px;">📞</div>
                                    <div style="font-size:18px;font-weight:700;margin-bottom:8px;">تواصل معنا</div>
                                    <div style="font-size:14px;color:#6b7280;margin-bottom:12px;">لأي استفسارات حول طلبك</div>
                                    @if($headerPhone)
                                        <a href="tel:{{ preg_replace('/[^0-9+]/', '', $headerPhone) }}" style="color:#0f766e;text-decoration:none;font-weight:700;" dir="ltr">{{ $headerPhone }}</a>
                                    @else
                                        <span style="color:#0f766e;font-weight:700;">{{ $siteName }}</span>
                                    @endif
                                </div>
                            </td>
                            <td style="width:50%;vertical-align:top;">
                                <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;text-align:center;height:100%;">
                                    <div style="font-size:28px;margin-bottom:8px;">📦</div>
                                    <div style="font-size:18px;font-weight:700;margin-bottom:8px;">تتبع الطلب</div>
                                    <div style="font-size:14px;color:#6b7280;margin-bottom:12px;">تابع حالة طلبك أول بأول</div>
                                    <a href="{{ $successUrl }}" target="_blank" style="color:#0f766e;text-decoration:none;font-weight:700;">عرض صفحة الطلب</a>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                <div style="text-align:center;margin-bottom:22px;">
                    <a href="{{ $frontendUrl }}/" target="_blank" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:14px;font-weight:700;margin-left:8px;">
                        العودة للرئيسية
                    </a>
                    <a href="{{ $frontendUrl }}/products" target="_blank" style="display:inline-block;border:1px solid #0f766e;color:#0f766e;text-decoration:none;padding:14px 24px;border-radius:14px;font-weight:700;">
                        متابعة التسوق
                    </a>
                </div>

                <div style="background:linear-gradient(135deg,#0f766e 0%,#059669 100%);color:#ffffff;border-radius:18px;padding:22px;text-align:center;">
                    <div style="font-size:22px;font-weight:700;margin-bottom:8px;">شكراً لثقتك بنا!</div>
                    <div style="font-size:14px;opacity:.96;">
                        {{ $recipientType === 'admin' ? 'هذه النسخة مخصصة لمتابعة الطلب من لوحة الإدارة.' : 'نقدّر اختيارك لمتجر روبيتا ونتطلع لخدمتك مرة أخرى.' }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
