/**
 * أدوات مساعدة لتقليل التعقيد المعرفي في الكود
 * Complexity Reduction Utilities
 */

// أنواع البيانات المساعدة
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ProcessingResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// دالة مساعدة للتحقق من صحة البيانات
export function validateInput(data: any, rules: Record<string, Function>): ValidationResult {
  for (const [field, validator] of Object.entries(rules)) {
    if (!validator(data[field])) {
      return {
        isValid: false,
        error: `Invalid ${field}`
      };
    }
  }
  return { isValid: true };
}

// دالة مساعدة لمعالجة الأخطاء
export function handleError(error: any, context: string): ProcessingResult {
  console.error(`Error in ${context}:`, error);
  return {
    success: false,
    error: error.message || 'Unknown error occurred'
  };
}

// دالة مساعدة لتنفيذ العمليات مع معالجة الأخطاء
export async function safeExecute<T>(
  operation: () => Promise<T>,
  context: string
): Promise<ProcessingResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    return handleError(error, context);
  }
}

// دالة مساعدة لتقسيم المصفوفات
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// دالة مساعدة لإنشاء معالج الأخطاء
export function createErrorHandler(context: string) {
  return (error: any) => {
    console.error(`Error in ${context}:`, error);
    return {
      success: false,
      error: error.message || 'Operation failed'
    };
  };
}

// دالة مساعدة لتنفيذ العمليات المتعددة
export async function executeSequentially<T>(
  operations: (() => Promise<T>)[],
  context: string
): Promise<ProcessingResult<T[]>> {
  const results: T[] = [];
  
  for (let i = 0; i < operations.length; i++) {
    const result = await safeExecute(operations[i], `${context} - operation ${i + 1}`);
    if (!result.success) {
      return result;
    }
    results.push(result.data!);
  }
  
  return { success: true, data: results };
}

// دالة مساعدة لتنفيذ العمليات المتوازية
export async function executeInParallel<T>(
  operations: (() => Promise<T>)[],
  context: string
): Promise<ProcessingResult<T[]>> {
  try {
    const results = await Promise.all(operations.map(op => op()));
    return { success: true, data: results };
  } catch (error) {
    return handleError(error, context);
  }
}

// دالة مساعدة لإنشاء معالج الاستجابة
export function createResponseHandler() {
  return {
    success: (data: any, message?: string) => ({
      success: true,
      data,
      message: message || 'Operation completed successfully'
    }),
    error: (error: string, code?: number) => ({
      success: false,
      error,
      code: code || 400
    })
  };
}

// دالة مساعدة لتنظيف البيانات
export function sanitizeData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// دالة مساعدة لإنشاء معالج التحقق من الصلاحيات
export function createPermissionChecker(requiredPermissions: string[]) {
  return (userPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  };
}

// دالة مساعدة لإنشاء معالج التحقق من النوع
export function createTypeChecker<T>(typeGuard: (value: any) => value is T) {
  return (value: any): ProcessingResult<T> => {
    if (typeGuard(value)) {
      return { success: true, data: value };
    }
    return {
      success: false,
      error: 'Invalid type'
    };
  };
}
