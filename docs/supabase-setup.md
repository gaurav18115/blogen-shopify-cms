# Supabase Setup & Configuration

Complete guide for setting up Supabase as the backend for your Blogen Shopify CMS application.

## 🚀 Quick Start

### 1. Create Supabase Project
1. Visit [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `blogen-shopify-cms`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get API Credentials
Once your project is ready:
1. Go to Settings → API
2. Copy the following to your `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## 🗄️ Database Schema Setup

### Core Tables Structure

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- User Profiles Table (extends auth.users)
-- ============================================================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    shopify_store_url TEXT,
    shopify_access_token TEXT, -- Will be encrypted
    role TEXT DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor', 'contributor', 'viewer')),
    bio TEXT,
    social_links JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Categories Table
-- ============================================================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id),
    color TEXT DEFAULT '#6366f1',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Blog Posts Table
-- ============================================================================
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content JSONB NOT NULL, -- Rich text content in structured format
    featured_image TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    tags TEXT[] DEFAULT '{}',
    category_id UUID REFERENCES public.categories(id),
    
    -- SEO Fields
    meta_title TEXT,
    meta_description TEXT,
    canonical_url TEXT,
    
    -- Shopify Integration
    shopify_blog_id BIGINT,
    shopify_article_id BIGINT,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'synced', 'error')),
    sync_error TEXT,
    
    -- Publishing
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Media Library Table
-- ============================================================================
CREATE TABLE public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    description TEXT,
    width INTEGER,
    height INTEGER,
    uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
    folder TEXT DEFAULT 'uploads',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Shopify Stores Table
-- ============================================================================
CREATE TABLE public.shopify_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_domain TEXT UNIQUE NOT NULL,
    access_token TEXT NOT NULL, -- Will be encrypted
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    store_name TEXT,
    email TEXT,
    currency TEXT,
    timezone TEXT,
    plan_name TEXT,
    country_code TEXT,
    webhook_verified BOOLEAN DEFAULT FALSE,
    
    -- Store configuration
    blog_settings JSONB DEFAULT '{}',
    sync_settings JSONB DEFAULT '{}',
    
    -- Status tracking
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'paused', 'error', 'disconnected')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Comments Table (for blog comments)
-- ============================================================================
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Analytics Table
-- ============================================================================
CREATE TABLE public.analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id),
    event_type TEXT NOT NULL, -- 'view', 'like', 'share', 'click'
    user_id UUID REFERENCES public.profiles(id),
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_published_at ON public.posts(published_at);
CREATE INDEX idx_posts_category_id ON public.posts(category_id);
CREATE INDEX idx_posts_tags ON public.posts USING GIN(tags);
CREATE INDEX idx_posts_slug ON public.posts(slug);

CREATE INDEX idx_media_uploaded_by ON public.media(uploaded_by);
CREATE INDEX idx_media_folder ON public.media(folder);
CREATE INDEX idx_media_tags ON public.media USING GIN(tags);

CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_status ON public.comments(status);

CREATE INDEX idx_analytics_post_id ON public.analytics(post_id);
CREATE INDEX idx_analytics_event_type ON public.analytics(event_type);
CREATE INDEX idx_analytics_created_at ON public.analytics(created_at);
```

## 🔐 Row Level Security (RLS) Policies

### Enable RLS on all tables
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
```

### Profiles Policies
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );
```

### Posts Policies
```sql
-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts" ON public.posts
    FOR SELECT USING (status = 'published');

-- Authors can manage their own posts
CREATE POLICY "Authors can manage own posts" ON public.posts
    FOR ALL USING (auth.uid() = author_id);

-- Editors and above can manage all posts
CREATE POLICY "Editors can manage all posts" ON public.posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
        )
    );

-- Contributors can create posts but only edit their own
CREATE POLICY "Contributors can create posts" ON public.posts
    FOR INSERT WITH CHECK (
        auth.uid() = author_id AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('contributor', 'editor', 'admin', 'super_admin')
        )
    );
```

### Media Policies
```sql
-- Users can view all media
CREATE POLICY "Users can view all media" ON public.media
    FOR SELECT USING (TRUE);

-- Authenticated users can upload media
CREATE POLICY "Authenticated users can upload media" ON public.media
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = uploaded_by);

-- Users can delete their own uploads, admins can delete any
CREATE POLICY "Users can delete own media" ON public.media
    FOR DELETE USING (
        auth.uid() = uploaded_by OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );
```

## 🔄 Database Functions & Triggers

### Auto-update timestamp function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at column
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON public.posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON public.categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopify_stores_updated_at 
    BEFORE UPDATE ON public.shopify_stores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Create user profile function
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 📧 Authentication Setup

### Configure Auth Providers

1. **Email/Password** (enabled by default)
2. **Google OAuth**:
   ```bash
   # In Supabase Dashboard → Authentication → Providers
   # Enable Google
   # Add your Google OAuth credentials
   ```

3. **GitHub OAuth**:
   ```bash
   # In Supabase Dashboard → Authentication → Providers
   # Enable GitHub
   # Add your GitHub OAuth app credentials
   ```

### Email Templates
Customize email templates in Authentication → Email Templates:
- Confirmation email
- Password reset
- Magic link

## 🔐 Security Configuration

### JWT Settings
```sql
-- In Authentication → Settings
-- JWT expiry: 3600 (1 hour)
-- Refresh token expiry: 604800 (1 week)
```

### Rate Limiting
Configure in Authentication → Rate Limits:
- Email signups: 10 per hour
- Password resets: 5 per hour
- Email confirmations: 10 per hour

## 📁 Storage Setup

### Create Storage Buckets
```sql
-- Create public bucket for general uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true);

-- Create private bucket for user avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Create bucket for post featured images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('featured-images', 'featured-images', true);
```

### Storage Policies
```sql
-- Allow authenticated users to upload to uploads bucket
CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'uploads' AND 
        auth.uid() IS NOT NULL
    );

-- Allow users to update their own uploads
CREATE POLICY "Users can update own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'uploads' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id IN ('uploads', 'avatars', 'featured-images'));
```

## 🛠️ Local Development Setup

### Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init

# Link to your project
supabase link --project-ref your-project-id

# Start local development
supabase start

# Apply migrations
supabase db push
```

### Development Environment Variables
```env
# Local Supabase (when running supabase start)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
```

## 🔄 Shopify Integration

### Webhook Configuration
Set up webhooks in your Supabase Edge Functions:

```sql
-- Create webhook table for tracking
CREATE TABLE public.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL, -- 'shopify', 'stripe', etc.
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Shopify Sync Functions
Create Edge Functions for Shopify operations:
- `sync-to-shopify` - Publish posts to Shopify
- `shopify-webhook` - Handle Shopify webhooks
- `validate-shopify-store` - Validate store connections

## 📊 Monitoring & Analytics

### Database Monitoring
- Set up alerts in Supabase Dashboard
- Monitor query performance
- Track storage usage
- Monitor authentication events

### Custom Analytics
The analytics table tracks:
- Page views
- User interactions
- Content performance
- Conversion metrics

## 🔧 Maintenance & Backups

### Automated Backups
Supabase automatically backs up your database daily. For additional protection:
1. Enable Point-in-Time Recovery (PITR)
2. Set up manual backup schedules
3. Test restore procedures regularly

### Performance Optimization
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM posts WHERE status = 'published';

-- Update table statistics
ANALYZE public.posts;

-- Vacuum tables periodically (handled automatically)
VACUUM ANALYZE public.posts;
```

## 📞 Support & Resources

### Documentation Links
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Auth Helpers Documentation](https://supabase.com/docs/guides/auth/auth-helpers)

### Troubleshooting
- Check Supabase project status
- Review RLS policies for access issues
- Monitor Edge Function logs
- Verify environment variables

### Getting Help
- Create an issue on [GitHub](https://github.com/gaurav18115/blogen-shopify-cms/issues)
- Join [Supabase Discord](https://discord.supabase.com)
- Check [deployment status guide](./deployment-status.md)

---

**Next Steps**: After completing this setup, proceed to [Vercel Deployment](./vercel-deployment.md)