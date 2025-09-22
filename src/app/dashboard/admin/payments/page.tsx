'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const paymentsRef = collection(db, 'payments');
        const q = query(paymentsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const paymentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPayments(paymentsData);
      } catch (error) {
        console.error('خطأ في جلب المدفوعات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المدفوعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المدفوعات</h1>
        <p className="text-gray-600">إدارة جميع المدفوعات في النظام</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              المدفوعات ({payments.length})
            </h2>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد مدفوعات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المعرف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.amount || 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.status || 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.createdAt ? 
                          (payment.createdAt.toDate ? 
                            payment.createdAt.toDate().toLocaleDateString('ar-SA') : 
                            new Date(payment.createdAt).toLocaleDateString('ar-SA')
                          ) : 
                          'غير محدد'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
