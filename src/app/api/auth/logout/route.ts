import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Clear the session
    await clearSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Clear the session
    await clearSession();

    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}