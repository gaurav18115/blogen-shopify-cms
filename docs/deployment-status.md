# Deployment Status & Troubleshooting

Comprehensive guide for monitoring, troubleshooting, and maintaining your Blogen Shopify CMS deployment.

## 🚦 Deployment Status Dashboard

### Quick Health Check

Use these URLs to verify your deployment status:

```bash
# Health check endpoints
curl https://your-domain.vercel.app/api/health
curl https://your-domain.vercel.app/api/status

# Database connectivity
curl https://your-domain.vercel.app/api/db-status

# Shopify integration status
curl https://your-domain.vercel.app/api/shopify/status
```

### Status Indicators

| Component | Healthy | Warning | Critical |
|-----------|---------|---------|----------|
| **Frontend** | ✅ Page loads in <2s | ⚠️ Page loads in 2-5s | ❌ Page fails to load |
| **Database** | ✅ All queries <100ms | ⚠️ Some queries >100ms | ❌ Connection failures |
| **Shopify API** | ✅ All requests succeed | ⚠️ Rate limit warnings | ❌ API errors |
| **Authentication** | ✅ Login/logout works | ⚠️ Slow auth responses | ❌ Auth failures |
| **File Upload** | ✅ Uploads complete | ⚠️ Slow uploads | ❌ Upload failures |

## 📊 Monitoring Setup

### Vercel Dashboard Monitoring

1. **Functions**: Monitor API route performance
2. **Analytics**: Track page views and performance
3. **Logs**: View real-time application logs
4. **Bandwidth**: Monitor data transfer usage
5. **Deployments**: Track deployment success/failure

### Custom Health Check API

Create `/pages/api/health.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

type HealthStatus = {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  services: {
    database: 'up' | 'down' | 'slow';
    storage: 'up' | 'down' | 'slow';
    auth: 'up' | 'down' | 'slow';
    shopify: 'up' | 'down' | 'slow';
  };
  performance: {
    dbLatency: number;
    storageLatency: number;
    memoryUsage: string;
  };
  version: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthStatus>
) {
  const startTime = Date.now();
  
  try {
    // Database health check
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const dbStart = Date.now();
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    const dbLatency = Date.now() - dbStart;
    
    // Storage health check
    const storageStart = Date.now();
    const { data: buckets, error: storageError } = await supabase
      .storage
      .listBuckets();
    const storageLatency = Date.now() - storageStart;
    
    // Shopify health check (if configured)
    let shopifyStatus: 'up' | 'down' | 'slow' = 'up';
    try {
      // Add your Shopify API health check here
      const shopifyResponse = await fetch('https://your-store.myshopify.com/admin/api/2024-01/shop.json', {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN || '',
        },
      });
      shopifyStatus = shopifyResponse.ok ? 'up' : 'down';
    } catch {
      shopifyStatus = 'down';
    }
    
    const health: HealthStatus = {
      status: dbError || storageError ? 'critical' : 
              dbLatency > 500 || storageLatency > 1000 ? 'warning' : 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbError ? 'down' : dbLatency > 500 ? 'slow' : 'up',
        storage: storageError ? 'down' : storageLatency > 1000 ? 'slow' : 'up',
        auth: 'up', // Could add auth-specific checks
        shopify: shopifyStatus,
      },
      performance: {
        dbLatency,
        storageLatency,
        memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
      version: process.env.npm_package_version || '0.1.0',
    };
    
    const statusCode = health.status === 'critical' ? 503 : 
                      health.status === 'warning' ? 200 : 200;
    
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'critical',
      timestamp: new Date().toISOString(),
      services: {
        database: 'down',
        storage: 'down',
        auth: 'down',
        shopify: 'down',
      },
      performance: {
        dbLatency: -1,
        storageLatency: -1,
        memoryUsage: 'unknown',
      },
      version: 'unknown',
    });
  }
}
```

### External Monitoring Services

#### UptimeRobot Setup
1. Create account at [UptimeRobot](https://uptimerobot.com)
2. Add HTTP monitor for your domain
3. Set check interval to 5 minutes
4. Configure alerts via email/SMS/Slack

#### Pingdom Setup
1. Create account at [Pingdom](https://pingdom.com)
2. Add website monitoring
3. Set up performance monitoring
4. Configure alert integrations

## 🔍 Log Analysis

### Vercel Function Logs

Access logs in Vercel Dashboard:
1. Go to your project
2. Click "Functions" tab
3. Select specific function
4. View real-time logs

### Common Log Patterns

```bash
# Database connection errors
ERROR: connection terminated unexpectedly
ERROR: remaining connection slots are reserved

# Authentication errors
AuthApiError: Invalid JWT
AuthApiError: User not found

# Shopify API errors
ShopifyApiError: Rate limit exceeded
ShopifyApiError: Invalid access token

# Memory errors
JavaScript heap out of memory
FATAL ERROR: Ineffective mark-compacts near heap limit
```

### Log Aggregation Setup

#### Using Sentry
```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter out noisy errors
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.type === 'ChunkLoadError') {
        return null;
      }
    }
    return event;
  },
});
```

## 🚨 Common Issues & Solutions

### 1. Build Failures

#### Missing Environment Variables
```bash
# Error: Missing required environment variable
# Solution: Add missing variables in Vercel dashboard

vercel env add VARIABLE_NAME production
```

#### TypeScript Errors
```bash
# Error: Type errors during build
# Solution: Fix type errors locally first

npm run type-check
# Fix errors, then redeploy
```

#### Dependency Issues
```bash
# Error: Module not found
# Solution: Update package.json and reinstall

npm install
npm run build
```

### 2. Runtime Errors

#### Database Connection Issues
```javascript
// Check connection pool settings
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
});
```

#### Memory Leaks
```javascript
// Use proper cleanup in useEffect
useEffect(() => {
  const subscription = supabase
    .channel('posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, handleChange)
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 3. Performance Issues

#### Slow API Responses
```typescript
// Add response time monitoring
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const start = Date.now();
  
  try {
    // Your API logic here
    const result = await processRequest(req);
    
    const duration = Date.now() - start;
    console.log(`API ${req.url} took ${duration}ms`);
    
    res.status(200).json(result);
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`API ${req.url} failed after ${duration}ms:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

#### Large Bundle Size
```bash
# Analyze bundle size
npm run build:analyze

# Use dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});
```

### 4. Shopify Integration Issues

#### Webhook Verification Failures
```typescript
import crypto from 'crypto';

function verifyShopifyWebhook(data: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET!);
  hmac.update(data, 'utf8');
  const hash = hmac.digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'base64'),
    Buffer.from(hash, 'base64')
  );
}
```

#### Rate Limiting
```typescript
class ShopifyRateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 40;
  private readonly windowMs = 1000;

  async makeRequest(url: string, options: RequestInit) {
    await this.waitForSlot();
    
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        await this.wait(parseInt(retryAfter || '1') * 1000);
        return this.makeRequest(url, options);
      }
      
      return response;
    } catch (error) {
      console.error('Shopify API request failed:', error);
      throw error;
    }
  }

  private async waitForSlot() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      await this.wait(waitTime);
      return this.waitForSlot();
    }
    
    this.requests.push(now);
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## 📈 Performance Monitoring

### Core Web Vitals Tracking

```typescript
// pages/_app.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  if (typeof window !== 'undefined') {
    gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

export function reportWebVitals(metric: any) {
  sendToAnalytics(metric);
}

// In your app
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Database Query Monitoring

```typescript
// lib/supabase-with-monitoring.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Wrap queries with monitoring
export async function monitoredQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  
  try {
    const result = await queryFn();
    const duration = Date.now() - start;
    
    console.log(`Query ${queryName} completed in ${duration}ms`);
    
    // Send to monitoring service
    if (duration > 1000) {
      console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`Query ${queryName} failed after ${duration}ms:`, error);
    throw error;
  }
}
```

## 🛠️ Debugging Tools

### Local Development
```bash
# Enable debug logs
DEBUG=* npm run dev

# Check environment variables
npm run env:check

# Database connection test
npm run db:test
```

### Production Debugging
```bash
# View recent deployments
vercel deployments

# Stream function logs
vercel logs --follow

# Download deployment logs
vercel logs --output logs.txt
```

### Browser DevTools
- **Network tab**: Monitor API requests and response times
- **Performance tab**: Analyze page load performance
- **Application tab**: Check localStorage and service workers
- **Console**: View client-side errors and warnings

## 📞 Escalation Procedures

### Level 1: Self-Service
- Check deployment logs
- Verify environment variables
- Test health endpoints
- Review recent code changes

### Level 2: Community Support
- Search GitHub issues
- Post in Vercel Discord
- Check Supabase status page
- Review Shopify status

### Level 3: Vendor Support
- Contact Vercel support (Pro plan required)
- Open Supabase support ticket
- Contact Shopify Partner support

## 📊 Maintenance Schedule

### Daily
- [ ] Check error rates in dashboard
- [ ] Review performance metrics
- [ ] Monitor resource usage
- [ ] Verify backup completion

### Weekly
- [ ] Review dependency security alerts
- [ ] Check for performance regressions
- [ ] Analyze user feedback
- [ ] Update documentation

### Monthly
- [ ] Update dependencies
- [ ] Review and rotate secrets
- [ ] Performance optimization review
- [ ] Disaster recovery testing

## 📞 Support & Resources

### Emergency Contacts
- **Vercel Status**: [vercel-status.com](https://vercel-status.com)
- **Supabase Status**: [status.supabase.com](https://status.supabase.com)
- **Shopify Status**: [status.shopify.com](https://status.shopify.com)

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Troubleshooting](https://nextjs.org/docs/messages)

### Community
- [GitHub Issues](https://github.com/gaurav18115/blogen-shopify-cms/issues)
- [Vercel Discord](https://discord.gg/vercel)
- [Supabase Discord](https://discord.supabase.com)

---

**Remember**: Always test fixes in a preview deployment before applying to production!