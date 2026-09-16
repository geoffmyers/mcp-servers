# Home Assistant CLI MCP Server

This server provides tools for managing Home Assistant via the `ha` CLI (Home Assistant Command Line).

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
