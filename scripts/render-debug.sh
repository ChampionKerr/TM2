#!/bin/bash

# Render Deployment Debug Script
# This script helps debug common deployment issues

echo "🔍 Render Deployment Debug Information"
echo "======================================"

echo ""
echo "📍 Environment Information:"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "RENDER: ${RENDER:-'not set'}"
echo "PORT: ${PORT:-'not set'}"
echo "HOST: ${HOST:-'not set'}"

echo ""
echo "🔧 System Information:"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Current directory: $(pwd)"

echo ""
echo "📁 File System Check:"
echo "package.json exists: $(test -f package.json && echo 'YES' || echo 'NO')"
echo "render.yaml exists: $(test -f ../../render.yaml && echo 'YES (at root)' || echo 'NO')"
echo "prisma/schema.prisma exists: $(test -f prisma/schema.prisma && echo 'YES' || echo 'NO')"
echo ".next directory exists: $(test -d .next && echo 'YES' || echo 'NO')"

echo ""
echo "🔗 Database Connection:"
if [ -n "$DATABASE_URL" ]; then
    echo "DATABASE_URL is set: YES"
    echo "Database host: $(echo $DATABASE_URL | grep -oP '(?<=@)[^:]+' || echo 'Could not parse')"
else
    echo "DATABASE_URL is set: NO"
fi

echo ""
echo "🏥 Health Check Test:"
if command -v curl >/dev/null 2>&1; then
    if [ -n "$PORT" ]; then
        echo "Testing health endpoint..."
        curl -f "http://localhost:${PORT}/api/health/render" >/dev/null 2>&1 && echo "Health check: PASS" || echo "Health check: FAIL (server may not be running)"
    else
        echo "PORT not set, cannot test health endpoint"
    fi
else
    echo "curl not available, skipping health check test"
fi

echo ""
echo "📦 Package Scripts:"
npm run 2>/dev/null | grep -E "(render:|build|start)" || echo "No render scripts found"

echo ""
echo "🔍 Build Process Test:"
echo "Testing build command components..."

# Test prisma generate
echo -n "prisma generate: "
if npx prisma generate >/dev/null 2>&1; then
    echo "SUCCESS"
else
    echo "FAILED"
fi

# Test if build script exists
echo -n "npm run build script: "
if npm run build --dry-run >/dev/null 2>&1; then
    echo "EXISTS"
else
    echo "MISSING"
fi

# Test start script
echo -n "npm run render:start script: "
if npm run render:start --dry-run >/dev/null 2>&1; then
    echo "EXISTS"
else
    echo "MISSING"
fi

echo ""
echo "📊 Resource Usage:"
if command -v ps >/dev/null 2>&1; then
    echo "Memory usage: $(ps -o pid,vsz,rss,comm -p $$ | tail -n 1)"
else
    echo "Resource monitoring not available"
fi

echo ""
echo "🚨 Common Issues Check:"

# Check for case sensitivity issues
if [ "$(uname)" = "Linux" ]; then
    echo "✓ Running on Linux (case-sensitive filesystem)"
else
    echo "⚠️  Not running on Linux - check file path casing"
fi

# Check for node_modules
if [ -d "node_modules" ]; then
    echo "✓ node_modules directory exists"
else
    echo "❌ node_modules directory missing"
fi

# Check package-lock.json
if [ -f "package-lock.json" ]; then
    echo "✓ package-lock.json exists (dependency lock file)"
else
    echo "⚠️  package-lock.json missing (may cause version issues)"
fi

echo ""
echo "======================================"
echo "Debug information collection complete"
echo ""
echo "💡 If issues persist:"
echo "1. Check build logs in Render dashboard"
echo "2. Verify all environment variables are set"
echo "3. Test commands locally: npm install && npm run render:build"
echo "4. Consider manual service creation if blueprint fails"