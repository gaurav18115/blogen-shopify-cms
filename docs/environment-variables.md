# Environment Variables Configuration

This guide covers all environment variables required for the Blogen Shopify CMS application.

## 📋 Required Environment Variables

### Next.js Configuration

Create a `.env.local` file in your project root with the following variables:

```env
# =============================================================================
# Supabase Configuration
# =============================================================================

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase anonymous/public key (safe to expose in browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase service role key (SERVER-SIDE ONLY - never expose in browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =============================================================================
# Shopify Integration
# =============================================================================

# Shopify App API Key (from your Shopify Partner dashboard)
SHOPIFY_APP_KEY=your_shopify_app_api_key

# Shopify App Secret (from your Shopify Partner dashboard)
SHOPIFY_APP_SECRET=your_shopify_app_secret

# Shopify Webhook Secret (for webhook verification)
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_key

# Optional: Shopify API Version (defaults to 2024-01)
SHOPIFY_API_VERSION=2024-01

# =============================================================================
# Application Security
# =============================================================================

# Encryption key for sensitive data (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your_32_character_encryption_key_here

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_nextauth_secret_here

# Application URL (for OAuth redirects and webhooks)
NEXTAUTH_URL=http://localhost:3000

# =============================================================================
# Email Configuration (Optional)
# =============================================================================

# SMTP settings for email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# From email address
FROM_EMAIL=noreply@your-domain.com

# =============================================================================
# CDN & Storage (Optional)
# =============================================================================

# Custom CDN URL for media assets
NEXT_PUBLIC_CDN_URL=https://your-cdn-domain.com

# Maximum file upload size (in MB)
MAX_FILE_SIZE=10

# =============================================================================
# Analytics & Monitoring (Optional)
# =============================================================================

# Google Analytics tracking ID
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# Vercel Analytics (automatically configured on Vercel)
# NEXT_PUBLIC_VERCEL_ANALYTICS_ID=auto

# Sentry DSN for error tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## 🔧 Environment-Specific Configurations

### Development Environment (.env.local)
```env
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXTAUTH_URL=http://localhost:3000
```

### Production Environment
```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXTAUTH_URL=https://your-domain.com
```

## 🔐 Security Best Practices

### Critical Security Rules
1. **Never commit `.env` files** to version control
2. **Use different keys** for development and production
3. **Rotate secrets regularly** especially in production
4. **Limit service role key usage** to server-side operations only
5. **Use environment-specific URLs** and configurations

### Key Security Considerations

| Variable | Security Level | Notes |
|----------|----------------|-------|
| `NEXT_PUBLIC_*` | Public | Safe to expose in browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Critical | Server-side only, full database access |
| `SHOPIFY_APP_SECRET` | Critical | Used for webhook verification |
| `ENCRYPTION_KEY` | Critical | Used for encrypting sensitive data |
| `NEXTAUTH_SECRET` | Critical | Used for session management |

## 🛠️ Setup Instructions

### 1. Copy Environment Template
```bash
# Copy the example file
cp .env.example .env.local

# Edit with your actual values
nano .env.local
```

### 2. Generate Required Secrets
```bash
# Generate encryption key
openssl rand -hex 32

# Generate NextAuth secret
openssl rand -base64 32
```

### 3. Get Supabase Credentials
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon key
5. Copy the service_role key (keep this secure!)

### 4. Set Up Shopify App
1. Visit [Shopify Partners](https://partners.shopify.com)
2. Create a new app
3. Get your API key and secret
4. Configure OAuth redirect URLs
5. Set up webhook endpoints

## 🚀 Deployment Configuration

### Vercel Deployment
When deploying to Vercel, add these environment variables in your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all production environment variables
4. Ensure proper environment targeting (Development/Preview/Production)

### Environment Variable Validation
The application includes runtime validation for required environment variables. Missing or invalid variables will cause startup errors with helpful error messages.

## 🔍 Troubleshooting

### Common Issues

**Issue**: "Invalid Supabase URL"
- **Solution**: Ensure URL includes `https://` and ends with `.supabase.co`

**Issue**: "Shopify webhook verification failed"
- **Solution**: Verify `SHOPIFY_WEBHOOK_SECRET` matches your Shopify app settings

**Issue**: "Database connection failed"
- **Solution**: Check `SUPABASE_SERVICE_ROLE_KEY` permissions and project status

### Validation Script
Run this script to validate your environment variables:

```bash
npm run validate-env
```

## 📞 Support & Resources

### Documentation Links
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Environment Variables](https://supabase.com/docs/guides/hosting/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Shopify App Environment Setup](https://shopify.dev/apps/auth/oauth/getting-started)

### Getting Help
- Create an issue on [GitHub](https://github.com/gaurav18115/blogen-shopify-cms/issues)
- Check the [troubleshooting guide](./deployment-status.md)
- Review the [Supabase setup guide](./supabase-setup.md)

---

**Important**: Keep your production environment variables secure and never share them publicly.