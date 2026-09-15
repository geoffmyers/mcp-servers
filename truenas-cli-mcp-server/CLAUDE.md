---
title: CLAUDE.md - TrueNAS SCALE CLI MCP Server
created: 2026-02-26
modified: 2026-02-26
description: "MCP server wrapping the TrueNAS SCALE midclt call middleware CLI for storage, sharing, snapshot, service, app, disk, user, cron, boot, and system management. Supports local or SSH execution via..."
tags: [mcp-servers, claude]
---

# CLAUDE.md - TrueNAS SCALE CLI MCP Server

## Project Overview
MCP server wrapping the TrueNAS SCALE `midclt call` middleware CLI for storage, sharing, snapshot, service, app, disk, user, cron, boot, and system management. Supports local or SSH execution via `@geoffmyers/mcp-server-shared`. Provides 43 tools, 3 resources, and 2 prompts.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/tools/alert.ts` - Alert tools: list, dismiss
- `src/tools/app.ts` - App tools: list, start, stop
- `src/tools/boot.ts` - Boot environment tools: list
- `src/tools/cron.ts` - Cron job tools: list, create, run
- `src/tools/dataset.ts` - Dataset tools: list, get, create, delete, update
- `src/tools/disk.ts` - Disk tools: list, smart_data, identify
- `src/tools/pool.ts` - Pool tools: list, status, start_scrub, stop_scrub, scrub_status
- `src/tools/service.ts` - Service tools: list, start, stop, restart
- `src/tools/sharing-nfs.ts` - NFS share tools: list, create, delete
- `src/tools/sharing-smb.ts` - SMB share tools: list, create, delete
- `src/tools/snapshot.ts` - Snapshot tools: list, create, delete, rollback
- `src/tools/system.ts` - System tools: info, reboot, shutdown
- `src/tools/user.ts` - User tools: list, create, update, delete
- `src/tools/index.ts` - Tool registration
- `src/resources/index.ts` - Resources: truenas-cli://system/info, truenas-cli://pools, truenas-cli://services
- `src/prompts/storage-health.ts` - Storage health check prompt
- `src/prompts/service-troubleshoot.ts` - Service troubleshooting prompt
- `docs/instructions.md` - Server instructions bundled into dist/
- `.env.tpl` - Environment configuration (EXECUTION_MODE, SSH_HOST)

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3023)

## Gotchas
- Default HTTP port is 3023 (override with PORT env var)
- All commands use `midclt call <method> [json_params]` pattern
- JSON parameters are passed via `JSON.stringify()` as command arguments
- Destructive operations (delete, rollback, reboot, shutdown) require `confirm: true`
- This server complements (not replaces) the API-based `truenas-mcp-server`
