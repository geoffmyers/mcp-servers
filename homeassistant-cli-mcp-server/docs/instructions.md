# Home Assistant CLI MCP Server

This server provides tools for managing Home Assistant via the `ha` CLI (Home Assistant Command Line).

**It only works against Home Assistant OS or a Supervised install.** The `ha` CLI talks to the
Supervisor; a Home Assistant Core container has no Supervisor, no add-ons and no `ha` binary, so
every tool here fails against one. For a Core container, use Home Assistant's REST / WebSocket API
or its built-in MCP Server integration instead.

## Available Operations

### Core
- Get core info and stats
- Restart Home Assistant core
- Update Home Assistant core
- Check configuration validity

### Supervisor
- Get supervisor info and logs
- Update supervisor

### Add-ons
- List, inspect, start, stop, restart, update add-ons
- View add-on logs

### OS
- Get OS info
- Update Home Assistant OS

### Host
- Get host info
- Reboot or shutdown the host

### Resolution
- Get resolution center info (issues and suggestions)

## Safety

Destructive operations (restart, stop, update, reboot, shutdown) require explicit `confirm: true` parameter.

## Execution

Commands run either locally or via SSH depending on configuration. All commands that return structured data use the `--raw-json` flag for machine-readable JSON output.
