---
title: Grep MCP Server
created: 2026-02-06
modified: 2026-02-06
description: "A Model Context Protocol (MCP) server wrapping the Unix grep command. Provides structured tools for searching file contents by pattern from any MCP-compatible client (Claude Desktop, Claude Code,..."
tags: [mcp-servers, readme]
---

# Grep MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server wrapping the Unix `grep` command. Provides structured tools for searching file contents by pattern from any MCP-compatible client (Claude Desktop, Claude Code, etc.).

## Features
- **grep_search** - Search for lines matching a pattern with line numbers, context lines, case-insensitive, and word-boundary options
- **grep_count** - Count matching lines per file
- **grep_files_matching** - List file paths that contain at least one match
- **grep-search prompt** - Natural language prompt to help construct grep queries
- Dual transport: stdio and Streamable HTTP
- Supports regex, fixed strings, include/exclude globs, recursive search
- All operations are read-only

## Installation

```bash
cd mcp-servers/grep-mcp-server
npm install
npm run build
```

## Configuration

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "grep": {
      "command": "node",
      "args": ["/path/to/mcp-servers/grep-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3011` | HTTP transport port |

## Usage

### Transports

| Transport | Command | Use Case |
|-----------|---------|----------|
| **stdio** | `node dist/index.js stdio` | Claude Desktop, Claude Code, local clients |
| **Streamable HTTP** | `node dist/index.js streamableHttp` | Remote clients, multi-session (port 3011) |

### Example Tool Calls

```json
// Search for "TODO" in TypeScript files
{ "tool": "grep_search", "arguments": { "pattern": "TODO", "path": "/project", "include": "*.ts" } }

// Count matches per file
{ "tool": "grep_count", "arguments": { "pattern": "import", "path": "/project/src", "include": "*.ts" } }

// List files containing "error" (case-insensitive)
{ "tool": "grep_files_matching", "arguments": { "pattern": "error", "path": "/var/log", "ignore_case": true } }
```

## Requirements
- Node.js 18+
- TypeScript
- `grep` command available on system PATH

## Author
Geoff Myers
