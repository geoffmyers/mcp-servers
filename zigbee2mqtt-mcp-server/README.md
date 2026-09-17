# Zigbee2MQTT MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for [Zigbee2MQTT](https://www.zigbee2mqtt.io/). Device, group and bridge operations use Zigbee2MQTT's MQTT API (`zigbee2mqtt/bridge/request/*`); container operations use the Docker CLI, locally or over SSH.

## Requirements
- Node.js 20.6+
- A Zigbee2MQTT instance publishing under the default `zigbee2mqtt/` base topic, and access to its MQTT broker
- For the container tools: Zigbee2MQTT running in Docker in a container named **`zigbee2mqtt`**, and permission to run `docker` there (over SSH if the server runs elsewhere)

## Installation
From the repository root (the servers are one npm workspace):

```bash
npm ci
npm run build
```

## Configuration

### MCP client
```json
{
  "mcpServers": {
    "zigbee2mqtt": {
      "command": "node",
      "args": ["/path/to/mcp-servers/zigbee2mqtt-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

Run `node dist/index.js streamableHttp` instead to serve streamable HTTP on port 3025.

### Environment variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXECUTION_MODE` | No | `local` | `local` runs commands on this machine; `ssh` runs them on `SSH_HOST` |
| `SSH_HOST` | When `EXECUTION_MODE=ssh` | — | Host (or SSH config alias) to run commands on, with key-based login |
| `MQTT_HOST` | No | `localhost` | MQTT broker host |
| `MQTT_PORT` | No | `1883` | MQTT broker port |
| `MQTT_USER` | No | empty | MQTT username |
| `MQTT_PASSWORD` | No | empty | MQTT password |
| `PORT` | No | `3025` | Port for the streamable HTTP transport |

`.env.example` lists them; `node --env-file=.env dist/index.js stdio` loads a filled-in copy.

## Tools

25 tools; 4 of them change something and require `confirm: true` (`remove_device`, `force_remove_device`, `container_restart`, `remove_group`).

| Tool | Description |
|------|-------------|
| `list_devices` | List all Zigbee devices with their type, model, manufacturer, and availability |
| `device_info` | Get detailed information about a specific Zigbee device by friendly name or IEEE address |
| `offline_devices` | List all Zigbee devices that are currently offline or unavailable |
| `set_device_state` | Set the state of a Zigbee device (e.g. turn on/off, set brightness, color temperature) |
| `get_device_state` | Get the current state of a Zigbee device |
| `interview_device` | Re-interview a Zigbee device to refresh its configuration and capabilities |
| `rename_device` | Rename a Zigbee device |
| `remove_device` | Remove a Zigbee device from the network (requires confirm: true) |
| `force_remove_device` | Force remove an unresponsive Zigbee device from the network (requires confirm: true) |
| `configure_device` | Re-send Zigbee configuration to a device |
| `permit_join` | Allow new Zigbee devices to join the network for a specified duration |
| `network_map` | Generate a Zigbee network topology map showing device relationships |
| `bridge_info` | Get Zigbee2MQTT bridge information including version, coordinator details, and configuration |
| `bridge_state` | Get the current Zigbee2MQTT bridge connection state (online/offline) |
| `container_status` | Get the status of the Zigbee2MQTT Docker container |
| `container_logs` | View recent logs from the Zigbee2MQTT Docker container |
| `container_restart` | Restart the Zigbee2MQTT Docker container (requires confirm: true) |
| `list_groups` | List all Zigbee groups |
| `create_group` | Create a new Zigbee group |
| `remove_group` | Remove a Zigbee group (requires confirm: true) |
| `add_to_group` | Add a device to a Zigbee group |
| `remove_from_group` | Remove a device from a Zigbee group |
| `bind_devices` | Create a direct binding between two Zigbee devices |
| `unbind_devices` | Remove a binding between two Zigbee devices |
| `ota_check_update` | Check if an OTA firmware update is available for a Zigbee device |

## Resources
| URI | Description |
|-----|-------------|
| `zigbee2mqtt://devices` | List of all Zigbee devices with status and properties |
| `zigbee2mqtt://bridge/info` | Zigbee2MQTT bridge information including version and coordinator details |

## Prompts
| Prompt | Description |
|--------|-------------|
| `diagnose-device` | Diagnose issues with a specific Zigbee device |
| `network-health` | Comprehensive Zigbee network health check |

## Safety
- Removing a device or group and restarting the container require an explicit `confirm: true` argument.
- `permit_join` opens the network to new devices for the duration you give it; close it when done.
- The base topic `zigbee2mqtt` and the container name `zigbee2mqtt` are the Zigbee2MQTT defaults and are fixed in the source.

## Author
Geoff Myers
