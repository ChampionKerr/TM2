# TimeWise HRMS - Vercel Deployment Guide

## 🚀 Production Deployment Checklist

### ✅ **Pre-Deployment Setup**

#### **1. Environment Variables Required**

Set these in Vercel Dashboard → Settings → Environment Variables:

**Critical (Required):**

```bash
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
DATABASE_URL=postgresql://user:pass@host:port/database?sslmode=require
DIRECT_URL=postgresql://user:pass@host:port/database?sslmode=require
```

**Optional (Enhanced Features):**

```bash
# Email Service
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Performance & Monitoring
REDIS_URL=redis://your-redis-url
SENTRY_DSN=your-sentry-dsn

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

#### **2. Database Setup**

- Use **Neon** (recommended for Vercel) or **PlanetScale**
- Ensure SSL is enabled
- Connection pooling recommended for production

#### **3. Vercel Configuration**

The project includes `vercel.json` with optimized settings:

- Function timeout: 10 seconds
- Region: Washington DC (iad1)
- Security headers enabled
- Proper redirects configured

### 🔧 **Deployment Steps**

#### **Option 1: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### **Option 2: GitHub Integration**

1. Push to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

#### **Option 3: Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Configure environment variables
4. Deploy

### 📋 **Post-Deployment Configuration**

#### **1. Database Migration**

```bash
# Run migrations on first deployment
npx prisma migrate deploy

# Seed initial data
npx prisma db seed
```

#### **2. Create Admin User**

```bash
# Use the create-admin script
npx tsx scripts/create-admin.ts
```

#### **3. Test Deployment**

- Visit `/api/health` for health check
- Test sign-in functionality
- Verify database connectivity
- Check email services (if configured)

### 🔐 **Security Configuration**

#### **1. NextAuth.js Setup**

- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Set to your production domain

#### **2. OAuth Provider Setup**

For Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://yourdomain.vercel.app/api/auth/callback/google`

### ⚡ **Performance Optimization**

#### **1. Database Connection Pooling**

```bash
DATABASE_URL="postgresql://user:pass@host:port/db?connection_limit=5&pool_timeout=20"
```

#### **2. Vercel Functions**

- API routes optimized for 10-second timeout
- Edge runtime for performance-critical endpoints
- Proper caching headers configured

#### **3. Static Generation**

- Dashboard and admin pages pre-rendered
- API documentation generated at build time
- Optimized bundle size with tree shaking

### 🐛 **Troubleshooting**

#### **Common Issues:**

1. **Database Connection Errors**
   - Verify DATABASE_URL includes SSL parameters
   - Check connection limits for your database provider

2. **Authentication Issues**
   - Ensure NEXTAUTH_SECRET is set
   - Verify NEXTAUTH_URL matches your domain

3. **Build Failures**
   - Check environment variables are set
   - Verify database is accessible during build

4. **Performance Issues**
   - Monitor function duration in Vercel dashboard
   - Optimize database queries
   - Consider Redis caching

### 📊 **Monitoring & Maintenance**

#### **1. Health Monitoring**

- `/api/health` endpoint for uptime monitoring
- Database connection monitoring
- Memory and performance tracking

#### **2. Error Tracking**

- Configure Sentry for error tracking
- Monitor Vercel function logs
- Set up alerts for critical failures

#### **3. Database Maintenance**

- Regular backups
- Monitor connection pool usage
- Optimize queries based on usage patterns

### 📞 **Support & Documentation**

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **NextAuth.js Docs**: [next-auth.js.org](https://next-auth.js.org)

---

## ⚠️ **Important Notes**

- First deployment may take longer due to database migration
- Environment variables must be set before deployment
- Test thoroughly in preview deployments before production
- Monitor function execution times and optimize as needed

## 🎉 **Success Criteria**

✅ Application builds successfully  
✅ Database connectivity working  
✅ Authentication functional  
✅ API endpoints responding  
✅ Security headers configured  
✅ Performance optimized for Vercel
