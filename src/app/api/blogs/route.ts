import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createShopifySession, getBlogs } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isAuthenticated || !session.user || !session.shopifyAccessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create Shopify session for API calls
    const shopifySession = createShopifySession({
      shop: session.shopifyShop!,
      accessToken: session.shopifyAccessToken,
      scope: 'write_content,read_content',
    });

    const blogs = await getBlogs(shopifySession);

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}