# Vercel Deployment Guide

## 🚀 Overview

This guide covers the complete deployment process for Blogen Shopify CMS on Vercel, including setup, configuration, and troubleshooting.

## 📋 Current Deployment Status

- **Project**: `mindweave/blogen-shopify-cms`
- **URL**: [https://vercel.com/mindweave/blogen-shopify-cms](https://vercel.com/mindweave/blogen-shopify-cms)
- **Latest Deployment**: `https://blogen-shopify-7bijkemyo-mindweave.vercel.app`
- **Status**: ❌ Error (requires application code)
- **Team**: Mindweave Tech

## 🛠️ Initial Setup

### 1. Project Linking

```bash
# Link local project to Vercel
vercel link

# Or initialize new project
vercel
```

### 2. Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "next.config.js",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "SHOPIFY_APP_KEY": "@shopify_app_key",
    "SHOPIFY_APP_SECRET": "@shopify_app_secret",
    "OPENAI_API_KEY": "@openai_api_key",
    "ANTHROPIC_API_KEY": "@anthropic_api_key"
  },
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

## 🔐 Environment Variables Setup

### Required Environment Variables

#### Supabase Configuration

```bash
# Add to Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Value: https://nultoplmuhasjpiythdq.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Value: [Your Supabase Anon Key]

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Value: [Your Supabase Service Role Key]
```

#### Shopify Integration

```bash
vercel env add SHOPIFY_APP_KEY
# Value: [Your Shopify App Key]

vercel env add SHOPIFY_APP_SECRET
# Value: [Your Shopify App Secret]

vercel env add SHOPIFY_WEBHOOK_SECRET
# Value: [Your Webhook Secret]
```

#### AI Services

```bash
vercel env add OPENAI_API_KEY
# Value: [Your OpenAI API Key]

vercel env add ANTHROPIC_API_KEY
# Value: [Your Anthropic API Key]
```

#### Security & Encryption

```bash
vercel env add ENCRYPTION_KEY
# Value: [32-byte encryption key]

vercel env add NEXTAUTH_SECRET
# Value: [NextAuth secret for production]

vercel env add NEXTAUTH_URL
# Value: https://your-domain.vercel.app
```

### Setting Environment Variables via CLI

```bash
# List all environment variables
vercel env ls

# Add environment variable (interactive)
vercel env add VARIABLE_NAME

# Add with value
echo "variable_value" | vercel env add VARIABLE_NAME

# Remove environment variable
vercel env rm VARIABLE_NAME

# Pull environment variables to local
vercel env pull .env.local
```

## 🏗️ Build Configuration

### Next.js Configuration

Create `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'cdn.shopify.com',
      'nultoplmuhasjpiythdq.supabase.co',
      'avatars.githubusercontent.com'
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/shopify/:path*',
        destination: '/api/shopify/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "vercel-deploy": "vercel --prod"
  }
}
```

## 🚀 Deployment Process

### Automatic Deployment (Recommended)

```bash
# Connect GitHub repository for automatic deployments
# 1. Go to Vercel dashboard
# 2. Import GitHub repository
# 3. Configure build settings
# 4. Enable automatic deployments on push
```

### Manual Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy with specific name
vercel --name blogen-shopify-cms

# Deploy from specific branch
git checkout main
vercel --prod
```

### Preview Deployments

```bash
# Create preview deployment
vercel

# List all deployments
vercel ls

# Promote preview to production
vercel promote https://deployment-url
```

## 📊 Monitoring & Analytics

### Vercel Analytics Setup

```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Function Monitoring

```javascript
// Enable function logging
export const config = {
  runtime: 'nodejs18.x',
  maxDuration: 30,
};

// Add logging to API routes
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  logger.info('API route called', { path: request.url });
  
  try {
    // Your API logic
  } catch (error) {
    logger.error('API error', { error });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## 🔧 Troubleshooting

### Common Deployment Issues

#### 1. Build Failures

```bash
# Check build logs
vercel logs

# Local build test
npm run build

# Check for TypeScript errors
npm run type-check
```

#### 2. Environment Variable Issues

```bash
# Verify environment variables
vercel env ls

# Test locally with production env
vercel env pull .env.local
npm run dev
```

#### 3. Function Timeout Issues

```javascript
// Increase timeout in vercel.json
{
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 60
    }
  }
}
```

#### 4. Domain Configuration

```bash
# Add custom domain
vercel domains add yourdomain.com

# Check domain status
vercel domains ls

# Remove domain
vercel domains rm yourdomain.com
```

### Error Diagnostics

```bash
# View deployment logs
vercel logs https://deployment-url

# Check function logs
vercel logs --follow

# Debug build issues
vercel build --debug
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/vercel.yml`:

```yaml
name: Vercel Production Deployment
on:
  push:
    branches:
      - main
env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
jobs:
  Deploy-Production:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Required GitHub Secrets

```bash
# Add these secrets to GitHub repository settings
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

## 📈 Performance Optimization

### Next.js Optimizations

```javascript
// next.config.js
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Bundle analysis
  experimental: {
    bundlePagesRouterDependencies: true,
  },
};
```

### Caching Strategy

```javascript
// API routes caching
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
```

## 🔒 Security Configuration

### Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

## 📞 Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Troubleshooting Guide](https://vercel.com/docs/concepts/deployments/troubleshoot-a-build)