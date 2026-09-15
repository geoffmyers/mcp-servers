---
title: CLAUDE.md - Home Assistant CLI MCP Server
created: 2026-02-26
modified: 2026-02-26
description: "MCP server wrapping the Home Assistant ha CLI for add-on, backup, core, host, network, OS, supervisor, and resolution management. Supports local or SSH execution via @geoffmyers/mcp-server-shared. Provides 31 tools,..."
tags: [mcp-servers, claude]
---

# CLAUDE.md - Home Assistant CLI MCP Server

## Project Overview
MCP server wrapping the Home Assistant `ha` CLI for add-on, backup, core, host, network, OS, supervisor, and resolution management. Supports local or SSH execution via `@geoffmyers/mcp-server-shared`. Provides 31 tools, 3 resources, and 2 prompts.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/tools/addons.ts` - Add-on tools: list, info, start, stop, restart, update, logs, install, uninstall, stats
- `src/tools/backups.ts` - Backup tools: list, info, create, restore, remove
- `src/tools/core.ts` - Core tools: info, stats, restart, update, check config
- `src/tools/host.ts` - Host tools: info, reboot, shutdown
- `src/tools/network.ts` - Network tools: info
- `src/tools/os.ts` - OS tools: info, update
- `src/tools/supervisor.ts` - Supervisor tools: info, logs, update
- `src/tools/resolution.ts` - Resolution Center tools: info, check
- `src/tools/index.ts` - Tool registration
- `src/resources/index.ts` - Resources: ha://core/info, ha://host/info, ha://addons
- `src/prompts/addon-troubleshoot.ts` - Add-on troubleshooting prompt
- `src/prompts/system-health.ts` - System health check prompt
- `docs/instructions.md` - Server instructions bundled into dist/
- `.env.tpl` - Environment configuration (EXECUTION_MODE, SSH_HOST)

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3021)

## Gotchas
- Default HTTP port is 3021 (override with PORT env var)
- All `ha` CLI commands use `--raw-json` flag for structured output
- Destructive operations (stop, restart, update, reboot, shutdown) require `confirm: true`
- SSH target is typically the Home Assistant OS host
