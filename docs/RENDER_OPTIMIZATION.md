# Render Deployment Performance Optimization Guide

## 🚀 Maximizing Performance on Render

This guide provides specific optimizations for running TimeWise HRMS on Render's infrastructure.

## Performance Configurations

### 1. Next.js Optimization

The `next.config.render.js` file includes Render-specific optimizations:

```javascript
// Memory optimization for Render instances
experimental: {
  optimizeCss: true,
  workerThreads: false,  // Single worker for small instances
  cpus: 1,              // Limit CPU usage
}

// Output optimization
output: 'standalone',   // Reduces bundle size
```

### 2. Database Connection Optimization

#### Connection Pooling

```javascript
// lib/prisma.ts optimization for Render
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Optimize for Render's connection limits
  __internal: {
    engine: {
      connection_limit: 5, // Render free tier limit
    },
  },
});
```

#### Connection Management

```bash
# Environment variable for connection management
DATABASE_URL="postgresql://user:password@host:port/db?connection_limit=5&pool_timeout=20"
```

### 3. Memory Management

#### Build-Time Optimization

```json
{
  "scripts": {
    "render:build": "NODE_OPTIONS='--max-old-space-size=1024' prisma generate && prisma db push --accept-data-loss && npm run build"
  }
}
```

#### Runtime Optimization

```javascript
// In pages with heavy data processing
export const config = {
  maxDuration: 30, // Render free tier limit
};
```

### 4. Static Asset Optimization

#### Image Optimization

```javascript
// next.config.render.js
images: {
  formats: ['image/webp'],      // Modern formats
  minimumCacheTTL: 60,          // Cache optimization
  deviceSizes: [640, 750, 828], // Reduced device sizes
}
```

#### Bundle Splitting

```javascript
webpack: (config) => {
  config.optimization.splitChunks = {
    chunks: "all",
    minSize: 20000,
    maxSize: 244000,
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: "vendors",
        chunks: "all",
        enforce: true,
      },
    },
  };
};
```

## Performance Monitoring

### 1. Health Check Monitoring

The `/api/health/render` endpoint provides comprehensive monitoring:

```javascript
// Monitor memory usage
memory: {
  used: memUsage.heapUsed,
  total: memUsage.heapTotal,
  percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
}
```

### 2. Database Performance

#### Query Optimization

```javascript
// Use selective queries
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // Don't select unnecessary fields
  },
  take: 50, // Limit results
});
```

#### Index Usage

```prisma
// prisma/schema.prisma - Add performance indexes
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())

  @@index([email])        // Login performance
  @@index([createdAt])    // Sorting performance
}
```

### 3. Caching Strategy

#### API Response Caching

```javascript
// app/api/employees/route.ts
export async function GET() {
  const employees = await getEmployees();

  return NextResponse.json(employees, {
    headers: {
      "Cache-Control": "public, max-age=300", // 5 minutes
    },
  });
}
```

#### Database Query Caching

```javascript
// lib/cache.ts
const cache = new Map();

export async function getCachedData(key: string, fetcher: () => Promise<any>) {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const data = await fetcher();
  cache.set(key, data);

  // Clear cache after 5 minutes
  setTimeout(() => cache.delete(key), 300000);

  return data;
}
```

## Render-Specific Optimizations

### 1. Build Performance

#### Dependency Optimization

```json
{
  "devDependencies": {
    // Move non-essential dev deps to reduce build time
  },
  "engines": {
    "node": ">=18.17.0",
    "npm": ">=9.0.0"
  }
}
```

#### Build Caching

```yaml
# render.yaml
services:
  - type: web
    name: timewise-hrms
    env: node
    buildCommand: npm ci --only=production && npm run render:build
    # Use npm ci for faster, reproducible builds
```

### 2. Runtime Performance

#### Cold Start Optimization

```javascript
// Warm up critical services
export async function middleware(request: NextRequest) {
  // Pre-initialize database connection
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
}
```

#### Memory Leak Prevention

```javascript
// Ensure proper cleanup
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

### 3. Database Performance on Render

#### Migration Optimization

```bash
#!/bin/bash
# scripts/render-build.sh optimization

# Run migrations with retry logic
for i in {1..3}; do
  if prisma db push --accept-data-loss; then
    echo "✅ Database migration successful"
    break
  else
    echo "⚠️  Migration attempt $i failed, retrying..."
    sleep 5
  fi
done
```

#### Connection Pooling

```javascript
// lib/prisma.ts - Production connection pooling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query"] : [],
  datasources: {
    db: {
      url: `${process.env.DATABASE_URL}?pgbouncer=true&connection_limit=5`,
    },
  },
});
```

## Performance Metrics

### Expected Performance on Render

#### Free Tier Performance

- **Cold Start**: 3-5 seconds
- **Warm Response**: 200-500ms
- **Database Query**: 50-200ms
- **Build Time**: 3-5 minutes

#### Paid Tier Performance

- **Cold Start**: 1-2 seconds
- **Warm Response**: 100-300ms
- **Database Query**: 20-100ms
- **Build Time**: 1-3 minutes

### Monitoring Commands

```bash
# Check memory usage during runtime
curl https://your-app.onrender.com/api/health/render

# Monitor build performance
# Available in Render dashboard logs

# Database performance
# Use Render database dashboard
```

## Optimization Checklist

### Pre-Deployment

- [ ] Run validation script
- [ ] Optimize bundle size
- [ ] Configure connection pooling
- [ ] Set up caching strategy
- [ ] Test build performance locally

### Post-Deployment

- [ ] Monitor health check endpoint
- [ ] Check memory usage patterns
- [ ] Verify database performance
- [ ] Test cold start times
- [ ] Monitor error rates

### Ongoing Optimization

- [ ] Review database query patterns
- [ ] Optimize slow API endpoints
- [ ] Monitor bundle size growth
- [ ] Update dependencies regularly
- [ ] Review Render service metrics

## Advanced Optimizations

### 1. Edge Caching

```javascript
// For static content, leverage CDN
export const config = {
  runtime: "edge",
};
```

### 2. Request Batching

```javascript
// Batch database requests
const [users, requests, analytics] = await Promise.all([
  prisma.user.findMany(),
  prisma.leaveRequest.findMany(),
  getAnalytics(),
]);
```

### 3. Lazy Loading

```javascript
// Implement lazy loading for heavy components
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});
```

## Troubleshooting Performance Issues

### Memory Issues

```bash
# Check memory usage
NODE_OPTIONS="--max-old-space-size=1024" npm start
```

### Database Connection Issues

```bash
# Test connection limits
DATABASE_URL="...?connection_limit=1" npm start
```

### Build Timeout Issues

```bash
# Extend timeout in render.yaml
buildCommand: timeout 900 npm run render:build
```

---

**Need more help?** Check the [full deployment documentation](./RENDER_DEPLOYMENT.md) for comprehensive troubleshooting guides.
