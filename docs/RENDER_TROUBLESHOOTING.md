# Render Deployment Troubleshooting Guide

## Build Error: "npm <command>" - Build Command Issue

### Problem

The build command in `render.yaml` is being interpreted incorrectly, showing npm help instead of executing the build.

### Root Cause Analysis

1. **File Location**: `render.yaml` must be at repository root, not in subdirectory
2. **YAML Syntax**: Build commands need proper quoting and structure
3. **Directory Structure**: `rootDir` must specify correct path to package.json

### ✅ SOLUTION APPLIED

#### 1. Moved render.yaml to Repository Root

- File location: `/render.yaml` (repository root)
- Previously was in: `/timewise-hrms-pro/timewise-hrms/render.yaml`

#### 2. Fixed YAML Structure

```yaml
services:
  - type: web
    name: timewise-hrms
    env: node
    plan: free
    repo: https://github.com/ChampionKerr/timewise-hrms-pro
    branch: render-hosting
    rootDir: timewise-hrms-pro/timewise-hrms
    buildCommand: "npm install && npm run render:build"
    startCommand: "npm run render:start"
```

#### 3. Proper Command Quoting

- Build command now properly quoted
- Removed duplicate branch specifications
- Cleaned up YAML structure

#### Solution 2: Inline Build Commands

If npm scripts don't work, use inline commands:

```yaml
buildCommand: npm install && npx prisma generate && npx prisma db push --accept-data-loss && npm run build
```

#### Solution 3: Use Web Dashboard

Set build command directly in Render web dashboard instead of YAML:

1. Go to your service settings
2. Set Build Command: `npm install && npm run render:build`
3. Set Start Command: `npm run render:start`

### Current Fix Applied

✅ Updated `render.yaml` with simplified build command
✅ Added Node.js engine specification to `package.json`
✅ Fixed package.json indentation issues

### Verify Build Locally

Test the build process locally before deploying:

```bash
# Test the exact commands Render will run
npm install
npm run render:build
npm run render:start
```

### Alternative: Manual Environment Setup

If blueprint continues to fail, create services manually:

1. **Create Web Service**:
   - Service Type: Web Service
   - Build Command: `npm install && npm run render:build`
   - Start Command: `npm run render:start`

2. **Create Database**:
   - Service Type: PostgreSQL
   - Database Name: `timewise_hrms`
   - Connect to web service via environment variable

### Environment Variables for Manual Setup

```
NODE_ENV=production
RENDER=true
DATABASE_URL=[automatically set by Render]
NEXTAUTH_SECRET=[generate 32-character string]
NEXTAUTH_URL=[your-app-url.onrender.com]
NEXT_PUBLIC_APP_URL=[your-app-url.onrender.com]
EMAIL_FROM=noreply@yourdomain.com
```

### Debug Commands

If build still fails, check these in Render logs:

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check if package.json exists
ls -la package.json

# Check build script
npm run render:build --dry-run
```

### Next Steps

1. Commit the fixes to your repository
2. Trigger a new deployment in Render
3. Monitor the build logs for success
4. If still failing, use manual service creation

The simplified approach should resolve the build command interpretation issue.

## Official Render Troubleshooting Checklist

### 1. Build & Deploy Errors (Most Common Issues)

#### Missing or Incorrectly Referenced Resources

- ❌ **Module Not Found**: Check all dependencies in `package.json`
- ❌ **File Path Issues**: Verify case-sensitive file paths (Linux filesystem)
- ❌ **Missing Files**: Ensure all referenced files exist in repository

```bash
# Debug commands to run locally
ls -la package.json          # Verify package.json exists
npm install                  # Test dependency installation
npm run render:build         # Test build process
```

#### Language/Dependency Version Conflicts

- ❌ **Node.js Version**: Ensure engines field in package.json matches
- ❌ **npm Version**: Compatible npm version specified
- ❌ **Syntax Errors**: Modern JS syntax requires recent Node version

```json
// package.json - Current configuration
{
  "engines": {
    "node": ">=18.17.0",
    "npm": ">=9.0.0"
  }
}
```

#### Invalid Configuration

- ❌ **Build Command**: Must match local build process exactly
- ❌ **Start Command**: Must bind to host `0.0.0.0` and port `10000`
- ❌ **Environment Variables**: Required variables not set
- ❌ **Health Check**: Endpoint not responding or misconfigured

### 2. Runtime Errors (After Successful Build)

#### 502 Bad Gateway

```javascript
// Next.js server configuration fix
// In your server.js or next.config.js
module.exports = {
  // Ensure proper host/port binding
  server: {
    host: process.env.HOST || "0.0.0.0",
    port: process.env.PORT || 10000,
    // Render recommends these timeout settings
    keepAliveTimeout: 120000,
    headersTimeout: 120000,
  },
};
```

#### 500 Internal Server Error

- Database connection issues (SSL/connection pooling)
- Uncaught exceptions in application code
- Resource constraints (CPU/Memory)

```javascript
// Database connection with SSL (PostgreSQL)
const DATABASE_URL = process.env.DATABASE_URL + "?sslmode=require";
```

### 3. Environment Configuration Checklist

#### Required Environment Variables

```bash
# Production environment (automatically set by Render)
NODE_ENV=production
RENDER=true
PORT=10000
HOST=0.0.0.0

# Database (automatically set by Render)
DATABASE_URL=postgresql://...

# Authentication (must be configured)
NEXTAUTH_SECRET=[32-character-string]
NEXTAUTH_URL=https://your-app.onrender.com

# Application URLs
NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
```

### 4. Performance & Resource Optimization

#### Connection Pooling (Database)

```javascript
// Prisma client with connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=5&pool_timeout=20",
    },
  },
});
```

#### Memory Management

```json
// package.json build optimization
{
  "scripts": {
    "render:build": "NODE_OPTIONS='--max-old-space-size=1024' prisma generate && prisma db push --accept-data-loss && npm run build"
  }
}
```

### 5. Debugging Steps

#### Local Testing

```bash
# Test exact Render commands locally
export NODE_ENV=production
export PORT=10000
export HOST=0.0.0.0

# Run build process
npm install
npm run render:build

# Test server start
npm run render:start

# Test health endpoint
curl http://localhost:10000/api/health/render
```

#### Render Dashboard Debugging

1. **Check Build Logs**: Look for specific error messages
2. **Monitor Resource Usage**: CPU/Memory constraints
3. **Test Health Endpoint**: Verify `/api/health/render` responds
4. **Environment Variables**: Confirm all required vars are set

### 6. Manual Service Creation (Fallback)

If blueprint deployment continues to fail:

1. **Web Service Configuration**:
   - Service Type: Web Service
   - Runtime: Node
   - Build Command: `npm install && npm run render:build`
   - Start Command: `npm run render:start`
   - Port: 10000
   - Health Check Path: `/api/health/render`

2. **Database Configuration**:
   - Service Type: PostgreSQL
   - Database Name: `timewise_hrms`
   - Version: PostgreSQL 15
   - Plan: Free (1GB)

3. **Environment Variables**:
   - Set all required variables manually in dashboard
   - Use "Generate Value" for NEXTAUTH_SECRET
   - Link DATABASE_URL from database service

### 7. Common Solutions Summary

✅ **File Location**: render.yaml at repository root
✅ **Port Binding**: Host `0.0.0.0`, Port `10000`
✅ **Build Commands**: Properly quoted and tested locally
✅ **Environment Variables**: All required variables configured
✅ **Health Check**: Endpoint responds correctly
✅ **Node.js Version**: Compatible version specified
✅ **Database SSL**: Connection with `sslmode=require`
✅ **Resource Limits**: Optimized for free tier constraints

This troubleshooting guide covers all the major issues identified in Render's official documentation and provides specific solutions for our Next.js application.

```

```
