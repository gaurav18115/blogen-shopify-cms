import { NextRequest, NextResponse } from 'next/server';
import { getStoreInfo, getUserInfo, createShopifySession } from '@/lib/shopify';
import { supabase } from '@/lib/supabase';
import { setUserSession } from '@/lib/session';
import { User, ShopifyAuthSession } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const state = searchParams.get('state');

  // Verify required parameters
  if (!code || !shop || !state) {
    return NextResponse.redirect(
      new URL('/auth/error?message=Missing required parameters', request.url)
    );
  }

  // Verify state parameter for CSRF protection
  const savedState = request.cookies.get('oauth_state')?.value;
  if (state !== savedState) {
    return NextResponse.redirect(
      new URL('/auth/error?message=Invalid state parameter', request.url)
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_APP_KEY,
        client_secret: process.env.SHOPIFY_APP_SECRET,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code for access token');
    }

    const { access_token: accessToken, scope } = await tokenResponse.json();

    if (!accessToken) {
      throw new Error('No access token received');
    }

    // Create Shopify session for API calls
    const shopifySession = createShopifySession({
      shop,
      accessToken,
      scope,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      onlineAccessInfo: undefined,
    });

    // Get store and user information
    const [storeInfo, userInfo] = await Promise.all([
      getStoreInfo(shopifySession),
      getUserInfo(shopifySession),
    ]);

    // Create or update user in Supabase
    const userData: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
      shopify_user_id: userInfo.id,
      email: userInfo.email,
      full_name: `${userInfo.first_name} ${userInfo.last_name}`.trim(),
      shopify_store_url: shop,
      shopify_store_name: storeInfo.name,
      shopify_access_token: accessToken, // This should be encrypted in production
      role: userInfo.account_owner ? 'store_owner' : 'store_staff',
    };

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('shopify_user_id', userInfo.id)
      .eq('shopify_store_url', shop)
      .single();

    let user: User;

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error } = await supabase
        .from('profiles')
        .update({
          ...userData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) throw error;
      user = updatedUser;
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('profiles')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      user = newUser;
    }

    // Set session
    await setUserSession(user, accessToken, shop);

    // Redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    // Clear OAuth state cookie
    response.cookies.delete('oauth_state');

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/auth/error?message=Authentication failed', request.url)
    );
  }
}