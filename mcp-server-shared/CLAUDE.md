---
title: CLAUDE.md - MCP Server Shared Package
created: 2026-02-26
modified: 2026-02-26
description: "Shared TypeScript package (@geoffmyers/mcp-server-shared) providing common infrastructure for all CLI-based MCP servers. Includes configurable command executor (local or SSH), server factory, dual..."
tags: [mcp-servers, claude]
---

# CLAUDE.md - MCP Server Shared Package

## Project Overview
Shared TypeScript package (`@geoffmyers/mcp-server-shared`) providing common infrastructure for all CLI-based MCP servers. Includes configurable command executor (local or SSH), server factory, dual transport support (stdio + streamable HTTP), and error handling utilities.

## Architecture / Key Files
- `src/index.ts` - Barrel export of all modules
- `src/types.ts` - Shared types: `ExecutorResult`, `ExecutorOptions`, `ServerConfig`, `ToolRegistrar`
- `src/executor.ts` - Core executor: `execute()`, `executeRemote()`, `executeAuto()`, `getServerConfig()`
- `src/errors.ts` - `McpToolError` class and `formatErrorForMcp()` helper
- `src/server.ts` - `createServerFactory()` and `resolveInstructionsPath()` functions
- `src/transports/stdio.ts` - `startStdio()` wrapper
- `src/transports/streamableHttp.ts` - `startStreamableHttp()` with Express 5, CORS, session management
- `package.json` - Package definition with `declaration: true` for type exports

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/ with declarations
- `npm run watch` - TypeScript watch mode

## Key Concepts
- **`executeAuto(config, command, args)`** - Routes to local `execute()` or remote `executeRemote()` based on `config.executionMode`
- **`getServerConfig()`** - Reads `EXECUTION_MODE` and `SSH_HOST` from env vars
- **`createServerFactory(name, version, registerTools, registerResources, registerPrompts)`** - Creates MCP server with instructions loading
- Uses `execFile` (not `exec`) to prevent shell injection
- SSH commands are shell-escaped with single-quote wrapping

## Gotchas
- All consuming packages use `file:../mcp-server-shared` dependency reference
- TypeScript declarations must be enabled (`declaration: true`) for type exports to work
- The `execFile` import is from `node:child_process` (promisified)
- SSH escaping uses `'${a.replace(/'/g, "'\\''")}'` pattern for each argument
