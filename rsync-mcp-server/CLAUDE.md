# CLAUDE.md - Rsync MCP Server

## Project Overview
MCP server wrapping the Unix `rsync` command. Provides 2 tools and 1 prompt for file synchronization and transfer with a dry-run-first safety workflow. Supports archive mode, compression, include/exclude patterns, and remote transfers.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/tools/rsync.ts` - Tool implementations: rsync_dry_run, rsync_execute
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
- `npm run start:streamableHttp` - Start with HTTP transport (port 3013)

## Tool Definitions
| Tool | Description |
|------|-------------|
| `rsync_dry_run` | Preview an rsync transfer without making changes (always uses --dry-run) |
| `rsync_execute` | Execute an rsync file transfer (requires `confirm: true`) |

## Prompts
| Prompt | Description |
|--------|-------------|
| `rsync-transfer` | Help plan and execute rsync file transfers |

## Common Tasks
- **Add a new tool**: Create or edit `src/tools/rsync.ts`, register via `server.tool()` with Zod schema
- **Add a new prompt**: Create file in `src/prompts/`, register in `src/prompts/index.ts`
- **Test locally**: `npm run build && node dist/index.js stdio`
- **Update instructions**: Edit `docs/instructions.md` (copied to dist/ during build)

## Gotchas
- Default HTTP port is 3013 (override with PORT env var)
- Build step copies `docs/` into `dist/docs/` for runtime instruction loading
- `rsync_execute` requires `confirm: true` to proceed; dry run first is the intended workflow
- Dry run timeout is 60 seconds; execute timeout is 300 seconds (5 minutes)
- Both tools share the same `rsyncArgsSchema` for consistent parameter handling
- Supports remote paths in `user@host:path` format for SSH-based transfers
- Archive mode (`-a`) is enabled by default; verbose (`-v`) is enabled by default
- `--delete` flag available to remove extraneous files from destination
- No credentials required; this is a local CLI wrapper (SSH keys needed for remote transfers)
