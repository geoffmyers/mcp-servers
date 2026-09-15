---
title: Rsync MCP Server
created: 2026-02-06
modified: 2026-02-06
description: A Model Context Protocol (MCP) server wrapping the Unix rsync command. Provides structured tools for file synchronization and transfer with a safe dry-run-first workflow from any MCP-compatible...
tags: [mcp-servers, readme]
---

# Rsync MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server wrapping the Unix `rsync` command. Provides structured tools for file synchronization and transfer with a safe dry-run-first workflow from any MCP-compatible client (Claude Desktop, Claude Code, etc.).

## Features
- **rsync_dry_run** - Preview what rsync would transfer without making any changes
- **rsync_execute** - Execute an rsync transfer (requires explicit confirmation)
- **rsync-transfer prompt** - Natural language prompt to help plan rsync operations
- Dual transport: stdio and Streamable HTTP
- Supports archive mode, compression, include/exclude patterns, delete mode
- Supports local-to-local, local-to-remote, and remote-to-local transfers
- Safety: always dry-run first, then confirm to execute

## Installation

```bash
cd mcp-servers/rsync-mcp-server
npm install
npm run build
```

## Configuration

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "rsync": {
      "command": "node",
      "args": ["/path/to/mcp-servers/rsync-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3013` | HTTP transport port |

## Usage

### Transports

| Transport | Command | Use Case |
|-----------|---------|----------|
| **stdio** | `node dist/index.js stdio` | Claude Desktop, Claude Code, local clients |
| **Streamable HTTP** | `node dist/index.js streamableHttp` | Remote clients, multi-session (port 3013) |

### Example Tool Calls

```json
// Preview a sync operation
{ "tool": "rsync_dry_run", "arguments": { "source": "/src/", "destination": "/backup/", "exclude": ["node_modules", ".git"] } }

// Execute the sync
{ "tool": "rsync_execute", "arguments": { "source": "/src/", "destination": "/backup/", "exclude": ["node_modules", ".git"], "confirm": true } }

// Remote transfer
{ "tool": "rsync_dry_run", "arguments": { "source": "/local/path/", "destination": "user@host:/remote/path/", "compress": true } }
```

## Requirements
- Node.js 18+
- TypeScript
- `rsync` command available on system PATH
- SSH keys configured for remote transfers

## Author
Geoff Myers
