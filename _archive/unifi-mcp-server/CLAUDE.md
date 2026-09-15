---
title: CLAUDE.md - UniFi Network MCP Server
created: 2026-02-06
modified: 2026-02-06
description: "MCP server for managing UniFi Network infrastructure via the REST API. Provides 34 tools, 4 resources, and 3 prompts for clients, devices, networks, WLANs, firewall rules, events/alarms, guest..."
tags: [mcp-servers, claude]
---

# CLAUDE.md - UniFi Network MCP Server

## Project Overview
MCP server for managing UniFi Network infrastructure via the REST API. Provides 34 tools, 4 resources, and 3 prompts for clients, devices, networks, WLANs, firewall rules, events/alarms, guest management, DPI stats, and DNS records.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/lib/unifi-client.ts` - REST client with cookie-based session auth + CSRF token
- `src/lib/errors.ts` - UniFiError class + formatErrorForMcp()
- `src/tools/` - 11 tool modules (34 tools total):
  - `system.ts` - get_system_info, create_backup
  - `sites.ts` - list_sites
  - `clients.ts` - list_active_clients, get/block/unblock/reconnect/forget client, authorize_guest
  - `devices.ts` - list/get/restart/adopt/locate/upgrade devices
  - `networks.ts` - list/get/create/update/delete networks
  - `wlans.ts` - list/create/update/delete WLANs
  - `firewall.ts` - list/create/delete firewall rules
  - `events.ts` - list_events, list_alarms
  - `guests.ts` - create_voucher, list_vouchers
  - `dpi.ts` - get_dpi_stats
  - `dns.ts` - list_dns_records
- `src/resources/` - 4 resource modules (system info, sites, devices, active clients) providing 4 URIs
- `src/prompts/` - 3 prompt modules (network-health, client-troubleshoot, wifi-optimization)
- `.env.tpl` - 1Password template: UNIFI_HOST, UNIFI_USERNAME, UNIFI_PASSWORD, UNIFI_IS_UNIFI_OS
- `Dockerfile` - Container build support
- `tsconfig.json` - TypeScript configuration

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3004)
- `npm test` - Run tests with vitest
- `npm run test:watch` - Run tests in watch mode

## Tool Categories (34 tools)
| Category | Count | Tools |
|----------|-------|-------|
| System | 2 | get_system_info, create_backup |
| Sites | 1 | list_sites |
| Clients | 7 | list_active_clients, get/block/unblock/reconnect/forget client, authorize_guest |
| Devices | 6 | list/get/restart/adopt/locate/upgrade devices |
| Networks | 5 | list/get/create/update/delete networks |
| WLANs | 4 | list/create/update/delete WLANs |
| Firewall | 3 | list/create/delete firewall rules |
| Events | 2 | list_events, list_alarms |
| Guests | 2 | create_voucher, list_vouchers |
| DPI | 1 | get_dpi_stats |
| DNS | 1 | list_dns_records |

## Resources (4)
- `unifi://system/info` - Controller system information
- `unifi://sites` - All configured sites
- `unifi://devices` - All adopted devices with status
- `unifi://clients/active` - Currently connected clients

## Prompts (3)
- `network-health` - Comprehensive health check: devices, clients, alarms, events
- `client-troubleshoot` - Troubleshoot a client: connection, events, AP/switch, VLAN
- `wifi-optimization` - Analyze APs, channel utilization, client distribution

## Common Tasks
- **Add a new tool**: Create a new file in `src/tools/` or add to existing module, register in `src/tools/index.ts`
- **Add a new resource**: Create file in `src/resources/`, register in `src/resources/index.ts`
- **Add a new prompt**: Create file in `src/prompts/`, register in `src/prompts/index.ts`
- **Test locally**: `npm run build && UNIFI_HOST=... UNIFI_USERNAME=... UNIFI_PASSWORD=... node dist/index.js stdio`
- **Generate .env**: `op inject -i .env.tpl -o .env`

## Gotchas
- Default HTTP port is 3004 (override with PORT env var)
- Requires UNIFI_HOST, UNIFI_USERNAME, and UNIFI_PASSWORD environment variables (no API key support; uses session cookies)
- Uses cookie-based session authentication with CSRF token (auto-refreshes on 401)
- Set UNIFI_IS_UNIFI_OS=false for legacy standalone controllers (changes login endpoint and removes `/proxy/network` path prefix)
- Default site is `default` (override with UNIFI_SITE env var)
- Self-signed TLS certificates are accepted by default (UNIFI_VERIFY_SSL=false)
- Destructive operations (create_backup, forget_client, restart_device, upgrade_device, delete_network, delete_wlan, delete_firewall_rule) require `confirm: true`
- Build step copies `docs/` into `dist/docs/` for runtime instruction loading
- Credentials managed via 1Password CLI (vault: <vault>, item: unifi-mcp)
