#!/bin/bash

# Render Deployment Validation Script
# Validates all deployment requirements before pushing to Render

set -e  # Exit on any error

echo "🔍 Starting Render deployment validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VALIDATION_RESULTS=()

# Validation functions
validate_env_file() {
    echo "📁 Checking environment file..."
    if [ ! -f "$PROJECT_ROOT/.env.render.example" ]; then
        VALIDATION_RESULTS+=("❌ Missing .env.render.example file")
        return 1
    fi
    
    # Check required environment variables
    local required_vars=(
        "DATABASE_URL"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
        "NEXT_PUBLIC_APP_URL"
        "EMAIL_FROM"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" "$PROJECT_ROOT/.env.render.example"; then
            VALIDATION_RESULTS+=("❌ Missing required environment variable: $var")
        fi
    done
    
    VALIDATION_RESULTS+=("✅ Environment file validation passed")
    return 0
}

validate_render_config() {
    echo "📋 Checking Render configuration..."
    if [ ! -f "$PROJECT_ROOT/render.yaml" ]; then
        VALIDATION_RESULTS+=("❌ Missing render.yaml file")
        return 1
    fi
    
    # Validate render.yaml structure
    if ! grep -q "services:" "$PROJECT_ROOT/render.yaml"; then
        VALIDATION_RESULTS+=("❌ Invalid render.yaml structure")
        return 1
    fi
    
    if ! grep -q "databases:" "$PROJECT_ROOT/render.yaml"; then
        VALIDATION_RESULTS+=("❌ Missing database configuration in render.yaml")
        return 1
    fi
    
    VALIDATION_RESULTS+=("✅ Render configuration validation passed")
    return 0
}

validate_build_script() {
    echo "🔨 Checking build script..."
    if [ ! -f "$PROJECT_ROOT/scripts/render-build.sh" ]; then
        VALIDATION_RESULTS+=("❌ Missing render-build.sh script")
        return 1
    fi
    
    if [ ! -x "$PROJECT_ROOT/scripts/render-build.sh" ]; then
        VALIDATION_RESULTS+=("❌ Build script is not executable")
        return 1
    fi
    
    # Check if script contains required commands
    if ! grep -q "prisma generate" "$PROJECT_ROOT/scripts/render-build.sh"; then
        VALIDATION_RESULTS+=("❌ Build script missing prisma generate")
    fi
    
    if ! grep -q "npm run build" "$PROJECT_ROOT/scripts/render-build.sh"; then
        VALIDATION_RESULTS+=("❌ Build script missing npm run build")
    fi
    
    VALIDATION_RESULTS+=("✅ Build script validation passed")
    return 0
}

validate_package_json() {
    echo "📦 Checking package.json..."
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        VALIDATION_RESULTS+=("❌ Missing package.json file")
        return 1
    fi
    
    # Check for required Render scripts
    local required_scripts=(
        "render:build"
        "render:start"
        "render:seed"
    )
    
    for script in "${required_scripts[@]}"; do
        if ! grep -q "\"$script\":" "$PROJECT_ROOT/package.json"; then
            VALIDATION_RESULTS+=("❌ Missing required script: $script")
        fi
    done
    
    # Check for required dependencies
    local required_deps=(
        "@prisma/client"
        "prisma"
        "next"
        "react"
    )
    
    for dep in "${required_deps[@]}"; do
        if ! grep -q "\"$dep\":" "$PROJECT_ROOT/package.json"; then
            VALIDATION_RESULTS+=("❌ Missing required dependency: $dep")
        fi
    done
    
    VALIDATION_RESULTS+=("✅ Package.json validation passed")
    return 0
}

validate_prisma_schema() {
    echo "🗄️  Checking Prisma schema..."
    if [ ! -f "$PROJECT_ROOT/prisma/schema.prisma" ]; then
        VALIDATION_RESULTS+=("❌ Missing prisma/schema.prisma file")
        return 1
    fi
    
    # Check for PostgreSQL provider
    if ! grep -q 'provider = "postgresql"' "$PROJECT_ROOT/prisma/schema.prisma"; then
        VALIDATION_RESULTS+=("❌ Prisma schema must use PostgreSQL provider")
        return 1
    fi
    
    VALIDATION_RESULTS+=("✅ Prisma schema validation passed")
    return 0
}

validate_next_config() {
    echo "⚙️  Checking Next.js configuration..."
    if [ ! -f "$PROJECT_ROOT/next.config.js" ] && [ ! -f "$PROJECT_ROOT/next.config.render.js" ]; then
        VALIDATION_RESULTS+=("❌ Missing Next.js configuration file")
        return 1
    fi
    
    VALIDATION_RESULTS+=("✅ Next.js configuration validation passed")
    return 0
}

validate_health_check() {
    echo "🏥 Checking health check endpoint..."
    if [ ! -f "$PROJECT_ROOT/app/api/health/route.ts" ] && [ ! -f "$PROJECT_ROOT/app/api/health/render/route.ts" ]; then
        VALIDATION_RESULTS+=("❌ Missing health check endpoint")
        return 1
    fi
    
    VALIDATION_RESULTS+=("✅ Health check endpoint validation passed")
    return 0
}

validate_dependencies() {
    echo "🔗 Validating dependencies..."
    
    cd "$PROJECT_ROOT"
    
    # Check if node_modules exists or can be installed
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing dependencies for validation..."
        if ! npm install --silent; then
            VALIDATION_RESULTS+=("❌ Failed to install dependencies")
            return 1
        fi
    fi
    
    # Validate TypeScript compilation
    echo "🔍 Checking TypeScript compilation..."
    if ! npx tsc --noEmit --skipLibCheck; then
        VALIDATION_RESULTS+=("❌ TypeScript compilation errors detected")
        return 1
    fi
    
    VALIDATION_RESULTS+=("✅ Dependencies validation passed")
    return 0
}

validate_git_status() {
    echo "📝 Checking Git status..."
    
    cd "$PROJECT_ROOT"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        VALIDATION_RESULTS+=("❌ Not in a Git repository")
        return 1
    fi
    
    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    echo "Current branch: $CURRENT_BRANCH"
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        VALIDATION_RESULTS+=("⚠️  Uncommitted changes detected")
        echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
        git status --short
    fi
    
    VALIDATION_RESULTS+=("✅ Git status validation passed")
    return 0
}

run_test_build() {
    echo "🧪 Running test build..."
    
    cd "$PROJECT_ROOT"
    
    # Create temporary build
    echo "Building application..."
    if ! npm run build > /tmp/render-build-test.log 2>&1; then
        VALIDATION_RESULTS+=("❌ Build failed - check /tmp/render-build-test.log")
        echo -e "${RED}Build failed. Last 20 lines of log:${NC}"
        tail -20 /tmp/render-build-test.log
        return 1
    fi
    
    VALIDATION_RESULTS+=("✅ Test build successful")
    return 0
}

# Main validation execution
echo "Starting comprehensive deployment validation..."
echo "=========================================="

# Run all validations
FAILED_VALIDATIONS=0

validate_env_file || ((FAILED_VALIDATIONS++))
validate_render_config || ((FAILED_VALIDATIONS++))
validate_build_script || ((FAILED_VALIDATIONS++))
validate_package_json || ((FAILED_VALIDATIONS++))
validate_prisma_schema || ((FAILED_VALIDATIONS++))
validate_next_config || ((FAILED_VALIDATIONS++))
validate_health_check || ((FAILED_VALIDATIONS++))
validate_git_status || ((FAILED_VALIDATIONS++))

# Only run expensive validations if basic ones pass
if [ $FAILED_VALIDATIONS -eq 0 ]; then
    validate_dependencies || ((FAILED_VALIDATIONS++))
    run_test_build || ((FAILED_VALIDATIONS++))
else
    echo -e "${YELLOW}Skipping dependency and build validation due to previous failures${NC}"
fi

echo ""
echo "=========================================="
echo "📊 VALIDATION SUMMARY"
echo "=========================================="

# Print all results
for result in "${VALIDATION_RESULTS[@]}"; do
    echo -e "$result"
done

echo ""
echo "Total validations: ${#VALIDATION_RESULTS[@]}"
echo "Failed validations: $FAILED_VALIDATIONS"

if [ $FAILED_VALIDATIONS -eq 0 ]; then
    echo -e "${GREEN}🎉 All validations passed! Ready for Render deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Commit your changes: git add . && git commit -m 'feat: render deployment setup'"
    echo "2. Push to repository: git push origin $(git branch --show-current)"
    echo "3. Connect repository to Render"
    echo "4. Deploy using render.yaml blueprint"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $FAILED_VALIDATIONS validation(s) failed. Please fix issues before deploying.${NC}"
    echo ""
    echo "💡 Common fixes:"
    echo "- Run: npm install"
    echo "- Check environment variables in .env.render.example"
    echo "- Verify all required files are present"
    echo "- Fix TypeScript compilation errors"
    echo ""
    exit 1
fi