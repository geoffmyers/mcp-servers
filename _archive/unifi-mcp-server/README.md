---
title: UniFi Network MCP Server
created: 2026-01-30
modified: 2026-01-30
description: "A Model Context Protocol (MCP) server for managing UniFi Network infrastructure via the REST API. Provides 34 tools, 4 resources, and 3 prompts for comprehensive network management from any..."
tags: [mcp-servers, readme]
---

# UniFi Network MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for managing UniFi Network infrastructure via the REST API. Provides 34 tools, 4 resources, and 3 prompts for comprehensive network management from any MCP-compatible client (Claude Desktop, Claude Code, etc.).

## Prerequisites

- Node.js 22+
- UniFi Network Application (UniFi OS or standalone controller)
- Local admin credentials with API access

## Installation

```bash
cd mcp-servers/unifi-mcp-server
npm install
npm run build
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `UNIFI_HOST` | Yes | — | Controller hostname or IP (e.g., `unifi.local`) |
| `UNIFI_USERNAME` | Yes | — | Admin username |
| `UNIFI_PASSWORD` | Yes | — | Admin password |
| `UNIFI_SITE` | No | `default` | Site name |
| `UNIFI_IS_UNIFI_OS` | No | `true` | Set to `false` for legacy standalone controllers |
| `UNIFI_VERIFY_SSL` | No | `false` | Set to `true` to verify SSL certificates |
| `PORT` | No | `3004` | HTTP transport port |

### 1Password Integration

Generate `.env` from the template:

```bash
op inject -i .env.tpl -o .env
```

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "unifi": {
      "command": "node",
      "args": ["/path/to/mcp-servers/unifi-mcp-server/dist/index.js", "stdio"],
      "env": {
        "UNIFI_HOST": "unifi.local",
        "UNIFI_USERNAME": "admin",
        "UNIFI_PASSWORD": "your-password"
      }
    }
  }
}
```

### Claude Code Configuration

```json
{
  "mcpServers": {
    "unifi": {
      "command": "node",
      "args": ["/path/to/mcp-servers/unifi-mcp-server/dist/index.js", "stdio"],
      "env": {
        "UNIFI_HOST": "unifi.local",
        "UNIFI_USERNAME": "admin",
        "UNIFI_PASSWORD": "your-password"
      }
    }
  }
}
```

## Transports

| Transport | Command | Use Case |
|-----------|---------|----------|
| **stdio** | `node dist/index.js stdio` | Claude Desktop, Claude Code, local clients |
| **Streamable HTTP** | `node dist/index.js streamableHttp` | Remote clients, multi-session (port 3004) |

## Tools (34)

### System (2)

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_system_info` | Controller version and uptime | — |
| `create_backup` | Generate a controller backup | `confirm` |

### Sites (1)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_sites` | List all configured sites | — |

### Clients (7)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_active_clients` | List connected clients | — |
| `get_client` | Get client details by MAC | `mac` |
| `block_client` | Block a client device | `mac` |
| `unblock_client` | Unblock a client device | `mac` |
| `reconnect_client` | Force a client to reconnect | `mac` |
| `forget_client` | Remove a client from the controller | `mac`, `confirm` |
| `authorize_guest` | Authorize a guest client | `mac`, `minutes` |

### Devices (6)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_devices` | List all adopted devices | — |
| `get_device` | Get device details by MAC | `mac` |
| `restart_device` | Reboot a device | `mac`, `confirm` |
| `adopt_device` | Adopt a new device | `mac` |
| `locate_device` | Toggle locate LED | `mac` |
| `upgrade_device` | Upgrade device firmware | `mac`, `confirm` |

### Networks (5)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_networks` | List all networks and VLANs | — |
| `get_network` | Get a specific network | `id` |
| `create_network` | Create a network | `name`, `purpose` (corporate/guest/wan/vlan-only), `vlan?`, `subnet?` |
| `update_network` | Update a network | `id`, `name?`, `purpose?`, `vlan?`, `subnet?` |
| `delete_network` | Delete a network | `id`, `confirm` |

### WLANs (4)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_wlans` | List wireless networks | — |
| `create_wlan` | Create a wireless network | `name`, `x_passphrase`, `wlangroup_id?`, `networkconf_id?` |
| `update_wlan` | Update a wireless network | `id`, `name?`, `x_passphrase?`, `wlangroup_id?`, `networkconf_id?` |
| `delete_wlan` | Delete a wireless network | `id`, `confirm` |

### Firewall (3)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_firewall_rules` | List all firewall rules | — |
| `create_firewall_rule` | Create a firewall rule | `name`, `rule_index`, `action` (accept/drop/reject), `protocol?`, `src_firewallgroup_ids?`, `dst_firewallgroup_ids?` |
| `delete_firewall_rule` | Delete a firewall rule | `id`, `confirm` |

### Events & Alarms (2)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_events` | List recent events | — |
| `list_alarms` | List active alarms | — |

### Guests (2)

| Tool | Description | Parameters |
|------|-------------|------------|
| `create_voucher` | Generate guest vouchers | `count`, `minutes`, `quota?` (default: 1) |
| `list_vouchers` | List existing vouchers | — |

### DPI (1)

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_dpi_stats` | Deep Packet Inspection statistics | — |

### DNS (1)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_dns_records` | List DNS records | — |

## Resources (4)

| URI | Description |
|-----|-------------|
| `unifi://system/info` | Controller system information |
| `unifi://sites` | All configured sites |
| `unifi://devices` | All adopted devices with status |
| `unifi://clients/active` | Currently connected clients |

## Prompts (3)

| Prompt | Arguments | Description |
|--------|-----------|-------------|
| `network-health` | — | Comprehensive health check: devices, clients, alarms, events, utilization |
| `client-troubleshoot` | `mac` | Troubleshoot a client: connection status, events, AP/switch details, VLAN |
| `wifi-optimization` | — | Analyze APs, channel utilization, client distribution, interference |

## Safety

Destructive operations (`create_backup`, `forget_client`, `restart_device`, `upgrade_device`, `delete_network`, `delete_wlan`, `delete_firewall_rule`) require `confirm: true` to execute.

## Authentication

The server uses cookie-based session authentication:

1. Logs in via `POST /api/auth/login` (UniFi OS) or `POST /api/login` (legacy)
2. Stores session cookies and CSRF token from the login response
3. Sends cookies on all requests and CSRF token on mutating requests
4. Automatically re-authenticates on 401 responses (expired session)

**UniFi OS vs Legacy**: Set `UNIFI_IS_UNIFI_OS=false` for standalone controllers. This changes the login endpoint and removes the `/proxy/network` path prefix.

## Docker

```bash
docker build -t mcp-server-unifi .
docker run -e UNIFI_HOST=unifi.local -e UNIFI_USERNAME=admin -e UNIFI_PASSWORD=pass mcp-server-unifi
```

## Architecture

```
src/
  index.ts              # Entry point (transport selection)
  server/index.ts       # Server factory (McpServer setup)
  lib/
    unifi-client.ts     # REST client with cookie session auth + CSRF
    errors.ts           # UniFiError + formatErrorForMcp()
  tools/                # 11 tool modules (34 tools)
  resources/            # 4 resource modules (4 resources)
  prompts/              # 3 prompt modules
  transports/
    stdio.ts            # stdio transport
    streamableHttp.ts   # Express-based HTTP transport
```

## License

MIT
