---
title: CLAUDE.md - MCP Configuration Guide
created: 2026-02-05
modified: 2026-02-05
description: "Purpose: Model Context Protocol (MCP) server configurations for Claude AI tools (Claude Desktop and Claude Code CLI)."
tags: [mcp-servers, claude]
---

# CLAUDE.md - MCP Configuration Guide

## Project Overview

**Purpose**: Model Context Protocol (MCP) server configurations for Claude AI tools (Claude Desktop and Claude Code CLI).

**Target User**: Claude users wanting to extend Claude's capabilities with external integrations.

## Configuration Files

### claude_desktop_config.json

Configuration for Claude Desktop application:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "path/to/server",
      "args": ["--arg1", "value"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

### .claude.json

Configuration for Claude Code CLI:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@package/server"],
      "env": {}
    }
  }
}
```

## Supported MCP Servers

### Official Servers (16)

| Server | Purpose |
|--------|---------|
| AWS | AWS service management |
| Brave Search | Web search |
| Cloudflare | Edge computing management |
| Docker | Container management |
| Dropbox | File storage |
| GitHub | Repository management |
| Google Chrome | Browser automation |
| Google Drive | File storage |
| Google Sheets | Spreadsheet operations |
| HubSpot | CRM integration |
| Make | Automation workflows |
| Notion | Note/database management |
| Portainer | Docker UI management |
| Sentry | Error tracking |
| Stripe | Payment processing |
| Todoist | Task management |
| WordPress | CMS management |

### Community Servers (24)

| Server | Purpose |
|--------|---------|
| 1Password | Password management |
| Amazon Shopping | Shopping automation |
| eBay | Marketplace integration |
| FreshBooks | Accounting |
| Gmail | Email management |
| Google Calendar | Calendar operations |
| Gravity Forms | Form data |
| Home Assistant | Smart home control |
| Mermaid | Diagram generation |
| Monarch Money | Financial tracking |
| n8n | Workflow automation |
| Obsidian | Note management |
| OrcaSlicer | 3D printing |
| pfSense | Firewall management |
| Plex | Media server |
| RescueTime | Time tracking |
| Trello | Project management |
| TrueNAS | Storage management |
| UniFi | Network management |
| Vultr | Cloud hosting |
| WooCommerce | E-commerce |

## Installation

### Server Setup

Most MCP servers install via npm:

```bash
# Example: GitHub server
npm install -g @modelcontextprotocol/server-github
```

### Environment Variables

Create `.env` file based on `.env.example`:

```bash
# GitHub
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxx

# Notion
NOTION_API_KEY=ntn_xxx

# Todoist
TODOIST_API_TOKEN=xxx
```

### Configuration Placement

**Claude Desktop:**
```
macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
Windows: %APPDATA%/Claude/claude_desktop_config.json
```

**Claude Code:**
```
Project: ./.claude.json
Global: ~/.claude.json
```

## Adding New Server

1. Find or create MCP server
2. Install dependencies
3. Add to configuration:

```json
{
  "mcpServers": {
    "new-server": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "API_KEY": "${NEW_SERVER_API_KEY}"
      }
    }
  }
}
```

4. Restart Claude

## Troubleshooting

### Server Not Loading

1. Check command path is correct
2. Verify environment variables set
3. Check server logs
4. Ensure dependencies installed

### Authentication Errors

1. Verify API keys are valid
2. Check token permissions
3. Confirm account access

## Security

- Store credentials in environment variables
- Never commit `.env` files
- Use minimal permissions for tokens
- Regularly rotate API keys
