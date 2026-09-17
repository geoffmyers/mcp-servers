# UniFi CLI MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for a self-hosted [UniFi Network](https://ui.com/) controller. It needs no API credentials: every tool runs a read-only `mongosh` query against the controller's own database, inside the controller's container, locally or over SSH.

## Requirements
- Node.js 20.6+
- A UniFi Network controller running in Docker, in a container named **`unifi`**, whose image ships `mongosh` at `/usr/lib/unifi/data/mongosh` with the database on port `27117` (the layout of the common LinuxServer.io-style images)
- Permission to run `docker exec` on that host; if the server runs elsewhere, key-based SSH access to it

## Installation
From the repository root (the servers are one npm workspace):

```bash
npm ci
npm run build
```

## Configuration

### MCP client
```json
{
  "mcpServers": {
    "unifi-cli": {
      "command": "node",
      "args": ["/path/to/mcp-servers/unifi-cli-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

Run `node dist/index.js streamableHttp` instead to serve streamable HTTP on port 3027.

### Environment variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXECUTION_MODE` | No | `local` | `local` runs commands on this machine; `ssh` runs them on `SSH_HOST` |
| `SSH_HOST` | When `EXECUTION_MODE=ssh` | — | Host (or SSH config alias) to run commands on, with key-based login |
| `PORT` | No | `3027` | Port for the streamable HTTP transport |

`.env.example` lists them; `node --env-file=.env dist/index.js stdio` loads a filled-in copy.

## Tools

19 tools, all read-only.

| Tool | Description |
|------|-------------|
| `system_info` | Get UniFi controller container status via docker inspect |
| `controller_status` | Get UniFi controller version and identity from MongoDB settings |
| `list_active_clients` | List all known UniFi clients (active and historical) |
| `client_info` | Get detailed information about a specific client by MAC address |
| `list_all_clients` | List ALL known clients including historical (not just active) |
| `client_history` | Get client connection history and statistics by MAC address |
| `list_devices` | List all adopted UniFi devices (APs, switches, gateways) |
| `device_info` | Get detailed information about a specific UniFi device by MAC address |
| `device_uptime` | Get device uptime and last-seen timestamps by MAC address |
| `list_networks` | List all configured UniFi networks (VLANs, corporate, guest) |
| `network_info` | Get detailed configuration for a specific network by name |
| `list_wlans` | List all configured wireless networks (SSIDs) |
| `list_events` | List recent UniFi network events (sorted newest first) |
| `list_alarms` | List recent UniFi alarms (sorted newest first) |
| `list_recent_alarms` | List recent alarms with detail |
| `controller_logs` | View recent UniFi controller container logs |
| `ping_device` | Ping a device from the host to check connectivity |
| `list_dpi_stats` | List Deep Packet Inspection statistics (app/category traffic usage) |
| `list_hourly_site_stats` | List hourly site statistics (traffic, clients) |

## Resources
| URI | Description |
|-----|-------------|
| `unifi-cli://system/info` | UniFi controller container status |
| `unifi-cli://devices` | All adopted UniFi devices |
| `unifi-cli://clients` | All known UniFi clients |

## Prompts
| Prompt | Description |
|--------|-------------|
| `network-health` | Comprehensive UniFi network health check |
| `client-troubleshoot` | Troubleshoot connectivity issues for a specific client |

## Safety
- Every tool is a read-only query; nothing writes to the controller's database.
- MAC addresses are validated, free-text values are escaped and numeric limits are coerced to integers before they reach a `mongosh --eval` query.
- The container name `unifi` and the `mongosh` path are fixed in `src/lib/mongo.ts`; change them there if your controller differs.

## Author
Geoff Myers
