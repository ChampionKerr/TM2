# Render MCP Configuration Templates

This directory contains configuration templates for setting up Render's MCP (Model Context Protocol) server with different AI tools.

## Quick Setup

### 1. Get Your Render API Key

- Go to [Render Dashboard Settings](https://dashboard.render.com/settings#api-keys)
- Click "Create API Key"
- Copy and securely store the API key

### 2. Choose Your Configuration

#### For Cursor

```bash
# Copy the template to your home directory
cp .cursor/mcp.json.example ~/.cursor/mcp.json

# Edit the file and replace YOUR_RENDER_API_KEY_HERE with your actual API key
```

#### For VS Code with GitHub Copilot

```bash
# Copy to VS Code settings
cp .vscode/mcp-settings.json.example ~/.vscode/mcp-settings.json

# Or add to your VS Code settings.json file directly
```

#### For Claude Code

Use the same configuration as Cursor:

```bash
cp .cursor/mcp.json.example ~/.claude-code/mcp.json
```

### 3. Set Your Workspace

After configuring, tell your AI tool which workspace to use:

```
Set my Render workspace to [YOUR_WORKSPACE_NAME]
```

## Example Commands After Setup

```
# Service management
List my Render services
Deploy timewise-hrms from render-hosting branch
Show me the status of my web service

# Database operations
Query my timewise_hrms database for user count
Show recent database connections
Get database performance metrics

# Monitoring
What's the CPU usage for timewise-hrms today?
Show me error logs from the last hour
Check the health status of my services

# Environment management
Show environment variables for timewise-hrms
Update NEXTAUTH_SECRET for my service
Add new email server configuration
```

## Security Notes

- Never commit actual API keys to version control
- Store API keys securely using your system's credential manager
- Be cautious when sharing AI chat logs that may contain sensitive data
- The MCP server has broad access to your Render account

## Documentation

See [RENDER_MCP_SETUP.md](../docs/RENDER_MCP_SETUP.md) for complete setup instructions and usage examples.
