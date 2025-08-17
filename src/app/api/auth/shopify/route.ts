import { NextRequest, NextResponse } from 'next/server';
import { createOAuthUrl, isValidShopDomain, normalizeShopDomain } from '@/lib/shopify';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json(
      { error: 'Shop parameter is required' },
      { status: 400 }
    );
  }

  const normalizedShop = normalizeShopDomain(shop);

  if (!isValidShopDomain(normalizedShop)) {
    return NextResponse.json(
      { error: 'Invalid shop domain' },
      { status: 400 }
    );
  }

  try {
    // Generate state parameter for CSRF protection
    const state = randomBytes(32).toString('hex');
    
    // Store state in session/cookie for verification
    const response = NextResponse.redirect(createOAuthUrl(normalizedShop, state));
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { shop } = await request.json();

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop parameter is required' },
        { status: 400 }
      );
    }

    const normalizedShop = normalizeShopDomain(shop);

    if (!isValidShopDomain(normalizedShop)) {
      return NextResponse.json(
        { error: 'Invalid shop domain' },
        { status: 400 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = randomBytes(32).toString('hex');
    const authUrl = createOAuthUrl(normalizedShop, state);

    return NextResponse.json({
      authUrl,
      state,
    });
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}