# Docker CLI MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for
managing Docker: containers, images, volumes, networks, and Compose stacks.
It shells out to the `docker` CLI (`execFile`, no shell interpolation) either
on the local machine or on a remote host over SSH, so it works the same way
whether the server runs next to the Docker daemon or on a separate box that
reaches it over the network.

## Requirements
- Node.js 20.6+
- TypeScript
- `docker` CLI on `PATH` (local mode) or an SSH-reachable host with `docker`
  installed (remote mode)
- For remote mode: SSH key-based access to `SSH_HOST` (no password prompt)

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
    "docker-cli": {
      "command": "node",
      "args": ["/path/to/mcp-servers/docker-cli-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

### Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXECUTION_MODE` | No | `local` | `local` runs `docker` directly; `ssh` runs it over SSH on `SSH_HOST` |
| `SSH_HOST` | Only if `EXECUTION_MODE=ssh` | — | SSH host (from `~/.ssh/config` or `user@host`) that owns the Docker daemon |
| `PORT` | No | `3020` | HTTP transport port |

See `.env.example` for a filled-in template.

## Tools

35 tools across containers, images, volumes, networks, Compose stacks, and
system-level operations. 8 are destructive and require `confirm: true`.

| Tool | Description |
|------|-------------|
| `list_containers` | List Docker containers (running by default, or all with include_stopped) |
| `inspect_container` | Get detailed information about a container |
| `container_logs` | View logs from a container |
| `start_container` | Start a stopped container |
| `stop_container` | Stop a running container |
| `restart_container` | Restart a container |
| `remove_container` | Remove a container (requires `confirm: true`) |
| `exec_container` | Execute a command in a running container |
| `cp_container` | Copy files between container and host |
| `container_stats` | Get resource usage stats for containers |
| `container_top` | List processes in a container |
| `rename_container` | Rename a container |
| `pause_container` | Pause a container |
| `unpause_container` | Unpause a container |
| `list_images` | List Docker images |
| `pull_image` | Pull a Docker image from a registry |
| `remove_image` | Remove a Docker image (requires `confirm: true`) |
| `prune_images` | Remove unused Docker images (requires `confirm: true`) |
| `list_volumes` | List Docker volumes |
| `create_volume` | Create a Docker volume |
| `remove_volume` | Remove a Docker volume (requires `confirm: true`) |
| `inspect_volume` | Get detailed information about a Docker volume |
| `list_networks` | List Docker networks |
| `inspect_network` | Get detailed information about a Docker network |
| `create_network` | Create a Docker network |
| `remove_network` | Remove a Docker network (requires `confirm: true`) |
| `compose_up` | Deploy a Docker Compose stack (`docker compose up -d`) |
| `compose_down` | Tear down a Docker Compose stack (requires `confirm: true`) |
| `compose_status` | View status of a Docker Compose stack |
| `compose_logs` | View logs from a Docker Compose stack |
| `compose_pull` | Pull latest images for a Docker Compose stack |
| `compose_exec` | Execute a command in a running Compose service container |
| `compose_restart` | Restart Compose services (requires `confirm: true`) |
| `system_info` | Get Docker system information |
| `system_prune` | Remove unused Docker data — containers, images, networks (requires `confirm: true`) |

## Resources
| Resource | Description |
|----------|-------------|
| `containers` | Current container list |
| `system-info` | Docker system information |

## Prompts
| Prompt | Description |
|--------|-------------|
| `container-health` | Diagnose the health of a Docker container |
| `stack-status` | Check the status of a Docker Compose stack |

## Safety
- Destructive operations (`remove_*`, `prune_*`, `compose_down`, `compose_restart`) require an explicit `confirm: true` argument.
- All commands run via `execFile` (array arguments, no shell), so tool inputs cannot inject shell metacharacters.
- No credentials are stored by this server; SSH auth relies on your existing SSH key setup.

## Author
Geoff Myers
