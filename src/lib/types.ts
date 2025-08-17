export interface User {
  id: string
  shopify_user_id: number
  email: string
  full_name?: string
  avatar_url?: string
  shopify_store_url: string
  shopify_store_name?: string
  shopify_access_token?: string // This will be encrypted
  role: 'store_owner' | 'store_admin' | 'store_staff'
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  author_id: string
  title: string
  slug: string
  excerpt?: string
  content: any // Rich text content as JSON
  featured_image?: string
  status: 'draft' | 'published' | 'scheduled'
  tags?: string[]
  meta_title?: string
  meta_description?: string
  shopify_blog_id?: number
  shopify_article_id?: number
  published_at?: string
  scheduled_at?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  created_at: string
}

export interface Media {
  id: string
  filename: string
  original_name: string
  mime_type: string
  size: number
  url: string
  alt_text?: string
  uploaded_by: string
  created_at: string
}

export interface ShopifyStore {
  id: string
  store_domain: string
  access_token: string
  owner_id: string
  store_name?: string
  email?: string
  currency?: string
  timezone?: string
  webhook_verified: boolean
  created_at: string
  updated_at: string
}

export interface ShopifyAuthSession {
  shop: string
  accessToken: string
  scope: string
  expires?: Date
  onlineAccessInfo?: {
    expires_in: number
    associated_user_scope: string
    associated_user: {
      id: number
      first_name: string
      last_name: string
      email: string
      account_owner: boolean
      locale: string
      collaborator: boolean
    }
  }
}

export interface ShopifyOAuthParams {
  shop: string
  code: string
  state: string
  timestamp: string
  hmac: string
}