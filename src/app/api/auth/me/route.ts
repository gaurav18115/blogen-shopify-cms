import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Remove sensitive information before sending to client
    const { shopify_access_token, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    );
  }
}