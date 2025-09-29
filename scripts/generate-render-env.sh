#!/bin/bash

# Environment Variables Generator for Render Deployment
# This script helps generate the required environment variables for your Render deployment

echo "🔐 TimeWise HRMS - Environment Variables Generator"
echo "================================================"
echo ""
echo "This script will help you generate the required environment variables for your Render deployment."
echo ""

# Generate NEXTAUTH_SECRET
echo "🔑 Generating NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "Generated secure 32-character secret ✅"
echo ""

# Collect email configuration
echo "📧 Email Configuration (for password resets and notifications)"
echo "Choose your email provider:"
echo "1) Gmail"
echo "2) Outlook/Hotmail"
echo "3) Custom SMTP"
echo "4) Skip email setup (can configure later)"
echo ""

read -p "Enter your choice (1-4): " EMAIL_CHOICE

case $EMAIL_CHOICE in
    1)
        echo ""
        echo "📧 Gmail Setup"
        echo "Note: You'll need to use an App Password, not your regular Gmail password"
        echo "Generate one at: https://myaccount.google.com/apppasswords"
        echo ""
        read -p "Enter your Gmail address: " EMAIL_FROM
        EMAIL_SERVER_HOST="smtp.gmail.com"
        EMAIL_SERVER_PORT="587"
        EMAIL_SERVER_USER="$EMAIL_FROM"
        read -p "Enter your Gmail App Password: " -s EMAIL_SERVER_PASSWORD
        echo ""
        ;;
    2)
        echo ""
        echo "📧 Outlook/Hotmail Setup"
        read -p "Enter your Outlook email: " EMAIL_FROM
        EMAIL_SERVER_HOST="smtp-mail.outlook.com"
        EMAIL_SERVER_PORT="587"
        EMAIL_SERVER_USER="$EMAIL_FROM"
        read -p "Enter your Outlook password: " -s EMAIL_SERVER_PASSWORD
        echo ""
        ;;
    3)
        echo ""
        echo "📧 Custom SMTP Setup"
        read -p "Enter your email address: " EMAIL_FROM
        read -p "Enter SMTP host (e.g., smtp.yourdomain.com): " EMAIL_SERVER_HOST
        read -p "Enter SMTP port (usually 587 or 465): " EMAIL_SERVER_PORT
        read -p "Enter SMTP username: " EMAIL_SERVER_USER
        read -p "Enter SMTP password: " -s EMAIL_SERVER_PASSWORD
        echo ""
        ;;
    4)
        echo ""
        echo "⏭️ Skipping email configuration. You can set this up later in Render dashboard."
        EMAIL_FROM="noreply@yourdomain.com"
        EMAIL_SERVER_HOST=""
        EMAIL_SERVER_PORT=""
        EMAIL_SERVER_USER=""
        EMAIL_SERVER_PASSWORD=""
        ;;
    *)
        echo "❌ Invalid choice. Skipping email setup."
        EMAIL_FROM="noreply@yourdomain.com"
        EMAIL_SERVER_HOST=""
        EMAIL_SERVER_PORT=""
        EMAIL_SERVER_USER=""
        EMAIL_SERVER_PASSWORD=""
        ;;
esac

echo ""
echo "🎨 Application Configuration"
read -p "Enter your application name (default: TimeWise HRMS Pro): " APP_NAME
APP_NAME=${APP_NAME:-"TimeWise HRMS Pro"}

echo ""
echo "🎉 Environment Variables Generated!"
echo "=================================="
echo ""
echo "Copy these environment variables to your Render service configuration:"
echo ""
echo "# =============================================="
echo "# TimeWise HRMS - Render Environment Variables"
echo "# =============================================="
echo ""
echo "# Authentication (REQUIRED)"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo ""
echo "# Application Settings"
echo "NEXT_PUBLIC_APP_NAME=$APP_NAME"
echo "EMAIL_FROM=$EMAIL_FROM"
echo ""

if [ -n "$EMAIL_SERVER_HOST" ]; then
    echo "# Email Server Configuration"
    echo "EMAIL_SERVER_HOST=$EMAIL_SERVER_HOST"
    echo "EMAIL_SERVER_PORT=$EMAIL_SERVER_PORT"
    echo "EMAIL_SERVER_USER=$EMAIL_SERVER_USER"
    echo "EMAIL_SERVER_PASSWORD=$EMAIL_SERVER_PASSWORD"
    echo ""
fi

echo "# The following are automatically set by Render:"
echo "# DATABASE_URL=[automatically generated]"
echo "# NEXTAUTH_URL=[your-app-url.onrender.com]"  
echo "# NEXT_PUBLIC_APP_URL=[your-app-url.onrender.com]"
echo "# NODE_ENV=production"
echo "# RENDER=true"
echo "# PORT=10000"
echo "# HOST=0.0.0.0"
echo ""
echo "# =============================================="
echo ""

# Save to file for reference
ENV_FILE="/tmp/timewise-render-env.txt"
cat > "$ENV_FILE" << EOF
# TimeWise HRMS - Render Environment Variables
# Generated on $(date)

# Authentication (REQUIRED)
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Application Settings  
NEXT_PUBLIC_APP_NAME=$APP_NAME
EMAIL_FROM=$EMAIL_FROM

EOF

if [ -n "$EMAIL_SERVER_HOST" ]; then
    cat >> "$ENV_FILE" << EOF
# Email Server Configuration
EMAIL_SERVER_HOST=$EMAIL_SERVER_HOST
EMAIL_SERVER_PORT=$EMAIL_SERVER_PORT
EMAIL_SERVER_USER=$EMAIL_SERVER_USER
EMAIL_SERVER_PASSWORD=$EMAIL_SERVER_PASSWORD

EOF
fi

cat >> "$ENV_FILE" << EOF
# The following are automatically set by Render:
# DATABASE_URL=[automatically generated]
# NEXTAUTH_URL=[your-app-url.onrender.com]
# NEXT_PUBLIC_APP_URL=[your-app-url.onrender.com]
# NODE_ENV=production
# RENDER=true
# PORT=10000
# HOST=0.0.0.0
EOF

echo "📁 Environment variables saved to: $ENV_FILE"
echo ""
echo "🚀 Next Steps:"
echo "1. Copy the environment variables above"
echo "2. Go to your Render deployment setup"
echo "3. Paste these variables in the environment configuration"
echo "4. Complete your deployment"
echo ""
echo "🔒 Security Notes:"
echo "• Keep your NEXTAUTH_SECRET secure and private"
echo "• Don't share email passwords publicly"
echo "• Use app passwords for Gmail instead of your account password"
echo "• The generated secret is cryptographically secure"
echo ""
echo "✅ Your environment variables are ready for Render deployment!"