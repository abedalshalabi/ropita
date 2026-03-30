import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import {
  Search,
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Package
} from "lucide-react";
import { adminCustomersAPI } from "../services/adminApi";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  orders_count: number;
  cart_items_count: number;
  created_at: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery, currentPage]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await adminCustomersAPI.getCustomers({
        search: searchQuery,
        page: currentPage,
        per_page: 20
      });
      setCustomers(data.data || []);
      setTotalPages(data.meta?.last_page || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || "فشل في تحميل الزبائن");
    } finally {
      setLoading(false);
    }
  };

  if (loading && customers.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">جاري تحميل الزبائن...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الزبائن</h1>
            <p className="text-gray-600">عرض الزبائن المسجلين وإحصائيات طلباتهم</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث بالاسم أو البريد أو الهاتف..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Customers Table */}
        {customers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">لا يوجد زبائن</h3>
            <p className="text-gray-600">لم يتم العثور على زبائن تطابق معايير البحث</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">الزبون</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">التواصل</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">الطلبات</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">في السلة</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانضمام</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="mr-3">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-xs text-gray-500"># {customer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-3 h-3 ml-1" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-3 h-3 ml-1" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.orders_count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          <Package className="w-3 h-3 ml-1" />
                          {customer.orders_count} طلبات
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.cart_items_count > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                          <ShoppingCart className="w-3 h-3 ml-1" />
                          {customer.cart_items_count} قطع
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-3 h-3 ml-1" />
                          {new Date(customer.created_at).toLocaleDateString('ar-EG')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/customers/${customer.id}`)}
                          className="text-emerald-600 hover:text-emerald-900 p-2 hover:bg-emerald-50 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? "bg-emerald-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
