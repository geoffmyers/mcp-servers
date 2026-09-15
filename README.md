---
title: MCP Servers
created: 2026-01-31
modified: 2026-01-31
description: "Custom Model Context Protocol servers for infrastructure management and CLI tool access. All servers are TypeScript/Node.js with dual transport support (stdio for Claude Code, streamable HTTP for web..."
tags: [mcp-servers, readme]
---

# MCP Servers

Custom [Model Context Protocol](https://modelcontextprotocol.io/) servers for infrastructure management and CLI tool access. All servers are TypeScript/Node.js with dual transport support (stdio for Claude Code, streamable HTTP for web clients).

## Infrastructure Servers

These servers require credentials configured via environment variables. See each server's `.env.tpl` for 1Password references.

| Server | Description | Tools | Resources | Prompts | Port |
| --- | --- | --- | --- | --- | --- |
| [portainer](portainer-mcp-server/) | Portainer CE REST API | 36 | 5 | 3 | 3002 |

> **Archived 2026-06-17:** the `truenas` (WebSocket), `pfsense` (REST v2), and `unifi` (REST) servers moved to [`_archive/`](_archive/). They were never wired into `.mcp.json` (Claude Code uses the `-cli` variants below) nor the Claude Desktop config (which uses external `uvx`/`npx` packages). Unarchive if a REST/write transport is ever needed.

## CLI Tool Servers

These servers wrap command-line tools using `execFile` (array args, no shell) for safe execution. No credentials required.

| Server | Description | Tools | Prompts | Port |
| --- | --- | --- | --- | --- |
| [find](find-mcp-server/) | File search with `find` | 3 | 1 | 3010 |
| [grep](grep-mcp-server/) | Content search with `grep` | 3 | 1 | 3011 |
| [sed](sed-mcp-server/) | Stream editing with `sed` | 3 | 1 | 3012 |
| [rsync](rsync-mcp-server/) | File sync with `rsync` | 2 | 1 | 3013 |
| [nmap](nmap-mcp-server/) | Network scanning with `nmap` | 4 | 1 | 3014 |
| [xargs](xargs-mcp-server/) | Parallel execution with `xargs` | 1 | 0 | 3015 |

## CLI-Based Infrastructure Servers (SSH, no API credentials)

| Server | Description | Tools | Resources | Prompts | Port |
| --- | --- | --- | --- | --- | --- |
| [docker-cli](docker-cli-mcp-server/) | Docker CLI via local/SSH | 35 | 2 | 2 | 3020 |
| [homeassistant-cli](homeassistant-cli-mcp-server/) | Home Assistant CLI via local/SSH | 31 | 3 | 2 | 3021 |
| [esphome-cli](esphome-cli-mcp-server/) | ESPHome CLI via local/SSH | 10 | 1 | 1 | 3022 |
| [truenas-cli](truenas-cli-mcp-server/) | TrueNAS SCALE CLI via midclt | 43 | 3 | 2 | 3023 |
| [pfsense-cli](pfsense-cli-mcp-server/) | pfSense CLI via local/SSH | 27 | 3 | 2 | 3024 |
| [zigbee2mqtt](zigbee2mqtt-mcp-server/) | Zigbee2MQTT via MQTT+Docker | 25 | 2 | 2 | 3025 |
| [zwavejs](zwavejs-mcp-server/) | Z-Wave JS UI via MQTT+Docker | 22 | 2 | 2 | 3026 |
| [unifi-cli](unifi-cli-mcp-server/) | UniFi CLI via MongoDB+Docker | 19 | 3 | 2 | 3027 |

## Knowledge Base Servers (Qdrant + Ollama)

| Server | Description | Tools | Resources | Prompts | Port |
| --- | --- | --- | --- | --- | --- |
| [markdown-rag](markdown-rag-mcp-server/) | Semantic + hybrid search over `*.md` via Qdrant + Ollama `nomic-embed-text` | 4 | 1 | 1 | 3028 |

## Building

```bash
# Build a single server
cd mcp-servers/find-mcp-server && npm install

# Build all servers
for d in mcp-servers/*-mcp-server; do (cd "$d" && npm install); done
```

## Configuration

MCP servers are configured in the repository root:

- `.mcp.json` — Live configuration with real credentials (gitignored)
- `.mcp.json.tpl` — Template with `${VAR}` placeholders for 1Password injection
- `.mcp.json.example` — Example with `YOUR_*` placeholders for documentation

### Running via stdio (Claude Code)

Servers are configured in `.mcp.json` and started automatically by Claude Code:

```json
{
  "find": {
    "command": "node",
    "args": ["mcp-servers/find-mcp-server/dist/index.js"]
  }
}
```

### Running via HTTP

```bash
node mcp-servers/find-mcp-server/dist/index.js streamableHttp
# Listens on port 3010
```

## Architecture

All servers share a consistent structure:

```
{name}-mcp-server/
  package.json
  tsconfig.json
  Dockerfile
  docs/instructions.md          # LLM-facing documentation
  src/
    index.ts                    # Entry point (stdio or streamableHttp)
    server/index.ts             # Server factory
    lib/
      executor.ts               # CLI: safe command executor (execFile)
      {service}-client.ts       # Infra: API client with auth
      errors.ts                 # Error handling
    tools/                      # MCP tool registrations
    resources/                  # MCP resource registrations
    prompts/                    # MCP prompt registrations
    transports/
      stdio.ts                  # Standard I/O transport
      streamableHttp.ts         # HTTP transport (Express 5)
```

## Safety

- Infrastructure servers accept self-signed TLS certificates
- CLI tool servers use `execFile` (array args, no shell) to prevent injection
- Destructive operations (sed replace, rsync execute) require `confirm: true`
- xargs only allows a curated list of safe commands
- Output truncated at 100KB to prevent memory issues
