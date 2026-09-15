---
title: Z-Wave JS MCP Server
created: 2026-02-26
modified: 2026-02-26
description: "This server provides tools for managing Z-Wave devices via the Z-Wave JS UI MQTT API, plus Docker container management for the zwave-js-ui container."
tags: [mcp-servers]
---

# Z-Wave JS MCP Server

This server provides tools for managing Z-Wave devices via the Z-Wave JS UI MQTT API, plus Docker container management for the zwave-js-ui container.

## Available Operations

### Nodes
- List all Z-Wave nodes on the network
- Get detailed information about a specific node
- Find offline or dead nodes

### Control
- Set a node value (e.g., turn on a switch, set dimmer level)
- Get the current value of a node property

### Management
- Interview a node (re-query all its capabilities)
- Heal a specific node's network routes
- Heal the entire Z-Wave network
- Refresh all values for a node

### Container
- Check the zwave-js-ui Docker container status
- View container logs
- Restart the container

### Diagnostics
- Get Z-Wave driver status and info
- Get Z-Wave controller information

## MQTT API

This server communicates with Z-Wave JS UI via MQTT. Commands are published to:
`zwave/_CLIENTS/ZWAVE_GATEWAY-zwave-js-ui/api/<method>/set`

Responses are received on:
`zwave/_CLIENTS/ZWAVE_GATEWAY-zwave-js-ui/api/<method>`

## Safety

- Network-wide operations (heal_network) require explicit `confirm: true`
- Container restart requires explicit `confirm: true`
- Node value changes are logged for auditability

## Execution

Docker commands run either locally or via SSH depending on EXECUTION_MODE configuration. MQTT commands use the mosquitto_pub/mosquitto_sub CLI tools.
