# Xargs MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server wrapping the Unix `xargs` command. Provides a structured tool for executing batch commands with arguments built from input items, with a command allowlist for safety, from any MCP-compatible client (Claude Desktop, Claude Code, etc.).

## Features
- **xargs_execute** - Execute a command with arguments built from a list of input items
- Dual transport: stdio and Streamable HTTP
- Command allowlist prevents execution of arbitrary commands
- Supports parallel execution (-P) and argument batching (-n)
- Requires explicit confirmation before execution

## Allowed Commands
Only the following commands can be used with `xargs_execute`:
`echo`, `ls`, `wc`, `file`, `stat`, `md5sum`, `sha256sum`, `basename`, `dirname`, `cat`, `head`, `tail`

## Installation

From the repository root (the servers are one npm workspace):

```bash
npm ci
npm run build
```

## Configuration

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "xargs": {
      "command": "node",
      "args": ["/path/to/mcp-servers/xargs-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3015` | HTTP transport port |

## Usage

### Transports

| Transport | Command | Use Case |
|-----------|---------|----------|
| **stdio** | `node dist/index.js stdio` | Claude Desktop, Claude Code, local clients |
| **Streamable HTTP** | `node dist/index.js streamableHttp` | Remote clients, multi-session (port 3015) |

### Example Tool Calls

```json
// Get file info for a list of paths
{ "tool": "xargs_execute", "arguments": { "command": "file", "items": ["/path/a.txt", "/path/b.jpg"], "confirm": true } }

// Count lines in multiple files
{ "tool": "xargs_execute", "arguments": { "command": "wc", "items": ["/file1.txt", "/file2.txt"], "max_args": 1, "confirm": true } }

// Compute checksums in parallel
{ "tool": "xargs_execute", "arguments": { "command": "md5sum", "items": ["/a.bin", "/b.bin", "/c.bin"], "max_procs": 4, "confirm": true } }
```

## Requirements
- Node.js 18+
- TypeScript
- `xargs` command available on system PATH

## Author
Geoff Myers
