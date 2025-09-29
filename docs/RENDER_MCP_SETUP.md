# Render MCP Server Setup Guide

## Overview

The Render MCP (Model Context Protocol) server allows you to manage your Render infrastructure directly from AI applications like Cursor, Claude Code, VS Code with GitHub Copilot, and other compatible tools.

With Render MCP, you can use natural language to:

- 🚀 Create and manage services
- 🛢️ Query databases and run SQL
- 📊 Analyze metrics and logs
- 🔧 Update environment variables
- 📈 Monitor performance and autoscaling
- 🐛 Troubleshoot deployment issues

## Setup Instructions

### Step 1: Create a Render API Key

1. **Go to Account Settings**: Visit [Render Dashboard Settings](https://dashboard.render.com/settings#api-keys)
2. **Create API Key**: Click "Create API Key"
3. **Name Your Key**: Give it a descriptive name like "MCP Server Access"
4. **Save the Key**: Copy and securely store the API key (you won't see it again)

⚠️ **Security Note**: Render API keys are broadly scoped and grant access to all workspaces and services your account can access. Only use this with trusted AI applications.

### Step 2: Configure Your AI Tool

Choose your preferred AI application:

#### For Cursor

1. **Open MCP Configuration**: Create or edit `~/.cursor/mcp.json`
2. **Add Render Configuration**:

```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY_HERE"
      }
    }
  }
}
```

3. **Replace API Key**: Change `YOUR_API_KEY_HERE` to your actual Render API key
4. **Restart Cursor**: Close and reopen Cursor to load the configuration

#### For VS Code with GitHub Copilot

1. **Open VS Code Settings**: Go to File → Preferences → Settings
2. **Search for MCP**: Look for "MCP" or "Model Context Protocol" settings
3. **Add Server Configuration**:

```json
{
  "github.copilot.chat.mcp.servers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY_HERE"
      }
    }
  }
}
```

#### For Claude Code

1. **Open Configuration**: Edit your Claude Code MCP configuration file
2. **Add Render Server**:

```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY_HERE"
      }
    }
  }
}
```

#### Alternative: Docker Setup (Local)

If you prefer running the MCP server locally:

```json
{
  "mcpServers": {
    "render": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "RENDER_API_KEY",
        "-v",
        "render-mcp-server-config:/config",
        "ghcr.io/render-oss/render-mcp-server"
      ],
      "env": {
        "RENDER_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

### Step 3: Set Your Workspace

Once configured, you need to tell the MCP server which Render workspace to use:

```
Set my Render workspace to [YOUR_WORKSPACE_NAME]
```

If you don't know your workspace name, you can ask:

```
List my Render workspaces
```

## Example Commands

### Service Management

```
Create a new web service for my TimeWise HRMS app using the render-hosting branch

Deploy the timewise-hrms service with the latest changes

List all my Render services and their status
```

### Database Operations

```
Query my timewise_hrms database for the total number of users

Show me the most recent leave requests from the database

Create a backup of my PostgreSQL database
```

### Monitoring & Analytics

```
What was the CPU usage for my timewise-hrms service yesterday?

Show me error logs from the last 2 hours for my web service

How many HTTP 500 errors occurred this week?
```

### Environment Management

```
Update the NEXTAUTH_SECRET environment variable for timewise-hrms

Show me all environment variables for my web service

Add EMAIL_SERVER_HOST environment variable with value smtp.gmail.com
```

### Troubleshooting

```
Why isn't my timewise-hrms service responding?

Pull the most recent error logs for my API service

Show me the deployment history for my web service
```

## Supported Operations

### ✅ Supported Actions

- **Services**: Create web services and static sites, list services, get service details, update environment variables
- **Databases**: Create PostgreSQL databases, run read-only SQL queries, get database details
- **Deploys**: List deploy history, get deploy details
- **Logs**: Search and filter logs, get error logs
- **Metrics**: CPU/memory usage, response times, connection counts, bandwidth usage
- **Key-Value**: Create and manage Render Key-Value instances
- **Workspaces**: List and switch between workspaces

### ❌ Not Supported (Yet)

- Creating private services, background workers, or cron jobs
- Creating free tier instances (starter plans and above only)
- Deleting or modifying existing resources (except environment variables)
- Triggering manual deploys or scaling operations

## Security Considerations

1. **API Key Security**: Store your API key securely and never share it publicly
2. **Workspace Access**: The MCP server can access all resources in your Render account
3. **Sensitive Data**: Exercise caution when querying databases or logs containing sensitive information
4. **AI Context**: Be aware that query results may be included in your AI tool's context

## Configuration for TimeWise HRMS

For your specific TimeWise HRMS project, you can use commands like:

```
# Deployment commands
Deploy my timewise-hrms service from the render-hosting branch
Check the deployment status of timewise-hrms
Show me the build logs for the latest deployment

# Database commands
Query my timewise_hrms database to show all users
Get the connection count for my PostgreSQL database
Show me recent database errors

# Monitoring commands
What's the current CPU and memory usage for timewise-hrms?
Show me HTTP response codes for the last 24 hours
Get health check status for my web service

# Configuration commands
Update environment variables for production deployment
Show me all configured environment variables
Add new SMTP configuration for email notifications
```

## Troubleshooting

### MCP Server Not Found

- Verify your API key is correct and has proper permissions
- Check that the configuration file syntax is valid JSON
- Restart your AI application after configuration changes

### Workspace Access Issues

- Ensure you've set the correct workspace name
- Verify your API key has access to the workspace
- Try listing workspaces first: `List my Render workspaces`

### Permission Errors

- Check that your API key hasn't expired
- Verify you have the necessary permissions in your Render account
- Some operations require paid plans (free tier limitations)

## Benefits for TimeWise HRMS

1. **Faster Deployment**: Deploy and monitor from your AI chat interface
2. **Quick Debugging**: Get logs and metrics without leaving your development environment
3. **Database Insights**: Query your PostgreSQL database using natural language
4. **Environment Management**: Update configuration without accessing the dashboard
5. **Performance Monitoring**: Track application performance and resource usage
6. **Automated Workflows**: Combine multiple operations in single AI conversations

## Next Steps

1. **Set up the MCP server** using the configuration above
2. **Test basic commands** like listing services and workspaces
3. **Try database queries** to get insights into your application data
4. **Monitor deployments** and troubleshoot issues using natural language
5. **Explore advanced workflows** combining multiple Render operations

The Render MCP server transforms how you interact with your infrastructure, making it as easy as having a conversation! 🚀
