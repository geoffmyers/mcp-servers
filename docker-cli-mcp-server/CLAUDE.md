# CLAUDE.md - Docker CLI MCP Server

## Project Overview
MCP server wrapping the Docker CLI for container, image, volume, network, and Compose management. Supports local or SSH execution via `@geoffmyers/mcp-server-shared`. Provides 35 tools, 2 resources, and 2 prompts.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/tools/containers.ts` - Container tools: list, inspect, logs, start, stop, restart, remove, exec, cp, stats, top, rename, pause, unpause
- `src/tools/images.ts` - Image tools: list, pull, remove, prune
- `src/tools/volumes.ts` - Volume tools: list, create, remove, inspect
- `src/tools/networks.ts` - Network tools: list, inspect, create, remove
- `src/tools/compose.ts` - Compose tools: up, down, status, logs, pull, exec, restart
- `src/tools/system.ts` - System tools: info, prune
- `src/tools/index.ts` - Tool registration
- `src/resources/index.ts` - Resources: docker://containers, docker://system/info
- `src/prompts/container-health.ts` - Container health diagnosis prompt
- `src/prompts/stack-status.ts` - Compose stack status check prompt
- `docs/instructions.md` - Server instructions bundled into dist/
- `.env.tpl` - Environment configuration (EXECUTION_MODE, SSH_HOST)

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3020)

## Tool Definitions
| Tool | Description |
|------|-------------|
| `list_containers` | List Docker containers |
| `inspect_container` | Get detailed container info |
| `container_logs` | View container logs |
| `start_container` | Start a stopped container |
| `stop_container` | Stop a running container |
| `restart_container` | Restart a container |
| `remove_container` | Remove a container (confirm required) |
| `exec_container` | Execute a command in a running container |
| `cp_container` | Copy files between container and host |
| `container_stats` | Get resource usage stats for containers |
| `container_top` | List processes in a container |
| `rename_container` | Rename a container |
| `pause_container` | Pause a container |
| `unpause_container` | Unpause a container |
| `list_images` | List Docker images |
| `pull_image` | Pull an image from registry |
| `remove_image` | Remove an image (confirm required) |
| `prune_images` | Remove unused images (confirm required) |
| `list_networks` | List Docker networks |
| `inspect_network` | Get network details |
| `create_network` | Create a Docker network |
| `remove_network` | Remove a Docker network (confirm required) |
| `list_volumes` | List Docker volumes |
| `create_volume` | Create a volume |
| `remove_volume` | Remove a volume (confirm required) |
| `inspect_volume` | Get detailed volume info |
| `compose_up` | Deploy a Compose stack |
| `compose_down` | Tear down a Compose stack (confirm required) |
| `compose_status` | View Compose stack status |
| `compose_logs` | View Compose stack logs |
| `compose_pull` | Pull latest images for a stack |
| `compose_exec` | Execute a command in a Compose service container |
| `compose_restart` | Restart Compose services (confirm required) |
| `system_info` | Get Docker system info |
| `system_prune` | Remove unused Docker data (confirm required) |

## Gotchas
- Default HTTP port is 3020 (override with PORT env var)
- Destructive operations (remove, prune, down) require `confirm: true` parameter
- Build step copies `docs/` into `dist/docs/` for runtime instruction loading
- No API credentials needed; uses SSH key-based auth or local Docker CLI
