import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, ShoppingCart, Package, CreditCard, ShoppingBag, Eye, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminCustomersAPI } from '@/services/adminApi';
import AdminLayout from '@/components/AdminLayout';

interface CustomerDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  city?: string;
  district?: string;
  street?: string;
  building?: string;
  orders: any[];
  cart_items: any[];
  stats: {
    total_orders: number;
    total_spent: number;
    cart_items_count: number;
    cart_total: number;
  };
}

const AdminCustomerView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const response = await adminCustomersAPI.getCustomer(id!);
      setCustomer(response.data);
    } catch (err) {
      setError('فشل في تحميل بيانات الزبون');
      console.error('Error loading customer:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">جاري تحميل بيانات الزبون...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !customer) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'الزبون غير موجود'}</p>
            <Button onClick={() => navigate('/admin/customers')}>
              العودة للزبائن
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-6 py-4 space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/customers')}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>العودة</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">تفاصيل الزبون</h1>
              <p className="text-gray-600">{customer.name} | #{customer.id}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-emerald-100 bg-emerald-50/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-gray-900">{customer.stats.total_orders}</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Package className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-100 bg-blue-50/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">إجمالي المشتريات</p>
                <p className="text-2xl font-bold text-gray-900">{customer.stats.total_spent.toFixed(2)} ₪</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <CreditCard className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-100 bg-orange-50/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">عدد المنتجات في السلة</p>
                <p className="text-2xl font-bold text-gray-900">{customer.stats.cart_items_count}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-100 bg-purple-50/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">قيمة السلة</p>
                <p className="text-2xl font-bold text-gray-900">{customer.stats.cart_total.toFixed(2)} ₪</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main User Info & Orders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معلومات الاتصال والعنوان</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <User className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">الاسم:</span> {customer.name}
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">البريد:</span> {customer.email}
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">الهاتف:</span> {customer.phone || 'غير مسجل'}
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">تاريخ التسجيل:</span> {new Date(customer.created_at).toLocaleDateString('ar-SA')}
                  </div>
                </div>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 border-b pb-2 mb-2">عنوان الشحن الافتراضي</h4>
                  <p className="text-sm"><span className="font-medium">المدينة:</span> {customer.city || '-'}</p>
                  <p className="text-sm"><span className="font-medium">الحي:</span> {customer.district || '-'}</p>
                  <p className="text-sm"><span className="font-medium">الشارع:</span> {customer.street || '-'}</p>
                  <p className="text-sm"><span className="font-medium">البناية:</span> {customer.building || '-'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">تاريخ الطلبات</CardTitle>
                  <CardDescription>آخر الطلبات التي قام بها هذا الزبون</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {customer.orders && customer.orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 font-medium">رقم الطلب</th>
                          <th className="px-4 py-3 font-medium text-center">التاريخ</th>
                          <th className="px-4 py-3 font-medium text-center">الحالة</th>
                          <th className="px-4 py-3 font-medium text-center">الإجمالي</th>
                          <th className="px-4 py-3 font-medium text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {customer.orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-emerald-700">#{order.order_number}</td>
                            <td className="px-4 py-3 text-center text-gray-600">{new Date(order.created_at).toLocaleDateString('ar-EG')}</td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant={order.order_status === 'delivered' ? 'default' : 'secondary'}>
                                {order.order_status_label || order.order_status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-center font-bold">{(order.total).toFixed(2)} ₪</td>
                            <td className="px-4 py-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">لا يوجد طلبات سابقة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Abandoned Cart */}
          <div className="space-y-6">
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50/50">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                  <ShoppingBag className="h-5 w-5" />
                  سلة المشتريات (لم تكتمل)
                </CardTitle>
                <CardDescription>المنتجات الموجودة حالياً في سلة الزبون</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {customer.cart_items && customer.cart_items.length > 0 ? (
                  <div className="space-y-4">
                    {customer.cart_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg hover:border-orange-300 transition-all">
                        <div className="h-12 w-12 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                           {item.product?.image ? (
                             <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                           ) : (
                             <ShoppingBag className="h-6 w-6 text-gray-400" />
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{item.product?.name || 'منتج غير معروف'}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">الكمية: {item.quantity}</span>
                            <span className="text-sm font-bold text-emerald-600">
                              {((item.variant ? item.variant.price : (item.product ? item.product.price : 0)) * item.quantity).toFixed(2)} ₪
                            </span>
                          </div>
                          {item.variant && (
                            <div className="mt-1 flex gap-1 flex-wrap">
                               {item.variant.size && <Badge variant="outline" className="text-[10px] px-1">{item.variant.size}</Badge>}
                               {item.variant.color && <Badge variant="outline" className="text-[10px] px-1">{item.variant.color}</Badge>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t flex items-center justify-between font-bold">
                      <span>إجمالي قيمة السلة:</span>
                      <span className="text-lg text-orange-600 font-black">{customer.stats.cart_total.toFixed(2)} ₪</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400">السلة فارغة حالياً</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-md">ملاحظات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-3">
                 <p>• هذا الزبون انضم للموقع منذ {Math.floor((new Date().getTime() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24))} يوماً.</p>
                 <p>• متوسط قيمة الطلبات: {(customer.stats.total_orders > 0 ? customer.stats.total_spent / customer.stats.total_orders : 0).toFixed(2)} ₪</p>
                 {customer.stats.cart_items_count > 0 && (
                   <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg animate-pulse">
                     تنبيه: يوجد منتجات مهجورة في السلة!
                   </div>
                 )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomerView;
