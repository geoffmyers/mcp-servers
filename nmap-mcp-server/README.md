# Nmap MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server wrapping the `nmap` network scanner. Provides structured tools for network discovery, port scanning, service detection, and OS fingerprinting from any MCP-compatible client (Claude Desktop, Claude Code, etc.).

## Features
- **nmap_ping_scan** - Host discovery without port scanning (-sn)
- **nmap_port_scan** - TCP connect scan with optional service version detection
- **nmap_os_detection** - OS fingerprinting to identify target operating systems
- **nmap_quick_scan** - Fast scan of common ports (-F)
- **nmap-scan prompt** - Natural language prompt to help plan network scans
- Dual transport: stdio and Streamable HTTP
- Supports IP addresses, hostnames, CIDR notation, and ranges

## Installation

```bash
cd mcp-servers/nmap-mcp-server
npm install
npm run build
```

## Configuration

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "nmap": {
      "command": "node",
      "args": ["/path/to/mcp-servers/nmap-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3014` | HTTP transport port |

## Usage

### Transports

| Transport | Command | Use Case |
|-----------|---------|----------|
| **stdio** | `node dist/index.js stdio` | Claude Desktop, Claude Code, local clients |
| **Streamable HTTP** | `node dist/index.js streamableHttp` | Remote clients, multi-session (port 3014) |

### Example Tool Calls

```json
// Discover hosts on a subnet
{ "tool": "nmap_ping_scan", "arguments": { "target": "192.0.2.0/24" } }

// Scan specific ports with service detection
{ "tool": "nmap_port_scan", "arguments": { "target": "192.0.2.1", "ports": "22,80,443", "service_detection": true } }

// Quick scan
{ "tool": "nmap_quick_scan", "arguments": { "target": "192.0.2.1" } }
```

## Requirements
- Node.js 18+
- TypeScript
- `nmap` installed and available on system PATH
- Root/sudo may be required for OS detection scans

## Author
Geoff Myers
