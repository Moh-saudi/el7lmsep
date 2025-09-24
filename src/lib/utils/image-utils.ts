/**
 * Unified Image Utilities
 * أدوات الصور الموحدة
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Compress image file
 * ضغط ملف الصورة
 */
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload image to Supabase
 * رفع الصورة إلى Supabase
 */
export async function uploadImageToSupabase(
  file: File,
  bucket: string = 'images',
  folder: string = 'uploads'
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete image from Supabase
 * حذف الصورة من Supabase
 */
export async function deleteImageFromSupabase(
  url: string,
  bucket: string = 'images'
): Promise<void> {
  try {
    const fileName = url.split('/').pop();
    if (!fileName) {
      throw new Error('Invalid image URL');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Get optimized image URL
 * الحصول على رابط الصورة المحسن
 */
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!url) return '/images/default-avatar.png';
  
  // If it's a Supabase URL, add optimization parameters
  if (url.includes('supabase.co')) {
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', quality.toString());
    
    return `${url}?${params.toString()}`;
  }
  
  return url;
}

/**
 * Create responsive image URLs
 * إنشاء روابط الصور المتجاوبة
 */
export function createResponsiveImageUrls(
  baseUrl: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1920]
): { src: string; width: number }[] {
  return sizes.map(size => ({
    src: getOptimizedImageUrl(baseUrl, size),
    width: size,
  }));
}

/**
 * Create safe image URL
 * إنشاء رابط صورة آمن
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

/**
 * Validate image file
 * التحقق من صحة ملف الصورة
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (file.size > maxSize) {
    return { valid: false, error: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, WebP, GIF' };
  }

  return { valid: true };
}

/**
 * Get image dimensions
 * الحصول على أبعاد الصورة
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}
