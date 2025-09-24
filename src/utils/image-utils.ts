/**
 * Image Utilities
 * أدوات معالجة الصور
 */

import { toast } from 'sonner';

// حد أقصى لحجم الملف (5 MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// أنواع الملفات المدعومة
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
export const SUPPORTED_DOCUMENT_TYPES = ['application/pdf'];

/**
 * التحقق من صحة ملف الصورة
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // التحقق من وجود الملف
  if (!file) {
    return { isValid: false, error: 'لم يتم اختيار ملف' };
  }

  // التحقق من نوع الملف
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
  const isDocument = SUPPORTED_DOCUMENT_TYPES.includes(file.type);
  
  if (!isImage && !isDocument) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    
    toast.error(`نوع الملف غير مدعوم! 
    📄 نوع الملف المحدد: ${file.type}
    📊 حجم الملف: ${fileSizeMB} MB
    
    ✅ الأنواع المدعومة:
    • الصور: JPG, PNG, GIF, WebP
    • المستندات: PDF
    
    💡 تأكد من اختيار ملف صورة صالح`, {
      duration: 6000,
      style: {
        maxWidth: '380px',
        fontSize: '14px',
        lineHeight: '1.4'
      }
    });
    
    return { isValid: false, error: 'نوع ملف غير مدعوم' };
  }

  // التحقق من حجم الملف
  if (file.size > MAX_FILE_SIZE) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    const maxSizeMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(0);
    
    console.error(`❌ ملف كبير جداً: ${fileSizeMB}MB (الحد الأقصى: ${maxSizeMB}MB)`);
    
    toast.error(`حجم الملف كبير جداً! 
    📊 حجم الملف: ${fileSizeMB} ميجابايت
    ⚠️ الحد الأقصى المسموح: ${maxSizeMB} ميجابايت
    
    💡 نصائح لتقليل حجم الصورة:
    • استخدم أدوات ضغط الصور online مثل TinyPNG
    • قم بتغيير حجم الصورة إلى 800x800 بكسل
    • احفظ بصيغة JPG بدلاً من PNG للصور العادية
    • تجنب الصور عالية الدقة للملفات الشخصية`, {
      duration: 10000,
      style: {
        maxWidth: '420px',
        fontSize: '14px',
        lineHeight: '1.4'
      }
    });
    
    return { isValid: false, error: 'حجم الملف كبير جداً' };
  }

  return { isValid: true };
}

/**
 * تحويل حجم الملف إلى نص قابل للقراءة
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * إنشاء اسم ملف فريد
 */
export function generateUniqueFileName(originalName: string, userId: string, type: string): string {
  const timestamp = Date.now();
  const fileExt = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  return `trainer-${type}-${userId}-${timestamp}.${fileExt}`;
}

/**
 * معاينة الصورة قبل الرفع
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('فشل في قراءة الملف'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('خطأ في قراءة الملف'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * عرض رسالة نجاح مخصصة حسب نوع الرفع
 */
export function showUploadSuccessMessage(type: 'profile' | 'cover' | 'document', bucketUsed: string) {
  const typeNames = {
    profile: 'الصورة الشخصية',
    cover: 'صورة الغلاف',
    document: 'المستند'
  };
  
  const typeName = typeNames[type];
  
  const successMessage = bucketUsed === 'trainer' 
    ? `🎯 تم رفع ${typeName} بنجاح في Trainer bucket الأساسي!`
    : `✅ تم رفع ${typeName} بنجاح في ${bucketUsed}!`;
    
  toast.success(successMessage, {
    duration: 4000,
    style: {
      fontSize: '14px'
    }
  });
}

/**
 * عرض رسالة خطأ في الرفع
 */
export function showUploadErrorMessage(error: string) {
  console.error('💥 خطأ في رفع الملف:', error);
  
  toast.error(`فشل في رفع الملف
  ❌ السبب: ${error}
  
  🔧 جرب هذه الحلول:
  • تأكد من اتصال الإنترنت
  • جرب ملف أصغر حجماً
  • تأكد من نوع الملف المدعوم
  • أعد المحاولة بعد قليل`, {
    duration: 8000,
    style: {
      maxWidth: '380px',
      fontSize: '14px',
      lineHeight: '1.4'
    }
  });
}

/**
 * Create safe image URL
 */
export function createSafeImageUrl(url: string | null | undefined): string {
  if (!url) {
    return '/images/default-avatar.png';
  }
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path, make it absolute
  if (url.startsWith('/')) {
    return url;
  }
  
  // Otherwise, assume it's a relative path and add leading slash
  return `/${url}`;
}
