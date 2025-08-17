# Blogen Shopify CMS Setup Guide

## Prerequisites

1. **Node.js 18+** installed
2. **Shopify Partner Account** for creating the app
3. **Supabase Account** for the database
4. **Git** for version control

## 1. Shopify App Setup

### Create Shopify Partner Account
1. Go to [Shopify Partners](https://partners.shopify.com/)
2. Sign up or log in
3. Create a new app

### Configure Your App
1. In your Partner dashboard, click "Create app"
2. Choose "Custom app"
3. Fill in app details:
   - **App name**: Blogen CMS
   - **App URL**: `http://localhost:3000` (for development)
   - **Allowed redirection URL(s)**: `http://localhost:3000/api/auth/shopify/callback`

### Get Your App Credentials
1. Copy your **API key** and **API secret key**
2. Note your **App URL** and **Redirection URLs**

## 2. Supabase Setup

### Create Supabase Project
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Wait for the database to be ready

### Get Your Supabase Credentials
1. Go to **Settings** > **API**
2. Copy your **Project URL**
3. Copy your **anon/public key**
4. Copy your **service_role key** (keep this secret!)

### Run Database Migration
1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
4. Run migrations: `supabase db push`

## 3. Environment Setup

### Copy Environment Variables
```bash
cp .env.example .env.local
```

### Fill in Your Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Shopify OAuth Configuration
SHOPIFY_APP_KEY=your_shopify_app_api_key
SHOPIFY_APP_SECRET=your_shopify_app_api_secret
SHOPIFY_SCOPES=read_content,write_content,read_themes,write_themes
SHOPIFY_APP_URL=http://localhost:3000

# Session Management (generate a random 32-character string)
SESSION_SECRET=your_32_character_session_secret_key

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Environment
NODE_ENV=development
```

### Generate Secrets
For session secrets, you can generate them using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Install Dependencies

```bash
npm install
```

## 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and click "Connect Your Shopify Store" to test the authentication flow.

## 6. Testing the Setup

1. Go to `http://localhost:3000`
2. Click "Connect Your Shopify Store"
3. Enter a test store domain (you can use development stores from your Partner account)
4. Complete the OAuth flow
5. You should be redirected to the dashboard

## Troubleshooting

### Common Issues

1. **"Invalid shop domain" error**
   - Make sure you're entering just the store name (e.g., "my-store" not "my-store.myshopify.com")

2. **"Failed to initiate OAuth flow" error**
   - Check your Shopify app credentials
   - Ensure your redirect URLs are correct in the Shopify Partner dashboard

3. **Database connection errors**
   - Verify your Supabase credentials
   - Make sure the database migration was successful

4. **Session issues**
   - Ensure SESSION_SECRET is set and is 32 characters long
   - Check that cookies are working in your browser

### Development Stores

For testing, create development stores in your Shopify Partner dashboard:
1. Go to **Stores** in your Partner dashboard
2. Click "Add store"
3. Choose "Development store"
4. Use these stores for testing your authentication flow

## Production Deployment

When deploying to production:

1. Update your Shopify app settings with production URLs
2. Set production environment variables
3. Ensure your Supabase project is in production mode
4. Use HTTPS for all URLs

## Need Help?

- Check the [Shopify App Development docs](https://shopify.dev/docs/apps)
- Review [Supabase documentation](https://supabase.com/docs)
- Create an issue in this repository for project-specific questions