import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const adsQuery = query(
      collection(db, 'ads'),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(adsQuery);
    const totalAds = snapshot.size;

    // Calculate additional stats
    const allAdsSnapshot = await getDocs(collection(db, 'ads'));
    const allAds = allAdsSnapshot.docs.map(doc => doc.data());
    
    const totalViews = allAds.reduce((sum, ad) => sum + (ad.views || 0), 0);
    const totalClicks = allAds.reduce((sum, ad) => sum + (ad.clicks || 0), 0);

    return NextResponse.json({
      success: true,
      message: 'Ad count fetched successfully',
      data: {
        totalAds: allAds.length,
        activeAds: totalAds,
        totalViews,
        totalClicks,
      },
    });
  } catch (error) {
    console.error('Error fetching ad count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ad count' },
      { status: 500 }
    );
  }
}













