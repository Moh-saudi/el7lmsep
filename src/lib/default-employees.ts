// Default Employees Data
// ======================

import { Employee, EmployeeRole } from '@/types/employees';
import { getDefaultPermissions } from './employee-permissions';

// بيانات الموظفين الافتراضية
export const DEFAULT_EMPLOYEES: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // المدير العام
  {
    name: 'المدير العام',
    email: 'admin@el7lm.com',
    phone: '+966501234567',
    role: 'admin' as EmployeeRole,
    permissions: getDefaultPermissions('admin'),
    isActive: true,
    department: 'الإدارة العليا',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // محلل أداء الوسائط
  {
    name: 'أحمد محمد - محلل أداء الوسائط',
    email: 'media.analyst@el7lm.com',
    phone: '+966501234568',
    role: 'media_analyst' as EmployeeRole,
    permissions: getDefaultPermissions('media_analyst'),
    isActive: true,
    department: 'التحليلات والوسائط',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // مدير الدعم الفني
  {
    name: 'سارة أحمد - مدير الدعم الفني',
    email: 'support.manager@el7lm.com',
    phone: '+966501234569',
    role: 'support' as EmployeeRole,
    permissions: getDefaultPermissions('support'),
    isActive: true,
    department: 'الدعم الفني',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // مدير التسويق
  {
    name: 'محمد علي - مدير التسويق',
    email: 'marketing.manager@el7lm.com',
    phone: '+966501234570',
    role: 'marketing_manager' as EmployeeRole,
    permissions: getDefaultPermissions('marketing_manager'),
    isActive: true,
    department: 'التسويق',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // مدير خدمة العملاء الهاتفية
  {
    name: 'فاطمة حسن - مدير خدمة العملاء',
    email: 'customer.service@el7lm.com',
    phone: '+966501234571',
    role: 'customer_service' as EmployeeRole,
    permissions: getDefaultPermissions('customer_service'),
    isActive: true,
    department: 'خدمة العملاء',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // مدير الحسابات والمدفوعات
  {
    name: 'خالد عبدالله - مدير المالية',
    email: 'finance.manager@el7lm.com',
    phone: '+966501234572',
    role: 'finance' as EmployeeRole,
    permissions: getDefaultPermissions('finance'),
    isActive: true,
    department: 'المالية والمحاسبة',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // مشرف إدارة العملاء
  {
    name: 'نورا سالم - مشرف إدارة العملاء',
    email: 'customer.supervisor@el7lm.com',
    phone: '+966501234573',
    role: 'customer_supervisor' as EmployeeRole,
    permissions: getDefaultPermissions('customer_supervisor'),
    isActive: true,
    department: 'إدارة العملاء',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // مدير الموارد البشرية
  {
    name: 'عبدالرحمن محمد - مدير الموارد البشرية',
    email: 'hr.manager@el7lm.com',
    phone: '+966501234574',
    role: 'hr_manager' as EmployeeRole,
    permissions: getDefaultPermissions('hr_manager'),
    isActive: true,
    department: 'الموارد البشرية',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // مدير الجودة
  {
    name: 'مريم أحمد - مدير الجودة',
    email: 'quality.manager@el7lm.com',
    phone: '+966501234575',
    role: 'quality_manager' as EmployeeRole,
    permissions: getDefaultPermissions('quality_manager'),
    isActive: true,
    department: 'إدارة الجودة',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // مدير الامتثال
  {
    name: 'يوسف علي - مدير الامتثال',
    email: 'compliance.manager@el7lm.com',
    phone: '+966501234576',
    role: 'compliance_manager' as EmployeeRole,
    permissions: getDefaultPermissions('compliance_manager'),
    isActive: true,
    department: 'إدارة الامتثال',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // مدير التدريب
  {
    name: 'هند محمد - مدير التدريب',
    email: 'training.manager@el7lm.com',
    phone: '+966501234577',
    role: 'training_manager' as EmployeeRole,
    permissions: getDefaultPermissions('training_manager'),
    isActive: true,
    department: 'إدارة التدريب',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // مدير الأصول
  {
    name: 'عبدالله حسن - مدير الأصول',
    email: 'assets.manager@el7lm.com',
    phone: '+966501234578',
    role: 'assets_manager' as EmployeeRole,
    permissions: getDefaultPermissions('assets_manager'),
    isActive: true,
    department: 'إدارة الأصول',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // مدير المشاريع
  {
    name: 'لينا أحمد - مدير المشاريع',
    email: 'projects.manager@el7lm.com',
    phone: '+966501234579',
    role: 'projects_manager' as EmployeeRole,
    permissions: getDefaultPermissions('projects_manager'),
    isActive: true,
    department: 'إدارة المشاريع',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // مدير العلاقات العامة
  {
    name: 'طارق محمد - مدير العلاقات العامة',
    email: 'pr.manager@el7lm.com',
    phone: '+966501234580',
    role: 'pr_manager' as EmployeeRole,
    permissions: getDefaultPermissions('pr_manager'),
    isActive: true,
    department: 'العلاقات العامة',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // محرر محتوى
  {
    name: 'ريم عبدالله - محرر محتوى',
    email: 'content.editor@el7lm.com',
    phone: '+966501234581',
    role: 'content' as EmployeeRole,
    permissions: getDefaultPermissions('content'),
    isActive: true,
    department: 'إدارة المحتوى',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  },

  // مندوب مبيعات
  {
    name: 'سعد محمد - مندوب مبيعات',
    email: 'sales.rep@el7lm.com',
    phone: '+966501234582',
    role: 'sales' as EmployeeRole,
    permissions: getDefaultPermissions('sales'),
    isActive: true,
    department: 'المبيعات',
    locations: [
      {
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }
    ]
  }
];

// كلمات المرور الافتراضية
export const DEFAULT_PASSWORDS: Record<string, string> = {
  'admin@el7lm.com': 'Admin@2024!',
  'media.analyst@el7lm.com': 'Media@2024!',
  'support.manager@el7lm.com': 'Support@2024!',
  'marketing.manager@el7lm.com': 'Marketing@2024!',
  'customer.service@el7lm.com': 'Customer@2024!',
  'finance.manager@el7lm.com': 'Finance@2024!',
  'customer.supervisor@el7lm.com': 'Supervisor@2024!',
  'hr.manager@el7lm.com': 'HR@2024!',
  'quality.manager@el7lm.com': 'Quality@2024!',
  'compliance.manager@el7lm.com': 'Compliance@2024!',
  'training.manager@el7lm.com': 'Training@2024!',
  'assets.manager@el7lm.com': 'Assets@2024!',
  'projects.manager@el7lm.com': 'Projects@2024!',
  'pr.manager@el7lm.com': 'PR@2024!',
  'content.editor@el7lm.com': 'Content@2024!',
  'sales.rep@el7lm.com': 'Sales@2024!'
};

// دالة للحصول على كلمة المرور الافتراضية
export function getDefaultPassword(email: string): string {
  return DEFAULT_PASSWORDS[email] || 'Default@2024!';
}

// دالة للحصول على بيانات موظف افتراضية
export function getDefaultEmployee(email: string): Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> | null {
  return DEFAULT_EMPLOYEES.find(emp => emp.email === email) || null;
}




