import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// إعدادات لرفع الملفات الكبيرة - تم تحديثها للنسخة الجديدة من Next.js
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'ملف الفيديو مطلوب' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      
      return NextResponse.json(
        { 
          error: `حجم الفيديو كبير جداً! حجم الملف: ${fileSizeMB} ميجابايت، الحد الأقصى المسموح: ${maxSizeMB} ميجابايت. يرجى اختيار فيديو أصغر أو ضغط الفيديو قبل الرفع.`,
          details: {
            fileSize: file.size,
            fileSizeMB: parseFloat(fileSizeMB),
            maxSize: maxSize,
            maxSizeMB: parseInt(maxSizeMB),
            fileName: file.name
          }
        },
        { status: 413 } // 413 Payload Too Large
      );
    }

    // إنشاء عميل Supabase
    const supabase = createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
    );

    // التأكد من وجود bucket videos
    const { data: buckets } = await supabase.storage.listBuckets();
    const videosBucket = buckets?.find(bucket => bucket.name === 'videos');
    
    if (!videosBucket) {
      console.log('📦 إنشاء bucket videos...');
      const { error: createError } = await supabase.storage.createBucket('videos', {
        public: true,
        allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
        fileSizeLimit: 100 * 1024 * 1024 // 100MB
      });
      
      if (createError) {
        console.error('❌ خطأ في إنشاء bucket videos:', createError);
        return NextResponse.json(
          { error: 'فشل في إنشاء مجلد الفيديوهات' },
          { status: 500 }
        );
      }
    }

    // إنشاء اسم فريد للملف
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = file.name.split('.').slice(0, -1).join('.');
    const filePath = `videos/${userId}/${timestamp}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;

    console.log('🚀 بدء رفع الفيديو:', {
      bucket: 'videos',
      filePath,
      fileSize: file.size,
      fileType: file.type,
      userId
    });

    // رفع الملف إلى Supabase
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('❌ خطأ في رفع الفيديو:', error);
      return NextResponse.json(
        { error: `فشل في رفع الفيديو: ${error.message}` },
        { status: 500 }
      );
    }

    // الحصول على الرابط العام
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: 'فشل في الحصول على رابط الفيديو' },
        { status: 500 }
      );
    }

    console.log('✅ تم رفع الفيديو بنجاح:', urlData.publicUrl);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      name: fileName,
      size: file.size,
      type: file.type,
      path: filePath
    });

  } catch (error) {
    console.error('❌ خطأ في API رفع الفيديو:', error);
    return NextResponse.json(
      { error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'رابط الفيديو مطلوب' },
        { status: 400 }
      );
    }

    // إنشاء عميل Supabase
    const supabase = createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
    );

    // استخراج المسار من الرابط
    const urlParts = videoUrl.split('/storage/v1/object/public/');
    if (urlParts.length < 2) {
      return NextResponse.json(
        { error: 'رابط الفيديو غير صالح' },
        { status: 400 }
      );
    }

    const filePath = urlParts[1];
    const bucket = 'avatars';

    console.log('🗑️ حذف الفيديو:', { bucket, filePath });

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath!]);

    if (error) {
      console.error('❌ خطأ في حذف الفيديو:', error);
      return NextResponse.json(
        { error: `فشل في حذف الفيديو: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('✅ تم حذف الفيديو بنجاح');

    return NextResponse.json({
      success: true,
      message: 'تم حذف الفيديو بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ في API حذف الفيديو:', error);
    return NextResponse.json(
      { error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
} 
