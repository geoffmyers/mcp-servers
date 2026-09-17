# CLAUDE.md - Sed MCP Server

## Project Overview
MCP server wrapping the Unix `sed` command. Provides 3 tools and 1 prompt for text substitution (preview and in-place replacement with backup) and line extraction. Includes safety features: preview-before-replace workflow and automatic backup file creation.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/tools/sed.ts` - Tool implementations: sed_preview, sed_replace, sed_extract, plus the exported helpers they use (`appendSedFlags`, `parseSedSubstitution`, `buildInPlaceArgs`, `isGnuSed`)
- `src/tools/index.ts` - Tool registration
- `src/prompts/` - Prompt definitions
- `src/resources/index.ts` - Resource registration (none currently)
- `test/sed.test.js` - `node:test` suite (unit tests for the helpers + integration tests against the real local `sed`); imports the built `dist/tools/sed.js`, so it is plain JS run directly, not compiled by `tsc`
- `docs/instructions.md` - Server instructions bundled into dist/
- `package.json` - Dependencies and scripts

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm test` (or `npm run build && npm test`) - Run the `node:test` suite against the built output
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
- `sed_replace` requires `confirm: true` and creates a backup file (default suffix `.bak`; pass `backup_suffix: ''` for no backup)
- `-i` handling is GNU/BSD-aware, detected once via `sed --version` (`isGnuSed()`, cached): a non-empty suffix is always attached in one argument (`-i.bak`, which both flavors accept); an empty suffix is bare `-i` on GNU but `-i ''` (suffix as its own argument) on BSD/macOS — a bare `-i` on BSD instead consumes the next argument (the pattern) as the suffix. `sed.ts:buildInPlaceArgs()`
- The `global`, `case_insensitive`, and `extended_regex` flags are appended to the pattern via `appendSedFlags()`, which parses the pattern's own delimiter (not just `/`) and respects backslash-escaped delimiters. An unparseable pattern returns an explicit tool error instead of silently dropping the flags
- Pattern flags (g, I) are appended after the trailing delimiter, merging with and de-duplicating any flags already in the pattern (`s/old/new/g` + `I` -> `s/old/new/gI`)
- Tests: `npm run build && npm test` (`node --test test/*.test.js`); the integration tests shell out to the real local `sed`, so they exercise GNU sed in CI (node:22-bookworm) and whatever `sed` the developer has locally
- No credentials required; this is a local CLI wrapper
