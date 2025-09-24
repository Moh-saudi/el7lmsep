import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint is working',
      received: phone
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}








