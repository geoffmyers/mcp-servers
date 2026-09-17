# Home Assistant CLI MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server
wrapping the [Home Assistant `ha` CLI](https://www.home-assistant.io/) —
the Supervisor-level tool available on Home Assistant OS and Supervised
installs. Covers Core, Supervisor, add-ons, the OS, the host, the Resolution
Center, and backups. This is a **Supervisor CLI**, so it only applies to
Home Assistant OS / Supervised deployments, not a plain Docker or Core-only
install (which has no `ha` binary to wrap).

## Requirements
- Node.js 20.6+
- TypeScript
- The `ha` CLI available on the target host (Home Assistant OS / Supervised),
  or SSH access to a host that has it
- For remote mode: SSH key-based access to `SSH_HOST`

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
    "homeassistant-cli": {
      "command": "node",
      "args": ["/path/to/mcp-servers/homeassistant-cli-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

### Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXECUTION_MODE` | No | `local` | `local` runs `ha` directly; `ssh` runs it over SSH on `SSH_HOST` |
| `SSH_HOST` | Only if `EXECUTION_MODE=ssh` | — | SSH host that has the `ha` CLI |
| `PORT` | No | `3021` | HTTP transport port |

See `.env.example` for a filled-in template.

## Tools

31 tools, 13 of which are destructive and require `confirm: true`.

| Tool | Description |
|------|-------------|
| `core_info` | Get Home Assistant Core information (version, state, etc.) |
| `core_stats` | Get Home Assistant Core resource usage statistics (CPU, memory) |
| `core_restart` | Restart Home Assistant Core (requires `confirm: true`) |
| `core_update` | Update Home Assistant Core to the latest version (requires `confirm: true`) |
| `core_check_config` | Validate the Home Assistant configuration |
| `supervisor_info` | Get Supervisor information (version, state, add-on count, etc.) |
| `supervisor_logs` | View Supervisor logs |
| `supervisor_update` | Update the Supervisor to the latest version (requires `confirm: true`) |
| `addon_list` | List all installed Home Assistant add-ons |
| `addon_info` | Get detailed information about a specific add-on |
| `addon_start` | Start a Home Assistant add-on |
| `addon_stop` | Stop a running Home Assistant add-on (requires `confirm: true`) |
| `addon_restart` | Restart a Home Assistant add-on (requires `confirm: true`) |
| `addon_update` | Update a Home Assistant add-on to the latest version (requires `confirm: true`) |
| `addon_logs` | View logs from a Home Assistant add-on |
| `addon_install` | Install a Home Assistant add-on (requires `confirm: true`) |
| `addon_uninstall` | Uninstall a Home Assistant add-on (requires `confirm: true`) |
| `addon_stats` | View resource usage statistics for a Home Assistant add-on |
| `os_info` | Get Home Assistant OS information (version, board, boot slot, etc.) |
| `os_update` | Update Home Assistant OS to the latest version (requires `confirm: true`) |
| `host_info` | Get host system information (hostname, OS, kernel, etc.) |
| `host_reboot` | Reboot the Home Assistant host (requires `confirm: true`) |
| `host_shutdown` | Shut down the Home Assistant host (requires `confirm: true`) |
| `resolution_info` | Get Resolution Center information (issues, suggestions, and unhealthy systems) |
| `resolution_check` | Run a specific Resolution Center check by slug (get available slugs from `resolution_info`) |
| `backup_list` | List all Home Assistant backups |
| `backup_info` | Get detailed information about a specific backup |
| `backup_create` | Create a new Home Assistant backup |
| `backup_restore` | Restore Home Assistant from a backup (requires `confirm: true`) |
| `backup_remove` | Remove a Home Assistant backup (requires `confirm: true`) |
| `network_info` | Get Home Assistant network configuration |

## Resources
| Resource | Description |
|----------|-------------|
| `core-info` | Home Assistant Core information (version, state, etc.) |
| `addons` | List of all installed Home Assistant add-ons |
| `resolution` | Resolution Center information (issues and suggestions) |

## Prompts
| Prompt | Description |
|--------|-------------|
| `health-check` | Perform a comprehensive Home Assistant health check |
| `diagnose-addon` | Diagnose issues with a Home Assistant add-on |

## Safety
- 13 of the 31 tools — restarts, updates, installs/uninstalls, host reboot/shutdown, and backup restore/remove — require an explicit `confirm: true` argument.
- All commands run via `execFile` (array arguments, no shell), so tool inputs cannot inject shell metacharacters.
- `host_reboot` and `host_shutdown` affect the physical/virtual machine Home Assistant runs on, not just the Home Assistant process — treat them accordingly.

## Author
Geoff Myers
