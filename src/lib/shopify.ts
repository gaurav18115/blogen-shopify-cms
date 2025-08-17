import { Session } from '@shopify/shopify-api';
import { ShopifyAuthSession } from './types';

/**
 * Create OAuth authorization URL
 */
export function createOAuthUrl(shop: string, state: string): string {
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
  if (!session.accessToken) {
    throw new Error('Access token is required');
  }

  const response = await fetch(`https://${session.shop}/admin/api/2024-01/shop.json`, {
    headers: {
      'X-Shopify-Access-Token': session.accessToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch store info: ${response.statusText}`);
  }

  const data = await response.json();
  return data.shop;
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

/**
 * Get all blogs from Shopify store
 */
export async function getBlogs(session: Session) {
  if (!session.accessToken) {
    throw new Error('Access token is required');
  }

  const response = await fetch(`https://${session.shop}/admin/api/2024-01/blogs.json`, {
    headers: {
      'X-Shopify-Access-Token': session.accessToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blogs: ${response.statusText}`);
  }

  const data = await response.json();
  return data.blogs;
}

/**
 * Get articles from a specific blog
 */
export async function getBlogArticles(session: Session, blogId: number, limit = 50) {
  if (!session.accessToken) {
    throw new Error('Access token is required');
  }

  const response = await fetch(
    `https://${session.shop}/admin/api/2024-01/blogs/${blogId}/articles.json?limit=${limit}`,
    {
      headers: {
        'X-Shopify-Access-Token': session.accessToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch blog articles: ${response.statusText}`);
  }

  const data = await response.json();
  return data.articles;
}

/**
 * Create a new blog article
 */
export async function createBlogArticle(
  session: Session,
  blogId: number,
  article: {
    title: string;
    body_html: string;
    author?: string;
    tags?: string;
    summary?: string;
    published?: boolean;
  }
) {
  if (!session.accessToken) {
    throw new Error('Access token is required');
  }

  const response = await fetch(
    `https://${session.shop}/admin/api/2024-01/blogs/${blogId}/articles.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': session.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ article }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create article: ${errorData.errors || response.statusText}`);
  }

  const data = await response.json();
  return data.article;
}

/**
 * Update an existing blog article
 */
export async function updateBlogArticle(
  session: Session,
  blogId: number,
  articleId: number,
  article: {
    title?: string;
    body_html?: string;
    author?: string;
    tags?: string;
    summary?: string;
    published?: boolean;
  }
) {
  if (!session.accessToken) {
    throw new Error('Access token is required');
  }

  const response = await fetch(
    `https://${session.shop}/admin/api/2024-01/blogs/${blogId}/articles/${articleId}.json`,
    {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': session.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ article }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to update article: ${errorData.errors || response.statusText}`);
  }

  const data = await response.json();
  return data.article;
}

/**
 * Delete a blog article
 */
export async function deleteBlogArticle(
  session: Session,
  blogId: number,
  articleId: number
) {
  if (!session.accessToken) {
    throw new Error('Access token is required');
  }

  const response = await fetch(
    `https://${session.shop}/admin/api/2024-01/blogs/${blogId}/articles/${articleId}.json`,
    {
      method: 'DELETE',
      headers: {
        'X-Shopify-Access-Token': session.accessToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete article: ${response.statusText}`);
  }

  return true;
}

/**
 * Get a specific blog article
 */
export async function getBlogArticle(
  session: Session,
  blogId: number,
  articleId: number
) {
  if (!session.accessToken) {
    throw new Error('Access token is required');
  }

  const response = await fetch(
    `https://${session.shop}/admin/api/2024-01/blogs/${blogId}/articles/${articleId}.json`,
    {
      headers: {
        'X-Shopify-Access-Token': session.accessToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${response.statusText}`);
  }

  const data = await response.json();
  return data.article;
}