# Production Environment Variables

This document lists all the environment variables needed for the Timewise HRMS application in production.

## Required Environment Variables

### Database Configuration

```
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

### Authentication

```
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="your-secure-secret-key"
```

### Email Configuration (Resend)

```
RESEND_API_KEY="re_xxxx..."
RESEND_FROM_NAME="Timewise HRMS"
RESEND_FROM_EMAIL="noreply@your-domain.com"
```

### Application Settings

```
NEXT_PUBLIC_APP_URL="https://your-production-domain.com"
```

## How to Set Up in Vercel

1. Go to your project settings in Vercel
2. Navigate to the "Environment Variables" tab
3. Add each variable listed above
4. Make sure to set different values for Production, Preview, and Development environments if needed

## Security Notes

- Never commit actual environment variable values to the repository
- Use strong, unique values for secrets and API keys
- Rotate secrets periodically
- Use different values for development and production environments

## Database URL Format

For production, your DATABASE_URL should use the following format with your actual values:

```
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

## Vercel Deployment Checklist

1. Set all required environment variables
2. Ensure DATABASE_URL points to your production database
3. Configure NEXTAUTH_URL to match your deployment URL
4. Set up your email domain in Resend
5. Update NEXT_PUBLIC_APP_URL to match your production domain

## Troubleshooting

If you encounter issues:

1. Verify all environment variables are set correctly
2. Check Vercel deployment logs
3. Ensure database is accessible from Vercel's infrastructure
4. Verify email configuration is working
5. Check NextAuth.js session configuration
