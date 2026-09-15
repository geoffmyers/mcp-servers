---
title: Claude MCP Server Configuration
created: 2026-02-05
modified: 2026-02-05
description: Configuration files for Model Context Protocol (MCP) servers for both Claude Code (CLI) and Claude Desktop.
tags: [mcp-servers, readme]
---

# Claude MCP Server Configuration

Configuration files for Model Context Protocol (MCP) servers for both Claude Code (CLI) and Claude Desktop.

## Files

| File | Purpose | Location |
|------|---------|----------|
| `claude_desktop_config.json` | Claude Desktop configuration | Copy to `~/Library/Application Support/Claude/` |
| `.claude.json` | Claude Code configuration | Copy to `~/.claude.json` or project root |
| `.env.example` | Environment variable template | Copy to `.env` and fill in values |

## Installation

### Claude Desktop

```bash
# Copy config to Claude Desktop location
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Claude Code (CLI)

```bash
# Option 1: Global config
cp .claude.json ~/.claude.json

# Option 2: Per-project config (place in project root)
cp .claude.json /path/to/your/project/.claude.json
```

### Environment Variables

```bash
# Copy and edit environment variables
cp .env.example ~/.claude-mcp.env

# Add to your shell profile (~/.zshrc or ~/.bashrc):
export $(cat ~/.claude-mcp.env | xargs)
```

## MCP Server Status

### Official First-Party Servers (16)

| Service | Package | Transport | Remote URL |
|---------|---------|-----------|------------|
| AWS | [`awslabs.aws-mcp-servers.core`](https://github.com/awslabs/mcp) (uvx) | Local + Remote | Via AWS Bedrock |
| Brave Search | [`@brave/brave-search-mcp-server`](https://github.com/brave/brave-search-mcp-server) | Local (stdio/HTTP) | — |
| Cloudflare | [`@cloudflare/mcp-server-cloudflare`](https://github.com/cloudflare/mcp-server-cloudflare) | Local + Remote (SSE) | Deploy to Workers |
| Docker | [`@docker/mcp-hub`](https://github.com/docker/hub-mcp) | Local only | — |
| Dropbox Dash | [`@dropbox/mcp-server-dash`](https://github.com/dropbox/mcp-server-dash) | Local + Remote | `https://mcp.dropbox.com/dash` |
| GitHub | [`@modelcontextprotocol/server-github`](https://github.com/github/github-mcp-server) | Local + Remote | `https://api.githubcopilot.com/mcp/` |
| Google Chrome | [`chrome-devtools-mcp`](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Local only | — |
| Google Drive | [`@modelcontextprotocol/server-gdrive`](https://github.com/modelcontextprotocol/servers-archived/tree/main/src/gdrive) | Local only | — |
| HubSpot | [`@hubspot/mcp-server`](https://developers.hubspot.com/mcp) | Local + Remote | `https://mcp.hubspot.com` |
| Make | [Remote MCP Server](https://developers.make.com/mcp-server) | Remote only (HTTP/SSE) | `https://mcp.make.com` |
| Notion | [`@notionhq/notion-mcp-server`](https://github.com/makenotion/notion-mcp-server) | Local + Remote (SSE) | `https://mcp.notion.com/sse` |
| Portainer | [`portainer-mcp`](https://github.com/portainer/portainer-mcp) | Local only | — |
| Sentry | [`@sentry/mcp-server`](https://github.com/getsentry/sentry-mcp) | Local + Remote (HTTP/SSE) | `https://mcp.sentry.dev` |
| Stripe | [`@stripe/mcp`](https://github.com/stripe/ai) | Local + Remote | `https://mcp.stripe.com` |
| Todoist | [`todoist-ai`](https://github.com/Doist/todoist-ai) | Local + Remote (HTTP) | `https://ai.todoist.net/mcp` |
| WordPress | [`wordpress/mcp-adapter`](https://github.com/WordPress/mcp-adapter) | Local + Remote | WordPress.com built-in |

### Third-Party Community Servers (24)

| Service | Package | Transport | Notes |
|---------|---------|-----------|-------|
| 1Password | [`@dkvdm/onepassword-mcp-server`](https://mcp.so/server/onepassword-mcp-server/dkvdm) | Local only | ⚠️ Proof of concept |
| Amazon Shopping | [`mcp-server-amazon`](https://github.com/rigwild/mcp-server-amazon) | Local only | ⚠️ Uses account creds |
| eBay | [`ebay-mcp`](https://github.com/YosefHayim/ebay-mcp) | Local only | OAuth, 387+ tools |
| FreshBooks | [`freshbooks-mcp`](https://github.com/roboulos/freshbooks-mcp) | Local only | OAuth required |
| Gmail | [`@gongrzhe/server-gmail-autoauth-mcp`](https://github.com/GongRzhe/Gmail-MCP-Server) | Local only | Google OAuth |
| Google Calendar | [`@cocal/google-calendar-mcp`](https://github.com/nspady/google-calendar-mcp) | Local only | Google OAuth |
| Google Sheets | [`mcp-google-sheets`](https://github.com/xing5/mcp-google-sheets) (uvx) | Local only | Service account |
| Gravity Forms | [`@gravitykit/gravitymcp`](https://github.com/GravityKit/GravityMCP) | Local only | By GravityKit |
| Home Assistant | [`mcp-server-home-assistant`](https://github.com/allenporter/mcp-server-home-assistant) (uvx) | Local only | ⚠️ Archived - integrating into HA Core |
| Mermaid | [`@peng-shawn/mermaid-mcp-server`](https://github.com/peng-shawn/mermaid-mcp-server) | Local only | No auth needed |
| Monarch Money | [`monarch-money-mcp`](https://github.com/colvint/monarch-money-mcp) (uvx) | Local only | ⚠️ Unofficial API |
| n8n | [`n8n-mcp-server`](https://github.com/leonardsellem/n8n-mcp-server) | Local only | API key |
| Obsidian | [`obsidian-mcp-server`](https://github.com/cyanheads/obsidian-mcp-server) | Local only | Requires Local REST API plugin |
| OrcaSlicer | [`mcp-3d-printer-server`](https://github.com/DMontgomery40/mcp-3D-printer-server) | Local only | Multi-printer support |
| pfSense | [`pfsense-mcp-server`](https://github.com/gensecaihq/pfsense-mcp-server) (uvx) | Local only | SSH/API access |
| Plex | [`plex-mcp`](https://github.com/vyb1ng/plex-mcp) | Local only | X-Plex-Token |
| RescueTime | [`rescuetime-mcp`](https://github.com/ebowman/rescuetime-mcp) (uvx) | Local only | API key |
| Trello | [`@delorenj/mcp-server-trello`](https://github.com/delorenj/mcp-server-trello) | Local only | API key + token |
| TrueNAS | [`truenas-mcp-server`](https://github.com/svnstfns/truenas-mcp-server) (uvx) | Local only | API key |
| UniFi | [`unifi-network-mcp`](https://github.com/sirkirby/unifi-network-mcp) | Local only | Controller creds |
| Vultr | [`mcp-vultr`](https://github.com/rsp2k/mcp-vultr) (uvx) | Local only | 335+ tools |
| WooCommerce | [`woocommerce-mcp`](https://github.com/techspawn/woocommerce-mcp-server) | Local only | REST API keys |

### Not Available (3)

| Service | Notes |
|---------|-------|
| **ACF (Advanced Custom Fields)** | No standalone MCP server. ACF is a WordPress plugin - access via WordPress MCP server. |
| **ESPHome** | No MCP server exists. ESPHome uses YAML configuration and REST API but no one has built an MCP server for it yet. |
| **Plesk** | Official extension exists (beta) but only via web UI installation, not CLI. See https://www.plesk.com/extensions/mcp/ |

## Prerequisites

### Node.js (for npx servers)

```bash
# Install Node.js 18+ via Homebrew
brew install node
```

### Python (for uvx servers)

```bash
# Install uv package manager
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Getting API Keys

### Official Services

| Service | Where to Get Credentials |
|---------|-------------------------|
| AWS | https://console.aws.amazon.com/iam/ |
| Brave Search | https://brave.com/search/api/ |
| Cloudflare | https://dash.cloudflare.com/profile/api-tokens |
| Docker Hub | https://hub.docker.com/settings/security |
| Dropbox | https://www.dropbox.com/developers/apps |
| GitHub | https://github.com/settings/tokens |
| Google APIs | https://console.cloud.google.com/apis/credentials |
| HubSpot | https://developers.hubspot.com/mcp |
| Make | Account Settings → API |
| Notion | https://www.notion.so/my-integrations |
| Sentry | https://sentry.io/settings/auth-tokens/ |
| Stripe | https://dashboard.stripe.com/apikeys |
| Todoist | OAuth via https://ai.todoist.net/mcp |

### Third-Party Services

| Service | Where to Get Credentials |
|---------|-------------------------|
| 1Password | https://developer.1password.com/docs/service-accounts/ |
| eBay | https://developer.ebay.com/my/keys |
| RescueTime | https://www.rescuetime.com/anapi/manage |
| Vultr | https://my.vultr.com/settings/#settingsapi |

### Self-Hosted Services

| Service | How to Get Credentials |
|---------|----------------------|
| Home Assistant | Profile → Long-Lived Access Tokens |
| n8n | Settings → API |
| Obsidian | Install [Local REST API plugin](https://github.com/coddingtonbear/obsidian-local-rest-api) |
| OrcaSlicer | Path to executable + slicer profile |
| pfSense | System → Advanced → API |
| Plex | Network tab → copy X-Plex-Token from any request |
| Portainer | Settings → Access control |
| TrueNAS | API Keys in web UI |
| UniFi | Network controller username/password |
| WordPress | Users → Profile → Application Passwords |
| WooCommerce | WooCommerce → Settings → Advanced → REST API |

## Troubleshooting

### Server not starting

1. Check if the package exists: `npm view <package-name>`
2. Verify environment variables are set
3. Check Claude Desktop logs: `~/Library/Logs/Claude/`

### Authentication errors

1. Regenerate API keys/tokens
2. Check token permissions/scopes
3. For OAuth servers, re-authenticate through the browser

### Python servers (uvx) not working

```bash
# Ensure uv is installed and in PATH
which uvx

# If not found, add to PATH
export PATH="$HOME/.local/bin:$PATH"
```

## Security Notes

- Never commit `.env` files with real credentials
- Use environment variables, not hardcoded values
- Rotate API keys periodically
- Use minimal permission scopes where possible
- **Monarch Money**: Uses unofficial API - credentials sent to third-party server

## Updates

MCP servers are rapidly evolving. Check these resources for updates:

- [Official MCP Servers](https://github.com/modelcontextprotocol/servers)
- [MCP Registry](https://registry.modelcontextprotocol.io/)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)
