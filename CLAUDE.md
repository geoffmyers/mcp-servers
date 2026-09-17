# CLAUDE.md - MCP Servers

## Project Overview

Custom [Model Context Protocol](https://modelcontextprotocol.io/) servers for infrastructure management and CLI tool access. All servers are TypeScript/Node.js with dual transport support (stdio for Claude Code, streamable HTTP for web clients).

## Server Categories

### Infrastructure API Servers (require credentials)

| Server | Description | Tools | Resources | Prompts | Port |
|--------|-------------|-------|-----------|---------|------|
| portainer | Portainer CE REST API | 36 | 5 | 3 | 3002 |

> The earlier `truenas`/`pfsense`/`unifi` REST/WebSocket servers were retired (2026-06-17) in favour of the CLI-based servers below and are not part of the published repository.

### CLI Tool Servers (no credentials)

| Server | Description | Tools | Prompts | Port |
|--------|-------------|-------|---------|------|
| find | File search with `find` | 3 | 1 | 3010 |
| grep | Content search with `grep` | 3 | 1 | 3011 |
| sed | Stream editing with `sed` | 3 | 1 | 3012 |
| rsync | File sync with `rsync` | 2 | 1 | 3013 |
| nmap | Network scanning with `nmap` | 4 | 1 | 3014 |
| xargs | Parallel execution with `xargs` | 1 | 0 | 3015 |

### CLI-Based Infrastructure Servers (SSH, no API credentials)

| Server | Description | Tools | Resources | Prompts | Port |
|--------|-------------|-------|-----------|---------|------|
| docker-cli | Docker CLI via local/SSH | 35 | 2 | 2 | 3020 |
| homeassistant-cli | Home Assistant CLI via local/SSH | 31 | 3 | 2 | 3021 |
| esphome-cli | ESPHome CLI via local/SSH | 10 | 1 | 1 | 3022 |
| truenas-cli | TrueNAS SCALE CLI via midclt | 44 | 3 | 2 | 3023 |
| pfsense-cli | pfSense CLI via local/SSH | 27 | 3 | 2 | 3024 |
| zigbee2mqtt | Zigbee2MQTT via MQTT+Docker | 25 | 2 | 2 | 3025 |
| zwavejs | Z-Wave JS UI via MQTT+Docker | 22 | 2 | 2 | 3026 |
| unifi-cli | UniFi CLI via MongoDB+Docker | 19 | 3 | 2 | 3027 |

### Knowledge Base Servers (Qdrant + Ollama)

| Server | Description | Tools | Resources | Prompts | Port |
|--------|-------------|-------|-----------|---------|------|
| markdown-rag | Semantic + hybrid search over `*.md` via Qdrant + Ollama `nomic-embed-text` | 4 | 1 | 1 | 3028 |

## Architecture

This directory is an **npm workspace**. The top-level `package.json` declares all servers + the shared package as workspaces so `@modelcontextprotocol/sdk` and other devDeps hoist to a single install. Without workspaces, each server's local `node_modules/@modelcontextprotocol/sdk` resolves to a different version than the shared package's copy, and TypeScript fails on type collisions.

Every server has the same shape:

```
{name}-mcp-server/
  package.json                    # workspace member; deps on @geoffmyers/mcp-server-shared
  tsconfig.json                   # extends ../mcp-server-shared/tsconfig.base.json
  CLAUDE.md                       # Per-server AI assistant context
  docs/instructions.md            # LLM-facing documentation
  src/
    index.ts                      # 5-line `runCli()` call — identical across all servers
    server/index.ts               # `createServerFactory({ name, title, version, ... })`
    lib/                          # Only present when there's real custom logic:
      {service}-client.ts         #   - API servers: HTTP/REST client
      errors.ts                   #   - API servers: custom error class
      mqtt.ts / mongo.ts          #   - protocol-specific helpers
    tools/                        # MCP tool registrations
    resources/                    # MCP resource registrations
    prompts/                      # MCP prompt registrations
```

`src/transports/` no longer exists in any server — stdio + streamableHttp are owned by shared and reached via `runCli()`. The 6 wrapper-CLI servers (find/grep/sed/rsync/nmap/xargs) also no longer have a `lib/` directory; their executor and error helpers come from shared.

### Shared Package

`mcp-server-shared/` (`@geoffmyers/mcp-server-shared`) provides:
- `runCli({ name, createServer, defaultPort })` — single entry point that switches stdio ↔ streamableHttp based on `process.argv[2]`
- `createServerFactory({ name, title, version, instructionsPath, fallbackInstructions, registerTools, registerResources, registerPrompts })` — McpServer construction + instructions loading
- `executeAuto(config, command, args, options?)` — routes to local `execute()` or remote `executeRemote()` per config
- `executeWithStdin(command, args, stdin, options?)` — child process with stdin (used by xargs)
- `getServerConfig()` — reads `EXECUTION_MODE` + `SSH_HOST` from env
- `McpToolError` + `formatErrorForMcp()` — uniform error handling
- `startStdio()` + `startStreamableHttp()` — low-level transports if you need them directly
- `tsconfig.base.json` — every server extends this

`@modelcontextprotocol/sdk` and `zod` are **peer dependencies** of shared so the consumer-installed version wins. devDependencies pin the same versions only so shared can build standalone.

## Development Commands

```bash
# From mcp-servers/ (workspace root):
npm install                     # installs everything; hoists deps
npm run build                   # builds shared first, then all servers in topo order
npm run watch                   # tsc --watch across all workspaces
npm run clean                   # rm -rf node_modules + dist everywhere

# Single server:
npm run build --workspace=find-mcp-server
node find-mcp-server/dist/index.js stdio              # stdio transport
node find-mcp-server/dist/index.js streamableHttp     # HTTP on port 3010
```

Build artifacts (`dist/`) and the workspace-root `node_modules/` are gitignored. Per-server `node_modules/` and `package-lock.json` should not exist — if they do, run `npm run clean && npm install` from the workspace root.

## Common Tasks

- **Add a new tool**: Create or edit files in `src/tools/`, register via `server.tool()` with Zod schema
- **Add a new resource**: Create file in `src/resources/`, register in `src/resources/index.ts`
- **Add a new prompt**: Create file in `src/prompts/`, register in `src/prompts/index.ts`
- **Create a new server**: Copy an existing server directory, update package.json name/description/port
- **Update instructions**: Edit `docs/instructions.md` (copied to `dist/docs/` during build)

## Configuration

Each server reads its settings from environment variables; `.env.example` in each
server directory lists them. Register a server with your MCP client (for Claude Code,
an entry in `.mcp.json`) pointing at its built `dist/index.js`; see README.md.

## Safety

- Infrastructure servers accept self-signed TLS certificates
- CLI tool servers use `execFile` (array args, no shell) to prevent injection
- Destructive operations (sed replace, rsync execute) require `confirm: true`
- xargs only allows a curated list of safe commands
- Output truncated at 100KB to prevent memory issues

## Gotchas

- Always install/build from `mcp-servers/` (workspace root), not from a single server's directory. `cd <server> && npm install` would create a per-server `node_modules/` and re-introduce the SDK version-drift problem the workspace solves.
- `npm install` in a fresh workspace only runs the shared package's `prepare` (which builds it). Consumers do NOT auto-build — run `npm run build` from the workspace root afterwards.
- If you copy an existing server to make a new one: keep `prepare` OUT of the new package.json scripts (only shared has it), include `"@geoffmyers/mcp-server-shared": "file:../mcp-server-shared"` as a dep, and rely on `runCli()` in `src/index.ts` + `createServerFactory()` in `src/server/index.ts`.
- Build step copies `docs/` into `dist/docs/` for runtime instruction loading.
- Default HTTP ports vary per server (3001–3027); override with `PORT` env var.
- CLI-based servers use `EXECUTION_MODE=ssh` and `SSH_HOST=hostname` env vars for remote execution.
- This project is developed in a private repository and published to
  GitHub (`geoffmyers/mcp-servers`) as a snapshot: each publish adds one commit.
  Pull requests are applied upstream first; see CONTRIBUTING.md.
