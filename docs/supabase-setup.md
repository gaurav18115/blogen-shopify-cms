# Supabase Setup & Configuration

## 🗄️ Overview

This guide covers the complete setup and configuration of Supabase for the Blogen Shopify CMS project, including database schema, authentication, and API configuration.

## 📋 Current Setup

- **Project URL**: [https://supabase.com/dashboard/project/nultoplmuhasjpiythdq](https://supabase.com/dashboard/project/nultoplmuhasjpiythdq)
- **Project ID**: `nultoplmuhasjpiythdq`
- **Database**: PostgreSQL 15
- **Region**: US East (Virginia)
- **Status**: ✅ Active

## 🔗 Connection Information

### Environment Variables

```bash
# Public (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://nultoplmuhasjpiythdq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_anon_key]

# Private (Backend)
SUPABASE_SERVICE_ROLE_KEY=[your_service_role_key]
DATABASE_URL=[your_database_url]
```

### API Endpoints

- **REST API**: `https://nultoplmuhasjpiythdq.supabase.co/rest/v1/`
- **GraphQL**: `https://nultoplmuhasjpiythdq.supabase.co/graphql/v1`
- **Realtime**: `wss://nultoplmuhasjpiythdq.supabase.co/realtime/v1/websocket`
- **Storage**: `https://nultoplmuhasjpiythdq.supabase.co/storage/v1`

## 🏗️ Database Schema

### Core Tables

#### 1. Profiles Table (User Extensions)

```sql
-- Extends auth.users with additional profile information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  shopify_store_url TEXT,
  shopify_access_token TEXT, -- Encrypted
  role TEXT DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor', 'contributor', 'viewer')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  usage_quota INTEGER DEFAULT 1000,
  usage_current INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### 2. Posts Table

```sql
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content JSONB NOT NULL, -- Lexical/TipTap editor state
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  
  -- AI Generation Metadata
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_prompt TEXT,
  ai_model TEXT,
  generation_tokens INTEGER,
  
  -- Shopify Integration
  shopify_blog_id BIGINT,
  shopify_article_id BIGINT,
  shopify_published BOOLEAN DEFAULT FALSE,
  shopify_url TEXT,
  
  -- Publishing
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  
  -- SEO & Analytics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_published_at ON public.posts(published_at);
CREATE INDEX idx_posts_tags ON public.posts USING GIN(tags);
CREATE INDEX idx_posts_shopify_blog ON public.posts(shopify_blog_id);

-- Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authors can manage own posts" ON public.posts
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Public can view published posts" ON public.posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all posts" ON public.posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
```

#### 3. Categories Table

```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id),
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  shopify_category_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Self-referencing constraint to prevent circular references
CREATE OR REPLACE FUNCTION prevent_circular_category_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    -- Check if this would create a circular reference
    WITH RECURSIVE category_tree AS (
      SELECT id, parent_id, 1 as level
      FROM public.categories 
      WHERE id = NEW.parent_id
      
      UNION ALL
      
      SELECT c.id, c.parent_id, ct.level + 1
      FROM public.categories c
      JOIN category_tree ct ON c.id = ct.parent_id
      WHERE ct.level < 10 -- Prevent infinite recursion
    )
    SELECT 1 FROM category_tree WHERE id = NEW.id;
    
    IF FOUND THEN
      RAISE EXCEPTION 'Circular reference detected in category hierarchy';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_category_circular_ref
  BEFORE INSERT OR UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION prevent_circular_category_reference();
```

#### 4. Media Library Table

```sql
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Shopify Integration
  shopify_image_id BIGINT,
  shopify_alt TEXT,
  shopify_src TEXT,
  
  -- Organization
  folder TEXT DEFAULT 'uploads',
  tags TEXT[],
  
  -- Metadata
  exif_data JSONB,
  blurhash TEXT, -- For progressive image loading
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_media_uploaded_by ON public.media(uploaded_by);
CREATE INDEX idx_media_mime_type ON public.media(mime_type);
CREATE INDEX idx_media_folder ON public.media(folder);
CREATE INDEX idx_media_tags ON public.media USING GIN(tags);

-- Row Level Security
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all media" ON public.media
  FOR SELECT USING (true);

CREATE POLICY "Users can upload media" ON public.media
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can manage own media" ON public.media
  FOR ALL USING (auth.uid() = uploaded_by);
```

#### 5. Shopify Stores Table

```sql
CREATE TABLE public.shopify_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_domain TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL, -- Encrypted
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Store Information
  store_name TEXT,
  email TEXT,
  currency TEXT,
  timezone TEXT,
  plan_name TEXT,
  domain TEXT,
  
  -- API Information
  api_version TEXT DEFAULT '2024-01',
  webhook_verified BOOLEAN DEFAULT FALSE,
  
  -- Blog Configuration
  default_blog_id BIGINT,
  blog_settings JSONB DEFAULT '{}',
  
  -- Sync Status
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'synced', 'error')),
  sync_error TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.shopify_stores ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own stores" ON public.shopify_stores
  FOR ALL USING (auth.uid() = owner_id);
```

### Utility Functions

#### 1. Update Timestamp Function

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables that need updated_at
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER shopify_stores_updated_at
  BEFORE UPDATE ON public.shopify_stores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

#### 2. Generate Slug Function

```sql
CREATE OR REPLACE FUNCTION public.slugify(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-generate slug for posts
CREATE OR REPLACE FUNCTION public.generate_post_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base slug from title
  base_slug := public.slugify(NEW.title);
  final_slug := base_slug;
  
  -- Check for conflicts and append number if needed
  WHILE EXISTS (
    SELECT 1 FROM public.posts 
    WHERE slug = final_slug 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
  ) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_generate_slug
  BEFORE INSERT OR UPDATE OF title ON public.posts
  FOR EACH ROW 
  WHEN (NEW.slug IS NULL OR NEW.slug = '' OR OLD.title IS DISTINCT FROM NEW.title)
  EXECUTE FUNCTION public.generate_post_slug();
```

## 🔐 Authentication Setup

### Auth Configuration

```sql
-- Enable auth in Supabase dashboard or via SQL
-- Configure auth providers (email, OAuth)

-- Custom auth settings
UPDATE auth.config SET
  site_url = 'https://your-domain.vercel.app',
  uri_allow_list = '{"https://your-domain.vercel.app","http://localhost:3000"}';
```

### Row Level Security (RLS) Policies

```sql
-- Example: Blog post visibility policy
CREATE POLICY "Blog posts are viewable by everyone" ON public.posts
  FOR SELECT USING (
    status = 'published' 
    OR (auth.uid() = author_id)
    OR (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
      )
    )
  );
```

## 🔧 Supabase CLI Setup

### Installation & Initialization

```bash
# Install Supabase CLI
npm install -g supabase

# Check version
supabase --version

# Login to Supabase
supabase login

# Link project
supabase link --project-ref nultoplmuhasjpiythdq

# Initialize local development
supabase init
```

### Database Operations

```bash
# Pull remote schema to local
supabase db pull

# Generate TypeScript types
supabase gen types typescript --project-id nultoplmuhasjpiythdq > types/supabase.ts

# Reset database (WARNING: destructive)
supabase db reset

# Push local schema to remote
supabase db push

# Create and run migrations
supabase migration new create_posts_table
supabase db push
```

### Local Development

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Check status
supabase status
```

## 📡 API Integration

### Client Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side client with service role
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Authentication Helpers

```typescript
// lib/auth.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function getServerSession() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getProfile(userId: string) {
  const supabase = createServerComponentClient({ cookies });
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return profile;
}
```

### Real-time Subscriptions

```typescript
// hooks/useRealtime.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function usePostSubscription(callback: (payload: any) => void) {
  useEffect(() => {
    const subscription = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        callback
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [callback]);
}
```

## 📦 Storage Configuration

### Bucket Setup

```sql
-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true);

-- Storage policies
CREATE POLICY "Public can view media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### File Upload Helper

```typescript
// lib/storage.ts
import { supabase } from './supabase';

export async function uploadFile(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('media')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  return { path: data.path, url: publicUrl };
}
```

## 🔧 Maintenance & Monitoring

### Database Maintenance

```sql
-- Analyze table statistics
ANALYZE public.posts;

-- Vacuum tables
VACUUM ANALYZE public.posts;

-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Performance Monitoring

```sql
-- Slow query monitoring
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Index usage
SELECT 
  t.tablename,
  indexname,
  c.reltuples AS num_rows,
  pg_size_pretty(pg_relation_size(quote_ident(t.tablename)::text)) AS table_size,
  pg_size_pretty(pg_relation_size(quote_ident(indexrelname)::text)) AS index_size,
  CASE WHEN indisunique THEN 'Y' ELSE 'N' END AS unique,
  idx_scan AS number_of_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_tables t
LEFT OUTER JOIN pg_class c ON c.relname = t.tablename
LEFT OUTER JOIN (
  SELECT c.relname AS ctablename, ipg.relname AS indexname, x.indnatts AS number_of_columns, idx_scan, idx_tup_read, idx_tup_fetch, indexrelname, indisunique FROM pg_index x
  JOIN pg_class c ON c.oid = x.indrelid
  JOIN pg_class ipg ON ipg.oid = x.indexrelid
  JOIN pg_stat_all_indexes psai ON x.indexrelid = psai.indexrelid
) AS foo ON t.tablename = foo.ctablename
WHERE t.schemaname = 'public'
ORDER BY 1, 2;
```

## 📞 Support & Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Auth Helpers Documentation](https://supabase.com/docs/guides/auth/auth-helpers)