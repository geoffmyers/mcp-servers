# CLAUDE.md - UniFi CLI MCP Server

## Project Overview
MCP server for UniFi Network management via MongoDB queries executed through `docker exec` on the UniFi controller container. Provides client, device, network, WLAN, event, stats, and system management. Supports local or SSH execution via `@geoffmyers/mcp-server-shared`. Provides 19 tools, 3 resources, and 2 prompts.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/lib/mongo.ts` - MongoDB query helper: `mongoQuery()` wraps `docker exec unifi /usr/lib/unifi/data/mongosh`
- `src/tools/clients.ts` - Client tools: list active, list all (historical), client info, client history
- `src/tools/devices.ts` - Device tools: list, device info, device uptime
- `src/tools/diagnostics.ts` - Diagnostic tools: controller logs, ping device
- `src/tools/events.ts` - Event tools: list events, list alarms, list recent alarms
- `src/tools/networks.ts` - Network tools: list networks, network info
- `src/tools/stats.ts` - Stats tools: DPI stats, hourly site stats
- `src/tools/system.ts` - System tools: system info, controller status
- `src/tools/wlans.ts` - WLAN tools: list WLANs
- `src/tools/index.ts` - Tool registration
- `src/resources/index.ts` - Resources: unifi-cli://system/info, unifi-cli://devices, unifi-cli://clients
- `src/prompts/client-troubleshoot.ts` - Client troubleshooting prompt
- `src/prompts/network-health.ts` - Network health check prompt
- `docs/instructions.md` - Server instructions bundled into dist/
- `.env.tpl` - Environment configuration (EXECUTION_MODE, SSH_HOST)

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3027)

## Key Concepts
- `mongoQuery(config, collection, query, options)` executes `docker exec unifi mongosh --quiet --eval '<js>' ace`
- All queries target the `ace` database (UniFi's MongoDB database)
- MAC addresses are validated with regex `/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/`
- Read-only operations (no destructive tools in this server)

## Gotchas
- Default HTTP port is 3027 (override with PORT env var)
- Requires the UniFi controller running as a Docker container named `unifi`
- MongoDB queries are passed via `--eval` flag to `mongosh` inside the container (MongoDB 8 dropped `mongo`/`mongosh` from the server package; a standalone `mongosh` binary is placed in the data volume at `/usr/lib/unifi/data/mongosh`)
- No API credentials needed; uses Docker exec on the host
- This server complements (not replaces) the API-based `unifi-mcp-server`
