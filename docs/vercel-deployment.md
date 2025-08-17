# Vercel Deployment Guide

Complete guide for deploying your Blogen Shopify CMS application to Vercel with optimal configuration and performance.

## 🚀 Quick Deployment

### Prerequisites
- GitHub repository with your code
- Vercel account (free tier available)
- Completed [Supabase setup](./supabase-setup.md)
- [Environment variables](./environment-variables.md) configured

### One-Click Deployment
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gaurav18115/blogen-shopify-cms)

## 📋 Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your repository has these files:
```
blogen-shopify-cms/
├── .env.example           # Template for environment variables
├── vercel.json           # Vercel configuration (optional)
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies and scripts
└── src/                  # Application source code
```

### 2. Connect to Vercel

#### Option A: Vercel Dashboard
1. Visit [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import from Git repository
4. Select your GitHub repository
5. Configure project settings

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account/team
# - Link to existing project? No (for first deployment)
# - What's your project's name? blogen-shopify-cms
# - In which directory is your code located? ./
```

### 3. Configure Environment Variables

#### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all variables from your `.env.local` file:

```env
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

SHOPIFY_APP_KEY=your-shopify-app-key
SHOPIFY_APP_SECRET=your-shopify-app-secret
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret

ENCRYPTION_KEY=your-production-encryption-key
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app

# Optional: Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@your-domain.com

# Optional: Analytics
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

#### Environment Targeting:
- **Development**: For preview deployments from feature branches
- **Preview**: For preview deployments from pull requests
- **Production**: For deployments from main/master branch

### 4. Configure Custom Domain (Optional)

#### Add Custom Domain:
1. Go to Project Settings → Domains
2. Add your domain (e.g., `yourblog.com`)
3. Configure DNS records:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

#### SSL Certificate:
Vercel automatically provisions SSL certificates for all domains.

## ⚙️ Advanced Configuration

### Vercel Configuration File (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/admin",
      "destination": "/dashboard",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/webhooks/shopify",
      "destination": "/api/webhooks/shopify"
    }
  ]
}
```

### Next.js Configuration (`next.config.js`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'your-project.supabase.co',
      'cdn.shopify.com',
      'images.unsplash.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      }
    ]
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom webpack config if needed
    return config;
  },
  
  // Redirects and rewrites
  async redirects() {
    return [
      {
        source: '/old-blog/:slug*',
        destination: '/blog/:slug*',
        permanent: true,
      },
    ];
  },
  
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://api.external.com/:path*',
      },
    ];
  },
}

module.exports = nextConfig;
```

## 🔄 Deployment Workflow

### Automatic Deployments
Vercel automatically deploys when you:
1. Push to main branch → Production deployment
2. Push to feature branch → Preview deployment
3. Open pull request → Preview deployment with unique URL

### Manual Deployment
```bash
# Deploy current branch
vercel

# Deploy to production
vercel --prod

# Deploy with specific environment
vercel --env production
```

### GitHub Integration
Enable automatic deployments:
1. Connect GitHub repository in Vercel dashboard
2. Configure branch settings:
   - **Production Branch**: `main` or `master`
   - **Preview Branches**: All other branches
3. Enable automatic deployments on push

## 📊 Performance Optimization

### Build Optimization
```json
{
  "scripts": {
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "build:production": "NODE_ENV=production next build"
  }
}
```

### Edge Configuration
```javascript
// In pages/api or app/api routes
export const config = {
  runtime: 'edge',
  regions: ['iad1'], // Closest to your users
}
```

### Caching Strategy
```javascript
// In next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=43200'
          }
        ]
      }
    ];
  }
};
```

## 🔍 Monitoring & Analytics

### Vercel Analytics
Enable in project settings:
1. Go to Analytics tab
2. Enable Vercel Analytics
3. View real-time metrics and performance data

### Performance Monitoring
```javascript
// Add to pages/_app.js or app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### Error Tracking with Sentry
```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check build logs in Vercel dashboard
# Common issues:
# 1. Missing environment variables
# 2. TypeScript errors
# 3. Missing dependencies
# 4. Import path issues

# Fix TypeScript errors
npm run type-check

# Update dependencies
npm update
```

#### Environment Variable Issues
```bash
# Verify environment variables are set
vercel env ls

# Add missing environment variables
vercel env add VARIABLE_NAME

# Pull environment variables for local development
vercel env pull .env.local
```

#### Function Timeout Issues
```json
{
  "functions": {
    "pages/api/long-running-task.js": {
      "maxDuration": 60
    }
  }
}
```

#### Memory Issues
```json
{
  "functions": {
    "pages/api/memory-intensive.js": {
      "memory": 3008
    }
  }
}
```

### Performance Issues

#### Slow Build Times
```bash
# Enable build cache
VERCEL_ANALYTICS_ID=true npm run build

# Optimize dependencies
npm run build:analyze
```

#### Large Bundle Size
```javascript
// Use dynamic imports
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});

// Code splitting by route
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  ssr: false,
});
```

## 🔐 Security Configuration

### Security Headers
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
        }
      ]
    }
  ]
}
```

### Environment Security
- Use different secrets for production
- Enable branch protection on main branch
- Set up deployment protection rules
- Configure team access controls

## 📞 Support & Resources

### Vercel Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Troubleshooting Guide](https://vercel.com/docs/concepts/deployments/troubleshoot-a-build)

### Performance Resources
- [Vercel Analytics](https://vercel.com/analytics)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Community Support
- [Vercel Discord](https://discord.gg/vercel)
- [Next.js Discussions](https://github.com/vercel/next.js/discussions)
- [GitHub Issues](https://github.com/gaurav18115/blogen-shopify-cms/issues)

## 🎯 Production Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Build passes locally
- [ ] Tests are passing
- [ ] Security headers configured
- [ ] Custom domain configured (if applicable)

### Post-Deployment
- [ ] Verify deployment is live
- [ ] Test critical user flows
- [ ] Check performance metrics
- [ ] Monitor error logs
- [ ] Verify webhooks are working
- [ ] Test Shopify integration

### Ongoing Maintenance
- [ ] Monitor performance metrics
- [ ] Review error logs regularly
- [ ] Update dependencies monthly
- [ ] Review security headers
- [ ] Monitor usage and costs

---

**Next Steps**: After deployment, check the [Deployment Status Guide](./deployment-status.md) for monitoring and troubleshooting information.