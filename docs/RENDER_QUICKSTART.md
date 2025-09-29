# Render Deployment Quick Start Guide

## 🚀 Deploy to Render in 5 Minutes

This guide will get your TimeWise HRMS application deployed on Render quickly and efficiently.

### Prerequisites

- GitHub repository with your code
- Render account (free tier available)
- Basic understanding of environment variables
- **Optional**: AI tool like Cursor or VS Code for MCP integration

### Step 1: Validate Your Deployment

Before deploying, run our validation script to ensure everything is configured correctly:

```bash
cd timewise-hrms-pro/timewise-hrms
./scripts/validate-render-deployment.sh
```

This will check all requirements and provide feedback on any issues.

### Step 2: Push to GitHub

Ensure all your changes are committed and pushed:

```bash
# Add all changes
git add .

# Commit changes
git commit -m "feat: render deployment setup"

# Push to your repository
git push origin render-hosting
```

### Step 3: Connect to Render

1. **Login to Render**: Go to [render.com](https://render.com) and sign in
2. **Connect Repository**:
   - Click "New" → "Blueprint"
   - Connect your GitHub account
   - Select your repository
   - Choose the `render-hosting` branch

### Step 4: Deploy Using Blueprint

1. **Use Blueprint**: Render will detect the `render.yaml` file automatically
2. **Set Environment Variables**: You'll be prompted to set:
   ```
   NEXTAUTH_SECRET=your-secret-here
   EMAIL_FROM=your-email@example.com
   EMAIL_SERVER_HOST=smtp.example.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email
   EMAIL_SERVER_PASSWORD=your-password
   ```
3. **Deploy**: Click "Apply" to start deployment

### Step 5: Configure Database

The blueprint automatically creates a PostgreSQL database. Once deployed:

1. **Database URL**: Automatically configured by Render
2. **Run Migrations**: The build script handles this automatically
3. **Seed Data**: Initial admin user is created during build

### Step 6: Verify Deployment

After deployment completes (5-10 minutes):

1. **Visit your app**: `https://your-app-name.onrender.com`
2. **Check health**: `https://your-app-name.onrender.com/api/health/render`
3. **Login**: Use the admin credentials from the seed script

### Default Admin Account

The deployment creates a default admin account:

- **Email**: `admin@company.com`
- **Password**: `Admin123!`

**⚠️ Change this password immediately after first login!**

### Environment Variables Reference

#### Required

- `NEXTAUTH_SECRET`: Random 32-character string
- `EMAIL_FROM`: Sender email address
- `NEXTAUTH_URL`: Your Render app URL (auto-set)
- `DATABASE_URL`: PostgreSQL connection (auto-set)

#### Optional

- `EMAIL_SERVER_*`: SMTP configuration for emails
- `NEXT_PUBLIC_APP_NAME`: Custom app name

### Troubleshooting Quick Fixes

#### Build Fails

```bash
# Check logs in Render dashboard
# Common issue: environment variables not set
```

#### Database Connection Issues

```bash
# Verify DATABASE_URL is set automatically
# Check database service is running
```

#### Health Check Fails

```bash
# Visit /api/health/render to see detailed status
# Check database connectivity
```

### Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Health check returns "healthy" status
- [ ] Admin login works
- [ ] Database has seed data
- [ ] Email configuration tested (if configured)
- [ ] SSL certificate is active (automatic on Render)

### Next Steps

1. **Custom Domain**: Configure your domain in Render settings
2. **Email Setup**: Configure SMTP for password resets and notifications
3. **MCP Integration**: Set up AI tool integration for easier management
4. **Monitoring**: Set up log monitoring and alerts
5. **Backup**: Configure database backups in Render dashboard

## 🤖 Bonus: AI Integration with MCP

Make managing your Render deployment as easy as chatting! Set up Render's MCP server:

```bash
# Quick MCP setup for AI tools like Cursor, VS Code, Claude Code
npm run render:mcp-setup
```

After setup, you can manage your deployment with natural language:

```
Deploy my timewise-hrms service from render-hosting branch
Show me the current CPU usage for my web service
Query my database for the total number of users
Update environment variables for production
```

See [RENDER_MCP_SETUP.md](./RENDER_MCP_SETUP.md) for complete MCP configuration guide.

### Support

- 📚 [Full Documentation](./RENDER_DEPLOYMENT.md)
- 🤖 [MCP Integration Guide](./RENDER_MCP_SETUP.md)
- 🐛 [Troubleshooting Guide](./RENDER_DEPLOYMENT.md#troubleshooting)
- 💬 Check the Render logs for detailed error information

### Cost Estimation

**Free Tier Limits**:

- Web Service: 750 hours/month
- Database: 1GB storage, 1 million rows
- Build time: 500 build hours/month

**Paid Services** (if you exceed free tier):

- Web Service: ~$7/month
- Database: ~$7/month for 1GB

---

**Need help?** The full deployment documentation provides comprehensive troubleshooting and configuration options.
