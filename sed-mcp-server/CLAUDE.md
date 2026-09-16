# CLAUDE.md - Sed MCP Server

## Project Overview
MCP server wrapping the Unix `sed` command. Provides 3 tools and 1 prompt for text substitution (preview and in-place replacement with backup) and line extraction. Includes safety features: preview-before-replace workflow and automatic backup file creation.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/tools/sed.ts` - Tool implementations: sed_preview, sed_replace, sed_extract
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
- `npm run start:streamableHttp` - Start with HTTP transport (port 3012)

## Tool Definitions
| Tool | Description |
|------|-------------|
| `sed_preview` | Preview a sed substitution without modifying the file (dry run) |
| `sed_replace` | Perform an in-place substitution on a file (creates .bak backup, requires `confirm: true`) |
| `sed_extract` | Extract lines from a file using sed -n (line ranges, pattern matches) |

## Prompts
| Prompt | Description |
|--------|-------------|
| `sed-transform` | Help construct sed expressions from a natural language description |

## Common Tasks
- **Add a new tool**: Create or edit `src/tools/sed.ts`, register via `server.tool()` with Zod schema
- **Add a new prompt**: Create file in `src/prompts/`, register in `src/prompts/index.ts`
- **Test locally**: `npm run build && node dist/index.js stdio`
- **Update instructions**: Edit `docs/instructions.md` (copied to dist/ during build)

## Gotchas
- Default HTTP port is 3012 (override with PORT env var)
- Build step copies `docs/` into `dist/docs/` for runtime instruction loading
- `sed_replace` requires `confirm: true` and creates a backup file (default suffix `.bak`)
- Uses macOS sed `-i` syntax (suffix as separate argument): `sed -i '.bak' 's/old/new/' file`
- The `global`, `case_insensitive`, and `extended_regex` flags are appended to the pattern automatically
- Pattern flags (g, I) are appended before the trailing `/` delimiter
- No credentials required; this is a local CLI wrapper
