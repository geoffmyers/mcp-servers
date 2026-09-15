---
title: CLAUDE.md - Xargs MCP Server
created: 2026-02-06
modified: 2026-02-06
description: MCP server wrapping the Unix xargs command. Provides 1 tool for executing batch commands with arguments built from input items. Includes a command allowlist for safety and requires explicit...
tags: [mcp-servers, claude]
---

# CLAUDE.md - Xargs MCP Server

## Project Overview
MCP server wrapping the Unix `xargs` command. Provides 1 tool for executing batch commands with arguments built from input items. Includes a command allowlist for safety and requires explicit confirmation to execute.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/tools/xargs.ts` - Tool implementation: xargs_execute (with ALLOWED_COMMANDS allowlist)
- `src/tools/index.ts` - Tool registration
- `src/resources/index.ts` - Resource registration (none currently)
- `docs/instructions.md` - Server instructions bundled into dist/
- `package.json` - Dependencies and scripts

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3015)

## Tool Definitions
| Tool | Description |
|------|-------------|
| `xargs_execute` | Execute a command with arguments built from input items (requires `confirm: true`) |

## Allowed Commands
The following commands are in the allowlist and can be used with `xargs_execute`:
`echo`, `ls`, `wc`, `file`, `stat`, `md5sum`, `sha256sum`, `basename`, `dirname`, `cat`, `head`, `tail`

## Common Tasks
- **Add an allowed command**: Edit the `ALLOWED_COMMANDS` array in `src/tools/xargs.ts`
- **Add a new tool**: Create or edit `src/tools/xargs.ts`, register via `server.tool()` with Zod schema
- **Test locally**: `npm run build && node dist/index.js stdio`
- **Update instructions**: Edit `docs/instructions.md` (copied to dist/ during build)

## Gotchas
- Default HTTP port is 3015 (override with PORT env var)
- Build step copies `docs/` into `dist/docs/` for runtime instruction loading
- Requires `confirm: true` to execute any command
- Only commands in the ALLOWED_COMMANDS list can be executed (safety measure)
- Items are joined with newlines and fed to xargs via stdin
- Uses `executeWithStdin` (different from other servers that use `execute`)
- Supports parallel execution via `max_procs` (-P flag, default 1)
- Supports `max_args` (-n flag) to control arguments per invocation
- No prompts are registered for this server
- No credentials required; this is a local CLI wrapper
