import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import { ShopifyAuthSession } from './types';

// Shopify API configuration
export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_APP_KEY!,
  apiSecretKey: process.env.SHOPIFY_APP_SECRET!,
  scopes: (process.env.SHOPIFY_SCOPES || 'read_content,write_content').split(','),
  hostName: process.env.SHOPIFY_APP_URL?.replace(/https?:\/\//, '') || 'localhost:3000',
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false, // Set to true if you want embedded app
  userAgentPrefix: 'Blogen-Shopify-CMS',
});

/**
 * Create OAuth authorization URL
 */
export function createOAuthUrl(shop: string, state: string): string {
  const authRoute = shopify.auth.begin({
    shop,
    callbackPath: '/api/auth/shopify/callback',
    isOnline: true, // Use online tokens for user-specific access
    rawRequest: undefined as any,
    rawResponse: undefined as any,
  });

  // Manually construct the URL since we need to handle state parameter
  const params = new URLSearchParams({
    client_id: process.env.SHOPIFY_APP_KEY!,
    scope: (process.env.SHOPIFY_SCOPES || 'read_content,write_content'),
    redirect_uri: `${process.env.SHOPIFY_APP_URL}/api/auth/shopify/callback`,
    state,
    'grant_options[]': 'per-user',
  });

  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Validate Shopify domain
 */
export function isValidShopDomain(shop: string): boolean {
  if (!shop) return false;
  
  // Remove protocol if present
  shop = shop.replace(/^https?:\/\//, '');
  
  // Check if it's a valid Shopify domain
  const shopifyDomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.myshopify\.com$/;
  return shopifyDomainRegex.test(shop);
}

/**
 * Normalize shop domain
 */
export function normalizeShopDomain(shop: string): string {
  if (!shop) return '';
  
  // Remove protocol and trailing slash
  shop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  // Add .myshopify.com if not present
  if (!shop.includes('.myshopify.com')) {
    shop = `${shop}.myshopify.com`;
  }
  
  return shop;
}

/**
 * Verify HMAC signature for webhooks
 */
export function verifyHmac(data: string, signature: string): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.SHOPIFY_APP_SECRET!);
  hmac.update(data, 'utf8');
  const hash = hmac.digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'base64'),
    Buffer.from(hash, 'base64')
  );
}

/**
 * Create session object for Shopify API calls
 */
export function createShopifySession(authData: ShopifyAuthSession): Session {
  return new Session({
    id: `${authData.shop}_${authData.onlineAccessInfo?.associated_user?.id || 'offline'}`,
    shop: authData.shop,
    state: 'authenticated',
    isOnline: !!authData.onlineAccessInfo,
    scope: authData.scope,
    accessToken: authData.accessToken,
    expires: authData.expires,
    onlineAccessInfo: authData.onlineAccessInfo,
  });
}

/**
 * Get store information
 */
export async function getStoreInfo(session: Session) {
  const client = new shopify.clients.Graphql({ session });
  
  const query = `
    query {
      shop {
        id
        name
        email
        domain
        myshopifyDomain
        currencyCode
        timezone
        plan {
          displayName
        }
      }
    }
  `;
  
  try {
    const response = await client.query({ data: query });
    const body = response.body as any;
    if (body && body.data) {
      return body.data.shop;
    }
    throw new Error('Invalid response from Shopify API');
  } catch (error) {
    console.error('Error fetching store info:', error);
    throw error;
  }
}

/**
 * Get user information from Shopify
 */
export async function getUserInfo(session: Session) {
  if (!session.onlineAccessInfo) {
    throw new Error('Online access token required for user information');
  }
  
  return session.onlineAccessInfo.associated_user;
}