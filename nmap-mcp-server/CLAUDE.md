---
title: CLAUDE.md - Nmap MCP Server
created: 2026-02-06
modified: 2026-02-06
description: "MCP server wrapping the nmap network scanner. Provides 4 tools and 1 prompt for network discovery, port scanning, service detection, and OS fingerprinting. All operations are read-only network scans."
tags: [mcp-servers, claude]
---

# CLAUDE.md - Nmap MCP Server

## Project Overview
MCP server wrapping the `nmap` network scanner. Provides 4 tools and 1 prompt for network discovery, port scanning, service detection, and OS fingerprinting. All operations are read-only network scans.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/tools/nmap.ts` - Tool implementations: nmap_ping_scan, nmap_port_scan, nmap_os_detection, nmap_quick_scan
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
- `npm run start:streamableHttp` - Start with HTTP transport (port 3014)

## Tool Definitions
| Tool | Description |
|------|-------------|
| `nmap_ping_scan` | Host discovery scan (-sn), finds live hosts without port scanning |
| `nmap_port_scan` | TCP connect port scan (-sT) with optional service version detection (-sV) |
| `nmap_os_detection` | OS fingerprinting scan (-O), identifies target operating system |
| `nmap_quick_scan` | Fast scan (-F), scans fewer ports for speed |

## Prompts
| Prompt | Description |
|--------|-------------|
| `nmap-scan` | Help plan and execute network scans |

## Common Tasks
- **Add a new tool**: Create or edit `src/tools/nmap.ts`, register via `server.tool()` with Zod schema
- **Add a new prompt**: Create file in `src/prompts/`, register in `src/prompts/index.ts`
- **Test locally**: `npm run build && node dist/index.js stdio`
- **Update instructions**: Edit `docs/instructions.md` (copied to dist/ during build)

## Gotchas
- Default HTTP port is 3014 (override with PORT env var)
- Build step copies `docs/` into `dist/docs/` for runtime instruction loading
- Only TCP connect scan (`-sT`) is exposed; SYN scan (`-sS`) requires root privileges
- OS detection (`-O`) may require root/sudo for raw socket access
- Each tool accepts an optional `timeout` parameter (milliseconds) for long-running scans
- Target accepts IP addresses, hostnames, CIDR notation, and ranges
- Port specification supports comma-separated, ranges, and protocol prefixes (e.g., `U:53,T:25,80`)
- No credentials required; this is a local CLI wrapper
- nmap must be installed separately (not bundled)
