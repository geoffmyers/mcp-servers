---
title: CLAUDE.md - Grep MCP Server
created: 2026-02-06
modified: 2026-02-06
description: "MCP server wrapping the Unix grep command. Provides 3 tools and 1 prompt for searching file contents by pattern (regex or fixed string), counting matches, and listing files that match. All operations..."
tags: [mcp-servers, claude]
---

# CLAUDE.md - Grep MCP Server

## Project Overview
MCP server wrapping the Unix `grep` command. Provides 3 tools and 1 prompt for searching file contents by pattern (regex or fixed string), counting matches, and listing files that match. All operations are read-only.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/tools/grep.ts` - Tool implementations: grep_search, grep_count, grep_files_matching
- `src/tools/index.ts` - Tool registration
- `src/prompts/` - Prompt definitions
- `src/resources/index.ts` - Resource registration (none currently)
- `docs/instructions.md` - Server instructions bundled into dist/
- `package.json` - Dependencies and scripts

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3011)

## Tool Definitions
| Tool | Description |
|------|-------------|
| `grep_search` | Search file contents for lines matching a pattern (regex or fixed string), with context lines |
| `grep_count` | Count the number of matching lines per file |
| `grep_files_matching` | List file paths containing at least one match |

## Prompts
| Prompt | Description |
|--------|-------------|
| `grep-search` | Help construct grep queries from a natural language description |

## Common Tasks
- **Add a new tool**: Create or edit `src/tools/grep.ts`, register via `server.tool()` with Zod schema
- **Add a new prompt**: Create file in `src/prompts/`, register in `src/prompts/index.ts`
- **Test locally**: `npm run build && node dist/index.js stdio`
- **Update instructions**: Edit `docs/instructions.md` (copied to dist/ during build)

## Gotchas
- Default HTTP port is 3011 (override with PORT env var)
- Build step copies `docs/` into `dist/docs/` for runtime instruction loading
- grep exit code 1 means "no matches" (not an error); handled specially in tool code
- Always passes `-n` flag to show line numbers in grep_search results
- grep_count filters out `:0` lines for cleaner output (files with zero matches)
- Result sets are capped at 100 lines by default (configurable via `limit` param)
- No credentials required; this is a local CLI wrapper
