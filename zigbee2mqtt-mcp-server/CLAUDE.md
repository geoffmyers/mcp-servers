---
title: CLAUDE.md - Zigbee2MQTT MCP Server
created: 2026-02-26
modified: 2026-02-26
description: MCP server for Zigbee2MQTT management via MQTT messaging and Docker container control. Uses the mqtt npm package for MQTT communication and Docker CLI for container management. Supports local or SSH...
tags: [mcp-servers, claude]
---

# CLAUDE.md - Zigbee2MQTT MCP Server

## Project Overview
MCP server for Zigbee2MQTT management via MQTT messaging and Docker container control. Uses the `mqtt` npm package for MQTT communication and Docker CLI for container management. Supports local or SSH execution via `@geoffmyers/mcp-server-shared`. Provides 25 tools, 2 resources, and 2 prompts.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/lib/mqtt.ts` - MQTT helpers: `mqttPublish()`, `mqttSubscribeOne()`, `mqttRequestResponse()`
- `src/tools/bridge.ts` - Bridge tools: info, state
- `src/tools/container.ts` - Container tools: status, logs, restart
- `src/tools/devices.ts` - Device tools: list, info, offline, set/get state, interview, rename, remove
- `src/tools/network.ts` - Network tools: permit join, network map
- `src/tools/groups.ts` - Group tools: list, create, remove, add/remove members
- `src/tools/binding.ts` - Binding tools: bind, unbind devices
- `src/tools/ota.ts` - OTA tools: check firmware update
- `src/tools/index.ts` - Tool registration
- `src/resources/index.ts` - Resources: zigbee2mqtt://bridge/info, zigbee2mqtt://devices
- `src/prompts/device-troubleshoot.ts` - Device troubleshooting prompt
- `src/prompts/network-health.ts` - Network health check prompt
- `docs/instructions.md` - Server instructions bundled into dist/
- `.env.tpl` - Environment configuration (EXECUTION_MODE, SSH_HOST, MQTT_HOST, MQTT_PORT, MQTT_USER, MQTT_PASSWORD)

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3025)

## Key Concepts
- MQTT tools use the `mqtt` npm package (not CLI tools) for broker communication
- Docker tools use `executeAuto()` for local/SSH container management
- `mqttRequestResponse()` publishes a message and waits for a response on a subscription topic
- Zigbee2MQTT MQTT topics follow the pattern `zigbee2mqtt/<topic>`

## Gotchas
- Default HTTP port is 3025 (override with PORT env var)
- Requires MQTT credentials: `MQTT_HOST`, `MQTT_PORT`, `MQTT_USER`, `MQTT_PASSWORD`
- `MQTT_PASSWORD` uses 1Password reference in .env.tpl
- `container_restart`, `remove_device`, `force_remove_device`, and `remove_group` require `confirm: true`
- MQTT subscribe uses a 5-second timeout by default
