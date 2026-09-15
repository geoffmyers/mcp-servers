---
title: Portainer MCP Server
created: 2026-01-30
modified: 2026-01-30
description: "A Model Context Protocol (MCP) server for managing Docker environments via the Portainer CE/EE REST API. Provides 36 tools, 5 resources, and 3 prompts for comprehensive container management from any..."
tags: [mcp-servers, readme]
---

# Portainer MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for managing Docker environments via the Portainer CE/EE REST API. Provides 36 tools, 5 resources, and 3 prompts for comprehensive container management from any MCP-compatible client (Claude Desktop, Claude Code, etc.).

## Prerequisites

- Node.js 22+
- Portainer CE or EE instance
- API key or user credentials

## Installation

```bash
cd mcp-servers/portainer-mcp-server
npm install
npm run build
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORTAINER_HOST` | Yes | Portainer hostname and port (e.g., `portainer.local:9443`) |
| `PORTAINER_SECURE` | No | Set to `false` to use HTTP instead of HTTPS (default: `true`) |
| `PORTAINER_VERIFY_SSL` | No | Set to `true` to verify SSL certificates (default: `false`) |
| `PORTAINER_API_KEY` | Yes* | API key from Portainer UI → Settings → Access tokens |
| `PORTAINER_USERNAME` | Yes* | Username (if not using API key) |
| `PORTAINER_PASSWORD` | Yes* | Password (if not using API key) |
| `PORT` | No | HTTP transport port (default: `3002`) |

*Either `PORTAINER_API_KEY` or `PORTAINER_USERNAME` + `PORTAINER_PASSWORD` is required.

### 1Password Integration

Generate `.env` from the template:

```bash
op inject -i .env.tpl -o .env
```

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "portainer": {
      "command": "node",
      "args": ["/path/to/mcp-servers/portainer-mcp-server/dist/index.js", "stdio"],
      "env": {
        "PORTAINER_HOST": "portainer.local:9443",
        "PORTAINER_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Code Configuration

```json
{
  "mcpServers": {
    "portainer": {
      "command": "node",
      "args": ["/path/to/mcp-servers/portainer-mcp-server/dist/index.js", "stdio"],
      "env": {
        "PORTAINER_HOST": "portainer.local:9443",
        "PORTAINER_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Transports

| Transport | Command | Use Case |
|-----------|---------|----------|
| **stdio** | `node dist/index.js stdio` | Claude Desktop, Claude Code, local clients |
| **Streamable HTTP** | `node dist/index.js streamableHttp` | Remote clients, multi-session (port 3002) |

## Tools (36)

### System (2)

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_system_info` | Portainer system information | — |
| `get_system_status` | Portainer system status | — |

### Environments (1)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_environments` | List all managed environments | — |

### Stacks (7)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_stacks` | List all stacks | — |
| `create_stack` | Create a Docker Compose stack | `name`, `stackFileContent`, `endpointId`, `env?` |
| `update_stack` | Update a stack's compose file | `id`, `endpointId`, `stackFileContent`, `env?`, `prune?` |
| `delete_stack` | Delete a stack | `id`, `endpointId`, `confirm` |
| `start_stack` | Start a stopped stack | `id`, `endpointId` |
| `stop_stack` | Stop a running stack | `id`, `endpointId` |
| `get_stack_file` | Get stack compose file content | `id` |

### Containers (7)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_containers` | List all containers in an environment | `environmentId` |
| `inspect_container` | Get container details | `environmentId`, `id` |
| `start_container` | Start a container | `environmentId`, `id` |
| `stop_container` | Stop a container | `environmentId`, `id` |
| `restart_container` | Restart a container | `environmentId`, `id` |
| `remove_container` | Remove a container | `environmentId`, `id`, `confirm` |
| `get_container_logs` | Get container logs (last 100 lines) | `environmentId`, `id` |

### Images (4)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_images` | List all images | `environmentId` |
| `pull_image` | Pull an image from a registry | `environmentId`, `fromImage`, `tag?` |
| `remove_image` | Remove an image | `environmentId`, `name`, `confirm` |
| `prune_images` | Remove all unused images | `environmentId`, `confirm` |

### Volumes (3)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_volumes` | List all volumes | `environmentId` |
| `create_volume` | Create a volume | `environmentId`, `Name`, `Driver?` |
| `remove_volume` | Remove a volume | `environmentId`, `name`, `confirm` |

### Networks (3)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_networks` | List all networks | `environmentId` |
| `create_network` | Create a network | `environmentId`, `Name`, `Driver?`, `Internal?` |
| `remove_network` | Remove a network | `environmentId`, `id`, `confirm` |

### Registries (3)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_registries` | List all registries | — |
| `create_registry` | Create a registry configuration | `name`, `type`, `url`, `authentication?`, `username?`, `password?` |
| `update_registry` | Update a registry | `id`, `name?`, `url?`, `authentication?`, `username?`, `password?` |

### Users & Teams (5)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_users` | List all users | — |
| `list_teams` | List all teams | — |
| `update_user_role` | Update user role (1=admin, 2=user) | `id`, `role` |
| `create_team` | Create a team | `name` |
| `update_team_members` | Update team membership | `id`, `userID`, `teamID`, `role` |

### Templates (1)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_templates` | List application templates | — |

## Resources (5)

| URI | Description |
|-----|-------------|
| `portainer://system/info` | System information and version |
| `portainer://environments` | All managed environments |
| `portainer://environment/{id}` | Specific environment by ID |
| `portainer://stacks` | All stacks |
| `portainer://stack/{id}` | Specific stack by ID |

## Prompts (3)

| Prompt | Arguments | Description |
|--------|-----------|-------------|
| `deploy-stack` | `stackName`, `composeContent?` | Guided deployment of a Docker Compose stack |
| `troubleshoot-container` | `containerId` | Diagnose and troubleshoot container issues |
| `environment-overview` | `environmentId` | Generate a status report for an environment |

## Safety

Destructive operations (`delete_stack`, `remove_container`, `remove_image`, `prune_images`, `remove_volume`, `remove_network`) require `confirm: true` to execute.

## Authentication

The server supports two authentication methods:

1. **API Key** (preferred) — Set `PORTAINER_API_KEY`. The key is sent via the `X-API-KEY` header.
2. **Username/Password** — Set `PORTAINER_USERNAME` and `PORTAINER_PASSWORD`. The server authenticates via JWT, automatically refreshing on 401 responses.

## Docker

```bash
docker build -t mcp-server-portainer .
docker run -e PORTAINER_HOST=portainer.local:9443 -e PORTAINER_API_KEY=key mcp-server-portainer
```

## Architecture

```
src/
  index.ts              # Entry point (transport selection)
  server/index.ts       # Server factory (McpServer setup)
  lib/
    portainer-client.ts # REST client with API key / JWT auth
    errors.ts           # PortainerError + formatErrorForMcp()
  tools/                # 10 tool modules (36 tools)
  resources/            # 3 resource modules (5 resources)
  prompts/              # 3 prompt modules
  transports/
    stdio.ts            # stdio transport
    streamableHttp.ts   # Express-based HTTP transport
```

## License

MIT
