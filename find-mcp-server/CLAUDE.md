# CLAUDE.md - Find MCP Server

## Project Overview
MCP server wrapping the Unix `find` command. Provides 3 tools and 1 prompt for searching files and directories by name, type, size, modification time, content, and detecting duplicates. All operations are read-only.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/tools/find.ts` - Tool implementations: find_files, find_by_content, find_duplicates
- `src/tools/index.ts` - Tool registration
- `src/prompts/find-files.ts` - find-files prompt definition
- `src/resources/index.ts` - Resource registration (none currently)
- `docs/instructions.md` - Server instructions bundled into dist/
- `package.json` - Dependencies and scripts

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3010)

## Tool Definitions
| Tool | Description |
|------|-------------|
| `find_files` | Find files/directories by name pattern, type, size, mtime, depth, empty |
| `find_by_content` | Find files containing text (combines find + grep -rl) |
| `find_duplicates` | Find potential duplicate files by matching file sizes |

## Prompts
| Prompt | Description |
|--------|-------------|
| `find-files` | Help construct find queries from a natural language description |

## Common Tasks
- **Add a new tool**: Create or edit `src/tools/find.ts`, register via `server.tool()` with Zod schema
- **Add a new prompt**: Create file in `src/prompts/`, register in `src/prompts/index.ts`
- **Test locally**: `npm run build && node dist/index.js stdio`
- **Update instructions**: Edit `docs/instructions.md` (copied to dist/ during build)

## Gotchas
- Default HTTP port is 3010 (override with PORT env var)
- Build step copies `docs/` into `dist/docs/` for runtime instruction loading
- Uses `-printf` for find_duplicates which requires GNU find (works on macOS with default find)
- Result sets are capped at 100 items by default (configurable via `limit` param)
- No credentials required; this is a local CLI wrapper
