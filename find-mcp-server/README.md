# Find MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server wrapping the Unix `find` command. Provides structured tools for searching files and directories by name, type, size, modification time, and content from any MCP-compatible client (Claude Desktop, Claude Code, etc.).

## Features
- **find_files** - Find files/directories by name pattern (glob), type (file/dir/symlink), size, modification time, depth, and empty flag
- **find_by_content** - Find files containing specific text patterns (combines find with grep)
- **find_duplicates** - Detect potential duplicate files by grouping files with identical sizes
- **find-files prompt** - Natural language prompt to help construct find queries
- Dual transport: stdio and Streamable HTTP
- All operations are read-only (no file modification or deletion)

## Installation

```bash
cd mcp-servers/find-mcp-server
npm install
npm run build
```

## Configuration

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "find": {
      "command": "node",
      "args": ["/path/to/mcp-servers/find-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3010` | HTTP transport port |

## Usage

### Transports

| Transport | Command | Use Case |
|-----------|---------|----------|
| **stdio** | `node dist/index.js stdio` | Claude Desktop, Claude Code, local clients |
| **Streamable HTTP** | `node dist/index.js streamableHttp` | Remote clients, multi-session (port 3010) |

### Example Tool Calls

```json
// Find all TypeScript files
{ "tool": "find_files", "arguments": { "path": "/project", "name": "*.ts", "type": "f" } }

// Find files modified in the last 7 days
{ "tool": "find_files", "arguments": { "path": "/home", "mtime": "-7", "type": "f" } }

// Find files containing "TODO"
{ "tool": "find_by_content", "arguments": { "path": "/project", "pattern": "TODO", "name": "*.ts" } }

// Find duplicate files
{ "tool": "find_duplicates", "arguments": { "path": "/documents" } }
```

## Requirements
- Node.js 18+
- TypeScript
- `find` command available on system PATH

## Author
Geoff Myers
