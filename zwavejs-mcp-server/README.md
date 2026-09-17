# Z-Wave JS MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for [Z-Wave JS UI](https://github.com/zwave-js/zwave-js-ui). Node and network operations use Z-Wave JS UI's MQTT gateway API; container operations use the Docker CLI, locally or over SSH.

## Requirements
- Node.js 20.6+
- Z-Wave JS UI with its MQTT gateway enabled, using the default prefix `zwave` and gateway name `zwave-js-ui` (API topics `zwave/_CLIENTS/ZWAVE_GATEWAY-zwave-js-ui/api/<method>/set`), and access to that broker
- For the container tools: Z-Wave JS UI running in Docker, and permission to run `docker` there (over SSH if the server runs elsewhere)

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
    "zwavejs": {
      "command": "node",
      "args": ["/path/to/mcp-servers/zwavejs-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

Run `node dist/index.js streamableHttp` instead to serve streamable HTTP on port 3026.

### Environment variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXECUTION_MODE` | No | `local` | `local` runs commands on this machine; `ssh` runs them on `SSH_HOST` |
| `SSH_HOST` | When `EXECUTION_MODE=ssh` | — | Host (or SSH config alias) to run commands on, with key-based login |
| `MQTT_HOST` | No | `localhost` | MQTT broker host |
| `MQTT_PORT` | No | `1883` | MQTT broker port |
| `MQTT_USER` | No | empty | MQTT username |
| `MQTT_PASSWORD` | No | empty | MQTT password |
| `PORT` | No | `3026` | Port for the streamable HTTP transport |

`.env.example` lists them; `node --env-file=.env dist/index.js stdio` loads a filled-in copy.

## Tools

22 tools; 5 of them change something and require `confirm: true` (`heal_network`, `remove_failed_node`, `container_restart`, `begin_inclusion`, `begin_exclusion`).

| Tool | Description |
|------|-------------|
| `list_nodes` | List all Z-Wave nodes on the network with their status and basic info |
| `node_info` | Get detailed information about a specific Z-Wave node |
| `offline_nodes` | Find Z-Wave nodes that are dead or offline |
| `get_node_statistics` | Get communication statistics for a Z-Wave node (TX/RX counts, RTT, route changes) |
| `set_node_value` | Set a value on a Z-Wave node (e.g., turn on a switch, set dimmer level) |
| `get_node_value` | Get the current value of a Z-Wave node property |
| `interview_node` | Re-interview a Z-Wave node to refresh its capabilities and command classes |
| `heal_node` | Heal network routes for a specific Z-Wave node |
| `heal_network` | Heal the entire Z-Wave network (requires confirm: true). This can take a long time. |
| `refresh_node_values` | Refresh all values for a Z-Wave node by re-querying the device |
| `remove_failed_node` | Remove a failed/dead node from the Z-Wave network (requires confirm: true) |
| `container_status` | Get the status of the zwave-js-ui Docker container |
| `container_logs` | View recent logs from the zwave-js-ui Docker container |
| `container_restart` | Restart the zwave-js-ui Docker container (requires confirm: true) |
| `driver_status` | Get Z-Wave driver status and information (library version, home ID, etc.) |
| `controller_info` | Get Z-Wave controller information (type, firmware, features) |
| `begin_inclusion` | Start including (adding) a new Z-Wave device to the network (requires confirm: true). Strategy 0 = no security, 2 = S2 security. |
| `stop_inclusion` | Stop the Z-Wave inclusion process |
| `begin_exclusion` | Start excluding (removing) a Z-Wave device from the network (requires confirm: true) |
| `stop_exclusion` | Stop the Z-Wave exclusion process |
| `get_node_config_params` | Get all values for a Z-Wave node, including configuration parameters (command class 112) |
| `set_node_config_param` | Set a configuration parameter on a Z-Wave node using the Configuration command class (CC 112) |

## Resources
| URI | Description |
|-----|-------------|
| `zwavejs://nodes` | List of all Z-Wave nodes on the network |
| `zwavejs://controller` | Z-Wave controller information |

## Prompts
| Prompt | Description |
|--------|-------------|
| `diagnose-node` | Troubleshoot a Z-Wave node that may be unresponsive or misbehaving |
| `network-health` | Comprehensive Z-Wave network health check |

## Safety
- Network-wide healing, removing a failed node, inclusion, exclusion and container restart require an explicit `confirm: true` argument.
- Inclusion and exclusion stay open until you call `stop_inclusion` / `stop_exclusion` or the controller times out.
- The MQTT API base topic is fixed in the source (`ZWAVE_API_BASE`); change it there if your gateway uses another prefix or name.

## Author
Geoff Myers
