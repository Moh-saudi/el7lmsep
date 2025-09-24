'use client';

import React from 'react';

export default function SimpleAdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">لوحة تحكم الإدارة - صفحة بسيطة</h1>
      <p className="mt-4">هذه صفحة اختبار بسيطة للتأكد من عمل النظام</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">إدارة المستخدمين</h3>
          <p className="text-gray-600 mt-2">عرض وإدارة جميع المستخدمين</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">إدارة المحتوى</h3>
          <p className="text-gray-600 mt-2">إدارة المقالات والصور</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">التقارير</h3>
          <p className="text-gray-600 mt-2">عرض الإحصائيات والتقارير</p>
        </div>
      </div>
    </div>
  );
}





