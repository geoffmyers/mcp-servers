# UniFi CLI MCP Server

This server provides tools for querying UniFi Network controller data via MongoDB queries executed inside the UniFi controller's Docker container.

## How It Works

The UniFi Network controller stores all its data in a MongoDB database. This server runs `docker exec unifi /usr/lib/unifi/data/mongosh --quiet --norc --port 27117 ace --eval '<query>'` to query that database directly, either locally or via SSH to the host running the UniFi container.

## Available Operations

### System
- Get UniFi controller container status (via `docker inspect`)
- Get controller version and identity from MongoDB settings

### Clients
- List all known clients (active and historical)
- Get detailed info for a specific client by MAC address
- Get client connection history and statistics

### Devices
- List all adopted UniFi devices (APs, switches, gateways)
- Get detailed info for a specific device by MAC address
- Get device uptime and last-seen timestamps

### Networks
- List all configured networks (VLANs, corporate, guest)
- Get detailed network configuration by name

### WLANs
- List all configured wireless networks (SSIDs)

### Events
- List recent network events (sorted newest first)
- List recent alarms (sorted newest first)

### Diagnostics
- View UniFi controller container logs
- Ping a device from the host

## Safety

All operations are read-only MongoDB queries. No write operations are exposed. The only non-query tools are viewing container logs and pinging devices.

## Execution

Commands run either locally or via SSH depending on the `EXECUTION_MODE` environment variable. When set to `ssh`, commands are executed on the remote host specified by `SSH_HOST`.
