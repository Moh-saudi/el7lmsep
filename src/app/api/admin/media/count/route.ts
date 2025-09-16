import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const collections = ['students', 'coaches', 'academies', 'players'];
    let totalVideos = 0;
    let totalImages = 0;
    let pendingVideos = 0;
    let pendingImages = 0;
    let approvedVideos = 0;
    let approvedImages = 0;
    let rejectedVideos = 0;
    let rejectedImages = 0;

    for (const collectionName of collections) {
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData?.['isDeleted'] === true) return;

        // Count videos
        const userVideos = userData['videos'] || [];
        totalVideos += userVideos.length;
        userVideos.forEach((video: any) => {
          if (video.status === 'pending') pendingVideos++;
          else if (video.status === 'approved') approvedVideos++;
          else if (video.status === 'rejected') rejectedVideos++;
        });

        // Count images
        const imageFields = ['images', 'additional_images', 'profile_image', 'cover_image', 'avatar', 'profileImage', 'coverImage'];
        imageFields.forEach(fieldName => {
          const fieldData = userData[fieldName];
          if (fieldName === 'profile_image' || fieldName === 'cover_image' || fieldName === 'avatar' || fieldName === 'profileImage' || fieldName === 'coverImage') {
            if (fieldData) {
              totalImages++;
              if (fieldData.status === 'pending') pendingImages++;
              else if (fieldData.status === 'approved') approvedImages++;
              else if (fieldData.status === 'rejected') rejectedImages++;
            }
          } else if (Array.isArray(fieldData) && fieldData.length > 0) {
            fieldData.forEach((image: any) => {
              if (image && (image.url || typeof image === 'string')) {
                totalImages++;
                if (image.status === 'pending') pendingImages++;
                else if (image.status === 'approved') approvedImages++;
                else if (image.status === 'rejected') rejectedImages++;
              }
            });
          }
        });
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Media count fetched successfully',
      data: {
        totalVideos,
        totalImages,
        pendingVideos,
        pendingImages,
        approvedVideos,
        approvedImages,
        rejectedVideos,
        rejectedImages,
      },
    });
  } catch (error) {
    console.error('Error fetching media count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media count' },
      { status: 500 }
    );
  }
}













