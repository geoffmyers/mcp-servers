---
title: pfSense MCP Server
created: 2026-01-30
modified: 2026-01-30
description: "A Model Context Protocol (MCP) server for managing pfSense+ firewalls via the REST API v2. Provides 34 tools, 5 resources, and 3 prompts for comprehensive firewall management from any MCP-compatible..."
tags: [mcp-servers, readme]
---

# pfSense MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for managing pfSense+ firewalls via the REST API v2. Provides 34 tools, 5 resources, and 3 prompts for comprehensive firewall management from any MCP-compatible client (Claude Desktop, Claude Code, etc.).

## Prerequisites

- Node.js 22+
- pfSense+ with REST API v2 package installed and configured
- API key generated via pfSense UI → System → REST API → Keys

## Installation

```bash
cd mcp-servers/pfsense-mcp-server
npm install
npm run build
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PFSENSE_HOST` | Yes | — | pfSense hostname or IP (e.g., `pfsense.local`) |
| `PFSENSE_API_KEY` | Yes | — | REST API v2 key |
| `PFSENSE_SECURE` | No | `true` | Set to `false` to use HTTP instead of HTTPS |
| `PFSENSE_VERIFY_SSL` | No | `false` | Set to `true` to verify SSL certificates |
| `PORT` | No | `3003` | HTTP transport port |

### 1Password Integration

Generate `.env` from the template:

```bash
op inject -i .env.tpl -o .env
```

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "pfsense": {
      "command": "node",
      "args": ["/path/to/mcp-servers/pfsense-mcp-server/dist/index.js", "stdio"],
      "env": {
        "PFSENSE_HOST": "pfsense.local",
        "PFSENSE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Code Configuration

```json
{
  "mcpServers": {
    "pfsense": {
      "command": "node",
      "args": ["/path/to/mcp-servers/pfsense-mcp-server/dist/index.js", "stdio"],
      "env": {
        "PFSENSE_HOST": "pfsense.local",
        "PFSENSE_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Transports

| Transport | Command | Use Case |
|-----------|---------|----------|
| **stdio** | `node dist/index.js stdio` | Claude Desktop, Claude Code, local clients |
| **Streamable HTTP** | `node dist/index.js streamableHttp` | Remote clients, multi-session (port 3003) |

## Tools (34)

### System (3)

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_system_info` | System hostname, version, platform | — |
| `get_system_status` | Uptime, CPU, memory usage | — |
| `get_interface_status` | Interface link states | — |

### Firewall Rules (6)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_firewall_rules` | List rules, optionally by interface | `interface?` |
| `create_firewall_rule` | Create a firewall rule | `interface`, `type`, `ipprotocol`, `protocol?`, `source`, `destination`, `descr?` |
| `update_firewall_rule` | Update a firewall rule | `id`, `interface?`, `type?`, `ipprotocol?`, `protocol?`, `source?`, `destination?`, `descr?` |
| `toggle_firewall_rule` | Enable or disable a rule | `id`, `disabled` |
| `delete_firewall_rule` | Delete a rule | `id`, `confirm` |
| `reorder_firewall_rules` | Reorder rules | `rules` (array of IDs) |

### NAT / Port Forwarding (3)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_port_forwards` | List NAT port forwards | — |
| `create_port_forward` | Create a port forward | `interface`, `protocol`, `src?`, `srcport?`, `dst`, `dstport`, `target`, `local_port`, `descr?` |
| `delete_port_forward` | Delete a port forward | `id`, `confirm` |

### Aliases (4)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_aliases` | List all firewall aliases | — |
| `create_alias` | Create an alias | `name`, `type` (host/network/port/url), `address`, `descr?` |
| `update_alias` | Update an alias | `id`, `name?`, `type?`, `address?`, `descr?` |
| `delete_alias` | Delete an alias | `id`, `confirm` |

### Interfaces (2)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_interfaces` | List all interface configurations | — |
| `get_interface` | Get specific interface details | `name` |

### Services (6)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_services_status` | Service statuses | — |
| `get_dhcp_leases` | Active kea-dhcp4 lease table (isc-dhcpd is deprecated/unused) | — |
| `get_dns_resolver` | DNS resolver (Unbound) config | — |
| `update_dns_resolver` | Update DNS resolver settings | `enable?`, `dnssec?`, `forwarding?`, `custom_options?` |
| `get_dhcp_server_config` | kea-dhcp4 server configuration | — |
| `create_dhcp_static_mapping` | Create a DHCP reservation (ingested by kea-dhcp4) | `interface`, `mac`, `ipaddr`, `hostname?`, `descr?` |

### VPN (4)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_openvpn_servers` | OpenVPN server instances | — |
| `get_openvpn_status` | OpenVPN connection status | — |
| `get_ipsec_status` | IPsec tunnel status | — |
| `get_wireguard_status` | WireGuard tunnel status | — |

### Diagnostics (5)

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_arp_table` | ARP table (IP-to-MAC mappings) | — |
| `run_ping` | Ping a target host | `host`, `count?` (default: 4) |
| `run_traceroute` | Traceroute to a host | `host` |
| `get_firewall_states` | Active firewall states (connection tracking) | — |
| `get_routing_table` | Routing table | — |

### Gateway (1)

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_gateway_status` | Gateway health, latency, packet loss | — |

## Resources (5)

| URI | Description |
|-----|-------------|
| `pfsense://system/info` | System version, hostname, uptime |
| `pfsense://interfaces` | All interface configurations |
| `pfsense://gateways/status` | Gateway health and latency |
| `pfsense://services/status` | Service statuses |
| `pfsense://firewall/rules/{interface}` | Firewall rules for a specific interface |

## Prompts (3)

| Prompt | Arguments | Description |
|--------|-----------|-------------|
| `diagnose-connectivity` | `target` | Diagnose connectivity using ping, traceroute, gateway status, firewall states, ARP |
| `firewall-audit` | `interface` | Audit rules for security issues, overly permissive rules, shadowed rules |
| `vpn-setup` | `vpnType` (wireguard/openvpn/ipsec) | Guide through VPN configuration and setup |

## Safety

Destructive operations (`delete_firewall_rule`, `delete_port_forward`, `delete_alias`) require `confirm: true` to execute.

## API Notes

- The pfSense REST API v2 returns responses in a `{ code, status, response_id, message, data }` envelope. The client automatically unwraps this and returns the `data` field directly.
- Self-signed TLS certificates are accepted by default. Set `PFSENSE_SECURE=false` to use plain HTTP.

## Docker

```bash
docker build -t mcp-server-pfsense .
docker run -e PFSENSE_HOST=pfsense.local -e PFSENSE_API_KEY=key mcp-server-pfsense
```

## Architecture

```
src/
  index.ts              # Entry point (transport selection)
  server/index.ts       # Server factory (McpServer setup)
  lib/
    pfsense-client.ts   # REST client with X-API-Key auth
    errors.ts           # PfSenseError + formatErrorForMcp()
  tools/                # 9 tool modules (34 tools)
  resources/            # 5 resource modules (5 resources)
  prompts/              # 3 prompt modules
  transports/
    stdio.ts            # stdio transport
    streamableHttp.ts   # Express-based HTTP transport
```

## License

MIT
