#!/bin/bash

# Render Build Script for TimeWise HRMS
# This script handles the complete build process on Render

set -e  # Exit on any error

echo "🚀 Starting TimeWise HRMS build process for Render..."

# Navigate to the application directory
cd timewise-hrms-pro/timewise-hrms

echo "📋 Environment Information:"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Working directory: $(pwd)"

echo ""
echo "📦 Installing dependencies..."
npm ci --include=dev

echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🗄️ Setting up database schema..."
# Use db push for initial setup (safer than migrate for new databases)
npx prisma db push --accept-data-loss --skip-generate

echo ""
echo "🌱 Seeding database with initial data..."
# Run seed script with error handling
if npm run render:seed; then
    echo "✅ Database seeding completed successfully"
else
    echo "⚠️ Database seeding failed - continuing with build"
fi

echo ""
echo "🏗️ Building Next.js application..."
npm run build

echo ""
echo "🧪 Running quick validation..."
# Validate that the build was successful
if [ -d ".next" ]; then
    echo "✅ Next.js build directory created successfully"
else
    echo "❌ Next.js build failed - .next directory not found"
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo "🎉 TimeWise HRMS is ready for deployment on Render!"

# Optional: Display build statistics
echo ""
echo "📊 Build Statistics:"
echo "Build directory size: $(du -sh .next 2>/dev/null || echo 'Unable to calculate')"
echo "Node modules size: $(du -sh node_modules 2>/dev/null || echo 'Unable to calculate')"