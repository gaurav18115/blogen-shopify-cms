# Environment Variables Configuration

## 🔐 Overview

Complete guide to environment variables required for Blogen Shopify CMS, including development, staging, and production configurations.

## 📋 Required Environment Variables

### Supabase Configuration

```bash
# Public variables (safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://nultoplmuhasjpiythdq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Private variables (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/postgres
```

### Shopify Integration

```bash
# Shopify App Configuration
SHOPIFY_APP_KEY=your_shopify_app_key
SHOPIFY_APP_SECRET=your_shopify_app_secret
SHOPIFY_SCOPES=read_content,write_content,read_products,write_products

# Webhook Security
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_key

# OAuth Configuration
SHOPIFY_REDIRECT_URI=https://your-domain.vercel.app/api/auth/shopify/callback
```

### AI Services

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_ORGANIZATION=org-...
OPENAI_PROJECT=proj_...

# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-api...

# AI Model Configuration
DEFAULT_AI_MODEL=gpt-4
AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.7
```

### Email Services - Brevo (SendinBlue)

```bash
# SMTP Configuration for transactional emails
# Get from: https://app.brevo.com/settings/keys/api
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_smtp_login  # Format: xxxxxxx@smtp-brevo.com
SMTP_PASS=your_brevo_smtp_key    # Format: xsmtpsib-xxxxxx...
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Blogen Shopify CMS

# Brevo API for campaigns and advanced features
BREVO_API_KEY=your_encoded_brevo_api_key  # Base64 encoded API key
BREVO_API_URL=https://api.brevo.com/v3

# Email template configuration
# Create templates in Brevo dashboard and set their IDs here
EMAIL_VERIFICATION_TEMPLATE_ID=1
PASSWORD_RESET_TEMPLATE_ID=2
WELCOME_EMAIL_TEMPLATE_ID=3
BLOG_NOTIFICATION_TEMPLATE_ID=4

# Contact lists for newsletters and campaigns
NEWS_LETTER_LIST_ID=2
USER_NOTIFICATIONS_LIST_ID=7

# Email sending limits and configuration
EMAIL_DAILY_LIMIT=300
EMAIL_RATE_LIMIT=100
EMAIL_RETRY_ATTEMPTS=3
```

### Authentication & Security

```bash
# NextAuth.js Configuration
NEXTAUTH_SECRET=your-super-secret-jwt-secret-minimum-32-characters
NEXTAUTH_URL=https://your-domain.vercel.app

# Encryption & Security
ENCRYPTION_KEY=your-32-byte-encryption-key-for-sensitive-data
JWT_SECRET=your-jwt-secret-for-api-authentication

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
```

### External Services

```bash
# Email Service - Brevo (SendinBlue)
# Get credentials from: https://app.brevo.com/settings/keys/api
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_smtp_login
SMTP_PASS=your_brevo_smtp_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your App Name

# Brevo API for advanced email features
BREVO_API_KEY=your_brevo_api_key
BREVO_API_URL=https://api.brevo.com/v3

# Email template IDs (create in Brevo dashboard)
EMAIL_VERIFICATION_TEMPLATE_ID=1
PASSWORD_RESET_TEMPLATE_ID=2
WELCOME_EMAIL_TEMPLATE_ID=3
NEWS_LETTER_LIST_ID=2

# Analytics & Monitoring
VERCEL_ANALYTICS_ID=your_analytics_id
SENTRY_DSN=https://...@sentry.io/...

# CDN & Storage
CDN_URL=https://your-cdn-domain.com
UPLOAD_MAX_SIZE=10485760
```

## 📦 Required Dependencies

To use the Brevo email functionality, install the required packages:

```bash
# Install email dependencies
npm install nodemailer @types/nodemailer

# Optional: Install Brevo SDK for advanced features
npm install sib-api-v3-sdk
```

## 🔧 Environment File Templates

### `.env.local` (Development)

```bash
# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://nultoplmuhasjpiythdq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# === SHOPIFY ===
SHOPIFY_APP_KEY=your_app_key
SHOPIFY_APP_SECRET=your_app_secret
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# === AI SERVICES ===
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# === AUTH ===
NEXTAUTH_SECRET=your-development-secret
NEXTAUTH_URL=http://localhost:3000

# === SECURITY ===
ENCRYPTION_KEY=your-development-encryption-key-32
JWT_SECRET=your-development-jwt-secret

# === DEVELOPMENT ===
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

### `.env.production` (Production Template)

```bash
# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://nultoplmuhasjpiythdq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# === SHOPIFY ===
SHOPIFY_APP_KEY=your_production_app_key
SHOPIFY_APP_SECRET=your_production_app_secret
SHOPIFY_WEBHOOK_SECRET=your_production_webhook_secret

# === AI SERVICES ===
OPENAI_API_KEY=sk-your-production-openai-key
ANTHROPIC_API_KEY=sk-ant-your-production-anthropic-key

# === AUTH ===
NEXTAUTH_SECRET=your-super-secure-production-secret-minimum-32-chars
NEXTAUTH_URL=https://your-production-domain.vercel.app

# === SECURITY ===
ENCRYPTION_KEY=your-production-encryption-key-32-bytes
JWT_SECRET=your-production-jwt-secret

# === PRODUCTION ===
NODE_ENV=production
DEBUG=false
LOG_LEVEL=error

# === MONITORING ===
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VERCEL_ANALYTICS_ID=your_vercel_analytics_id
```

## 🚀 Setting Up Environment Variables

### 1. Local Development

```bash
# Copy example file
cp .env.example .env.local

# Edit with your values
nano .env.local

# Verify variables are loaded
npm run dev
```

### 2. Vercel Deployment

```bash
# Add variables via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SHOPIFY_APP_KEY
vercel env add OPENAI_API_KEY
vercel env add NEXTAUTH_SECRET

# Add Brevo email configuration
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add BREVO_API_KEY
vercel env add FROM_EMAIL
vercel env add FROM_NAME

# Or via dashboard at https://vercel.com/mindweave/blogen-shopify-cms/settings/environment-variables

# Pull production variables to local (optional)
vercel env pull .env.local
```

### 3. GitHub Actions (CI/CD)

```yaml
# .github/workflows/deploy.yml
env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## 🔐 Security Best Practices

### Variable Classification

- **Public Variables** (`NEXT_PUBLIC_*`): Safe for client-side, include in bundle
- **Server Variables**: Never exposed to client, server-side only
- **Secrets**: Highly sensitive, encrypted storage required

### Rotation Schedule

```bash
# High Priority (Monthly)
- NEXTAUTH_SECRET
- JWT_SECRET
- ENCRYPTION_KEY
- SHOPIFY_WEBHOOK_SECRET

# Medium Priority (Quarterly)
- API Keys (OpenAI, Anthropic)
- Database passwords

# Low Priority (Annually)
- App IDs and non-secret identifiers
```

### Environment Isolation

```typescript
// lib/env.ts - Type-safe environment variables
import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  
  // Shopify
  SHOPIFY_APP_KEY: z.string(),
  SHOPIFY_APP_SECRET: z.string(),
  SHOPIFY_WEBHOOK_SECRET: z.string(),
  
  // AI
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  
  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  
  // Node
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

## 🔧 Variable Management

### Development vs Production

```typescript
// utils/config.ts
export const config = {
  database: {
    url: process.env.NODE_ENV === 'production' 
      ? process.env.DATABASE_URL 
      : process.env.LOCAL_DATABASE_URL,
  },
  ai: {
    model: process.env.NODE_ENV === 'production'
      ? 'gpt-4'
      : 'gpt-3.5-turbo', // Cheaper for dev
  },
  shopify: {
    webhook: {
      verify: process.env.NODE_ENV === 'production',
    },
  },
};
```

### Environment Variable Validation

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Validate required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SHOPIFY_APP_KEY',
  ];
  
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }
  
  return NextResponse.next();
}
```

## 🧪 Testing Environment Variables

### Test Configuration

```bash
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret-minimum-32-characters-long

# Mock API keys for testing
OPENAI_API_KEY=sk-test-key
SHOPIFY_APP_KEY=test-app-key
```

### Environment Loading Order

```typescript
// Next.js loads environment variables in this order:
// 1. .env.local (always ignored by git)
// 2. .env.[NODE_ENV] (.env.production, .env.development)
// 3. .env

// Example: utils/loadEnv.ts
import { config } from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.local';

config({ path: path.join(process.cwd(), envFile) });
```

## 📊 Environment Monitoring

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    shopify: !!process.env.SHOPIFY_APP_KEY,
    ai: !!process.env.OPENAI_API_KEY,
    auth: !!process.env.NEXTAUTH_SECRET,
  };
  
  const allHealthy = Object.values(checks).every(Boolean);
  
  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  }, {
    status: allHealthy ? 200 : 503,
  });
}
```

### Environment Audit Script

```typescript
// scripts/audit-env.ts
const requiredEnvVars = {
  development: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
  ],
  production: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SHOPIFY_APP_KEY',
    'SHOPIFY_APP_SECRET',
    'OPENAI_API_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ],
};

function auditEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env as keyof typeof requiredEnvVars];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing environment variables for ${env}:`, missing);
    process.exit(1);
  }
  
  console.log(`✅ All required environment variables present for ${env}`);
}

auditEnvironment();
```

## 📚 Resources & References

### Environment Variable Services

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Doppler](https://doppler.com) - Secret management service
- [HashiCorp Vault](https://www.vaultproject.io) - Enterprise secret management

### Security Resources

- [OWASP Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)
- [12-Factor App Config](https://12factor.net/config)
- [Environment Variable Security Best Practices](https://blog.gitguardian.com/secrets-api-management/)

## 🚨 Troubleshooting

### Common Issues

1. **Variables not loading**: Check file names and syntax
2. **Client-side access**: Only `NEXT_PUBLIC_*` variables are accessible
3. **Build failures**: Missing required variables during build
4. **Type errors**: Use environment validation schemas

### Debug Commands

```bash
# Print all environment variables
printenv

# Check specific variable
echo $NEXT_PUBLIC_SUPABASE_URL

# Test Next.js environment loading
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# Verify Vercel environment variables
vercel env ls
```