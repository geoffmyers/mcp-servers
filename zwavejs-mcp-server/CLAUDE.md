# CLAUDE.md - Z-Wave JS MCP Server

## Project Overview
MCP server for Z-Wave JS UI management via MQTT messaging and Docker container control. Uses the `mqtt` npm package for MQTT communication with Z-Wave JS UI's MQTT API, and Docker CLI for container management. Supports local or SSH execution via `@geoffmyers/mcp-server-shared`. Provides 22 tools, 2 resources, and 2 prompts.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/lib/mqtt.ts` - MQTT helpers: `mqttPublish()`, `mqttSubscribeOne()`, `mqttRequestResponse()`
- `src/tools/container.ts` - Container tools: status, logs, restart
- `src/tools/control.ts` - Control tools: set/get node values
- `src/tools/diagnostics.ts` - Diagnostic tools: driver status, controller info
- `src/tools/management.ts` - Management tools: interview, heal node/network, refresh values, remove failed node
- `src/tools/nodes.ts` - Node tools: list, info, offline, statistics
- `src/tools/inclusion.ts` - Inclusion tools: begin/stop inclusion, begin/stop exclusion
- `src/tools/config.ts` - Config tools: get node config params, set node config param
- `src/tools/index.ts` - Tool registration
- `src/resources/index.ts` - Resources: zwavejs://controller/info, zwavejs://nodes
- `src/prompts/node-troubleshoot.ts` - Node troubleshooting prompt
- `src/prompts/network-health.ts` - Network health check prompt
- `docs/instructions.md` - Server instructions bundled into dist/
- `.env.tpl` - Environment configuration (EXECUTION_MODE, SSH_HOST, MQTT_HOST, MQTT_PORT, MQTT_USER, MQTT_PASSWORD)

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3026)

## Key Concepts
- Z-Wave JS UI MQTT API uses the topic pattern `zwave/_CLIENTS/ZWAVE_GATEWAY-zwave-js-ui/api/<method>/set`
- Response comes on the same topic without `/set` suffix
- MQTT tools use the `mqtt` npm package (not CLI tools) for broker communication
- Docker tools use `executeAuto()` for local/SSH container management

## Gotchas
- Default HTTP port is 3026 (override with PORT env var)
- Requires MQTT credentials: `MQTT_HOST`, `MQTT_PORT`, `MQTT_USER`, `MQTT_PASSWORD`
- `MQTT_PASSWORD` uses 1Password reference in .env.tpl
- `container_restart`, `heal_network`, `remove_failed_node`, `begin_inclusion`, and `begin_exclusion` require `confirm: true`
- MQTT subscribe uses a 5-second timeout by default
