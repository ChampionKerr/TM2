#!/bin/bash

# Render MCP Setup Script
# This script helps you set up Render's MCP server with your AI tools

set -e

echo "🔧 Render MCP Server Setup"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📝 This script will help you configure Render's MCP server for AI tools."
echo ""

# Check for API key
echo -e "${BLUE}Step 1: Render API Key${NC}"
echo "You need a Render API key to use the MCP server."
echo "Get one at: https://dashboard.render.com/settings#api-keys"
echo ""

read -p "Enter your Render API key: " -s API_KEY
echo ""

if [ -z "$API_KEY" ]; then
    echo -e "${RED}❌ API key is required. Exiting.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API key received${NC}"
echo ""

# Choose AI tool
echo -e "${BLUE}Step 2: Choose Your AI Tool${NC}"
echo "Which AI tool would you like to configure?"
echo "1) Cursor"
echo "2) VS Code with GitHub Copilot" 
echo "3) Claude Code"
echo "4) Docker (Local MCP Server)"
echo "5) All of the above"
echo ""

read -p "Enter your choice (1-5): " CHOICE

case $CHOICE in
    1|5)
        echo ""
        echo -e "${YELLOW}Setting up Cursor...${NC}"
        
        # Create .cursor directory in home if it doesn't exist
        mkdir -p ~/.cursor
        
        # Create mcp.json for Cursor
        cat > ~/.cursor/mcp.json << EOF
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer $API_KEY"
      }
    }
  }
}
EOF
        
        echo -e "${GREEN}✅ Cursor MCP configuration created at ~/.cursor/mcp.json${NC}"
        
        if [ "$CHOICE" != "5" ]; then
            echo ""
            echo -e "${YELLOW}Next steps for Cursor:${NC}"
            echo "1. Restart Cursor to load the new configuration"
            echo "2. Set your workspace: 'Set my Render workspace to [WORKSPACE_NAME]'"
            echo "3. Try: 'List my Render services'"
        fi
        ;&  # Fall through if choice is 5
        
    2|5)
        if [ "$CHOICE" = "2" ] || [ "$CHOICE" = "5" ]; then
            echo ""
            echo -e "${YELLOW}Setting up VS Code...${NC}"
            
            # Create VS Code settings directory if it doesn't exist
            mkdir -p ~/.vscode
            
            # Create or update VS Code settings
            VSCODE_SETTINGS=~/.vscode/settings.json
            
            if [ -f "$VSCODE_SETTINGS" ]; then
                echo -e "${YELLOW}⚠️  Existing VS Code settings found${NC}"
                echo "You'll need to manually add this to your settings.json:"
                echo ""
                echo '{
  "github.copilot.chat.mcp.servers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}'
                echo ""
                echo "Replace YOUR_API_KEY with your actual API key."
            else
                cat > "$VSCODE_SETTINGS" << EOF
{
  "github.copilot.chat.mcp.servers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer $API_KEY"
      }
    }
  }
}
EOF
                echo -e "${GREEN}✅ VS Code MCP configuration created at ~/.vscode/settings.json${NC}"
            fi
        fi
        ;&  # Fall through if choice is 5
        
    3|5)
        if [ "$CHOICE" = "3" ] || [ "$CHOICE" = "5" ]; then
            echo ""
            echo -e "${YELLOW}Setting up Claude Code...${NC}"
            
            # Create Claude Code directory if it doesn't exist
            mkdir -p ~/.claude-code
            
            # Create mcp.json for Claude Code
            cat > ~/.claude-code/mcp.json << EOF
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer $API_KEY"
      }
    }
  }
}
EOF
            
            echo -e "${GREEN}✅ Claude Code MCP configuration created at ~/.claude-code/mcp.json${NC}"
        fi
        ;&  # Fall through if choice is 5
        
    4|5)
        if [ "$CHOICE" = "4" ] || [ "$CHOICE" = "5" ]; then
            echo ""
            echo -e "${YELLOW}Setting up Docker configuration...${NC}"
            
            # Create Docker MCP configuration
            mkdir -p ~/.mcp
            cat > ~/.mcp/render-docker.json << EOF
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
        "RENDER_API_KEY": "$API_KEY"
      }
    }
  }
}
EOF
            
            echo -e "${GREEN}✅ Docker MCP configuration created at ~/.mcp/render-docker.json${NC}"
            echo -e "${YELLOW}Note: You'll need Docker installed to use this configuration${NC}"
        fi
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Step 3: Workspace Setup${NC}"
echo "After restarting your AI tool, you'll need to set your Render workspace."
echo ""
echo "Try these commands in your AI tool:"
echo -e "${GREEN}List my Render workspaces${NC}"
echo -e "${GREEN}Set my Render workspace to [YOUR_WORKSPACE_NAME]${NC}"
echo ""

echo -e "${BLUE}Step 4: Test Commands${NC}" 
echo "Once configured, try these example commands:"
echo ""
echo -e "${GREEN}# Service management${NC}"
echo "List my Render services"
echo "Show me the status of my timewise-hrms service"
echo ""
echo -e "${GREEN}# Database operations${NC}"
echo "Query my timewise_hrms database for user count"
echo "Show me database connection metrics"
echo ""
echo -e "${GREEN}# Monitoring${NC}"
echo "What's the CPU usage for my services today?"
echo "Show me error logs from the last hour"
echo ""

echo -e "${BLUE}🎉 Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}Important Security Notes:${NC}"
echo "• Your API key has been saved in configuration files"
echo "• This key grants broad access to your Render account" 
echo "• Keep these configuration files secure"
echo "• Don't share or commit API keys to version control"
echo ""

echo -e "${BLUE}📚 Documentation:${NC}"
echo "• Full setup guide: $PROJECT_ROOT/docs/RENDER_MCP_SETUP.md"
echo "• Configuration examples: $PROJECT_ROOT/.mcp/"
echo "• Render MCP docs: https://render.com/docs/mcp-server"
echo ""

echo -e "${GREEN}✅ Render MCP server is now configured for your AI tools!${NC}"