import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { User } from './types';

export interface SessionData {
  user?: User;
  shopifyAccessToken?: string;
  shopifyShop?: string;
  isAuthenticated: boolean;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'blogen-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax' as const,
  },
};

/**
 * Get session from cookies (for App Router)
 */
export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  
  return {
    ...session,
    isAuthenticated: !!session.user,
  };
}

/**
 * Get session from request/response (for API routes)
 */
export async function getSessionFromRequest(req: NextRequest, res: NextResponse) {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  
  return {
    ...session,
    isAuthenticated: !!session.user,
  };
}

/**
 * Set user in session
 */
export async function setUserSession(user: User, accessToken: string, shop: string) {
  const session = await getSession();
  
  session.user = user;
  session.shopifyAccessToken = accessToken;
  session.shopifyShop = shop;
  session.isAuthenticated = true;
  
  await session.save();
}

/**
 * Clear session
 */
export async function clearSession() {
  const session = await getSession();
  
  session.destroy();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isAuthenticated && !!session.user;
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session.user || null;
}

/**
 * Middleware helper to protect routes
 */
export async function requireAuth() {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    throw new Error('Authentication required');
  }
  
  return getCurrentUser();
}