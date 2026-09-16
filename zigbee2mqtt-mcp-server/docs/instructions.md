# Zigbee2MQTT MCP Server

This server provides tools for managing Zigbee2MQTT via MQTT messaging and Docker container management.

## Architecture

This server communicates with Zigbee2MQTT through two channels:

1. **MQTT** - For Zigbee device management, bridge control, and network operations. Uses `mosquitto_pub` and `mosquitto_sub` CLI commands to communicate with the MQTT broker.
2. **Docker CLI** - For managing the Zigbee2MQTT container itself (logs, status, restart). Uses SSH execution mode to run Docker commands on the remote host.

## Available Operations

### Devices
- List all Zigbee devices with status and properties
- Get detailed device information
- Find offline/unavailable devices

### Control
- Set device state (turn on/off, change brightness, color, etc.)
- Get current device state

### Management
- Interview a device to refresh its configuration
- Rename a device
- Remove a device from the network (requires confirmation)

### Network
- Permit new devices to join the Zigbee network
- Generate a network map showing device topology

### Bridge
- Get Zigbee2MQTT bridge information (version, coordinator, settings)
- Get bridge connection state

### Container
- Check Zigbee2MQTT Docker container status
- View container logs
- Restart the container (requires confirmation)

## MQTT Topics

All operations use the `zigbee2mqtt/` topic prefix. Key topics:

| Topic | Purpose |
|-------|---------|
| `zigbee2mqtt/bridge/devices` | Retained list of all devices |
| `zigbee2mqtt/bridge/info` | Retained bridge configuration |
| `zigbee2mqtt/bridge/state` | Bridge online/offline state |
| `zigbee2mqtt/bridge/request/*` | Request topics for commands |
| `zigbee2mqtt/<device>/set` | Set device state |
| `zigbee2mqtt/<device>` | Device state updates |

## Safety

- Device removal requires explicit `confirm: true` parameter
- Container restart requires explicit `confirm: true` parameter
- MQTT operations have configurable timeouts (default 10 seconds)
- Network join permission is time-limited (default 120 seconds)

## Configuration

The server requires MQTT broker credentials and SSH access to the Docker host:

- `MQTT_HOST` - MQTT broker hostname
- `MQTT_PORT` - MQTT broker port (default 1883)
- `MQTT_USER` - MQTT username
- `MQTT_PASSWORD` - MQTT password
- `EXECUTION_MODE` - "local" or "ssh" for Docker commands
- `SSH_HOST` - SSH host for remote Docker execution
