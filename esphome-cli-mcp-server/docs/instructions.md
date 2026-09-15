---
title: ESPHome CLI MCP Server
created: 2026-02-26
modified: 2026-02-26
description: This server provides tools for managing ESPHome devices via the ESPHome CLI.
tags: [mcp-servers]
---

# ESPHome CLI MCP Server

This server provides tools for managing ESPHome devices via the ESPHome CLI.

## Available Operations

### Devices
- List all ESPHome device configuration files
- View parsed device configuration
- Stream device logs

### Build
- Compile device firmware
- Upload (run) firmware to a device
- Clean build files for a device

### Utility
- Validate a device configuration file
- Check ESPHome version

## Resources

- `esphome://devices` - List of ESPHome device YAML files in the config directory

## Safety

Destructive operations (upload, clean) require explicit `confirm: true` parameter.

## Execution

Commands run either locally or via SSH depending on configuration. The ESPHome config directory defaults to `/config/esphome` and can be overridden with the `ESPHOME_CONFIG_DIR` environment variable.
