'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function AdminPaymentsPage(): JSX.Element {
  const [payments, setPayments] = useState<any[]>([]);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المدفوعات...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة المدفوعات</h1>
        <p className="text-gray-600">عرض وإدارة جميع المدفوعات في النظام</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">قائمة المدفوعات</h2>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مدفوعات</h3>
            <p className="text-gray-500">لم يتم العثور على أي مدفوعات في النظام</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    معرف الدفع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المبلغ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الإنشاء
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.amount ? `${payment.amount} ريال` : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status === 'completed' ? 'مكتمل' : 
                         payment.status === 'pending' ? 'معلق' : 'فاشل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.createdAt ? new Date(payment.createdAt.seconds * 1000).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>إجمالي المدفوعات: {payments.length}</p>
      </div>
    </div>
    </>
  );
}