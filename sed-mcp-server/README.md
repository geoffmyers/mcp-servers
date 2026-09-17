# Sed MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server wrapping the Unix `sed` command. Provides structured tools for text substitution and line extraction with built-in safety features (preview mode and automatic backups) from any MCP-compatible client (Claude Desktop, Claude Code, etc.).

## Features
- **sed_preview** - Preview substitution output without modifying the file (dry run)
- **sed_replace** - In-place substitution with automatic backup file creation (requires confirmation)
- **sed_extract** - Extract lines by range or pattern using `sed -n`
- **sed-transform prompt** - Natural language prompt to help construct sed expressions
- Dual transport: stdio and Streamable HTTP
- Supports extended regex, global replacement, case-insensitive matching
- Safety: preview-before-replace workflow, automatic `.bak` backup on replace

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
    "sed": {
      "command": "node",
      "args": ["/path/to/mcp-servers/sed-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3012` | HTTP transport port |

## Usage

### Transports

| Transport | Command | Use Case |
|-----------|---------|----------|
| **stdio** | `node dist/index.js stdio` | Claude Desktop, Claude Code, local clients |
| **Streamable HTTP** | `node dist/index.js streamableHttp` | Remote clients, multi-session (port 3012) |

### Example Tool Calls

```json
// Preview a substitution
{ "tool": "sed_preview", "arguments": { "pattern": "s/foo/bar/", "file": "/path/to/file.txt", "global": true } }

// Apply the substitution (creates file.txt.bak)
{ "tool": "sed_replace", "arguments": { "pattern": "s/foo/bar/", "file": "/path/to/file.txt", "global": true, "confirm": true } }

// Extract lines 10-20
{ "tool": "sed_extract", "arguments": { "expression": "10,20p", "file": "/path/to/file.txt" } }
```

## Requirements
- Node.js 18+
- TypeScript
- `sed` command available on system PATH (macOS or GNU sed)

## Author
Geoff Myers
