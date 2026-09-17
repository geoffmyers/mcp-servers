# ESPHome CLI MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server
wrapping the [ESPHome](https://esphome.io/) CLI: list and inspect device
configs, compile and upload firmware, tail logs, validate YAML, and discover
devices on the network via mDNS. The `esphome` binary normally lives inside
the ESPHome Docker container, so every call is `docker exec <container>
esphome ...` (or the same over SSH when the container runs on a different
host than this server).

## Requirements
- Node.js 20.6+
- TypeScript
- Docker, with an ESPHome container already running (this server does not
  start ESPHome itself)
- For remote mode: SSH key-based access to the host running that container

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
    "esphome-cli": {
      "command": "node",
      "args": ["/path/to/mcp-servers/esphome-cli-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

### Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXECUTION_MODE` | No | `local` | `local` runs `docker exec` directly on the host that owns the ESPHome container; `ssh` runs it over SSH on `SSH_HOST` |
| `SSH_HOST` | Only if `EXECUTION_MODE=ssh` | — | SSH host that owns the ESPHome container |
| `ESPHOME_CONTAINER` | No | `esphome` | Name of the running ESPHome container. A generic, standalone docker-compose deployment uses this default; a Home Assistant add-on deployment uses a different generated name (e.g. `addon_<hash>_esphome`) |
| `ESPHOME_CONFIG_DIR` | No | `/config` | Path to the ESPHome config directory **as seen inside the container** |
| `PORT` | No | `3022` | HTTP transport port |

See `.env.example` for a filled-in template covering both the standalone and
Home Assistant add-on deployment shapes.

## Tools

10 tools, 3 of which are destructive and require `confirm: true`.

| Tool | Description |
|------|-------------|
| `list_devices` | List all ESPHome device configuration files |
| `device_config` | Get the parsed configuration for an ESPHome device |
| `device_logs` | View logs from an ESPHome device |
| `compile_device` | Compile firmware for an ESPHome device |
| `upload_device` | Upload (run) firmware to an ESPHome device (requires `confirm: true`) |
| `clean_build` | Clean build files for an ESPHome device (requires `confirm: true`) |
| `validate_config` | Validate an ESPHome device configuration file |
| `version` | Get the ESPHome version |
| `rename_device` | Rename an ESPHome device (requires `confirm: true`) |
| `discover_devices` | Discover ESPHome devices on the network via mDNS |

## Resources
| Resource | Description |
|----------|-------------|
| `devices` | List of ESPHome device YAML files in the config directory |

## Prompts
| Prompt | Description |
|--------|-------------|
| `diagnose-device` | Diagnose issues with an ESPHome device |

## Safety
- `upload_device`, `clean_build` and `rename_device` require an explicit `confirm: true` argument.
- All commands run via `execFile` (array arguments, no shell), so tool inputs cannot inject shell metacharacters.
- `list_devices` and the `devices` resource run `ls` **inside** the ESPHome container so relative paths match what `ESPHOME_CONFIG_DIR` means to `esphome` itself — running `ls` on the host would only be correct if the host and container paths happened to be identical, which is not guaranteed.

## Author
Geoff Myers
