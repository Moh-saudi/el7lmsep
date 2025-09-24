import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Test API is working' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      success: true, 
      received: body,
      message: 'Test POST is working' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid JSON' 
    }, { status: 400 });
  }
}








