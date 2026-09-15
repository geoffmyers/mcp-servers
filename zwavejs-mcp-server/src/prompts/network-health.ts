import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerNetworkHealthPrompt(server: McpServer): void {
  server.prompt(
    "network-health",
    "Comprehensive Z-Wave network health check",
    {},
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Perform a comprehensive Z-Wave network health check. Follow these steps:

1. Use controller_info to check the Z-Wave controller status and firmware
2. Use driver_status to verify the Z-Wave driver is running correctly
3. Use list_nodes to get all nodes on the network
4. Use offline_nodes to identify any dead or unresponsive nodes
5. Use container_status to verify the zwave-js-ui container is healthy
6. Use container_logs with tail=100 to check for recent errors or warnings

Summarize findings in this format:
- **Controller:** Status, firmware version, type
- **Driver:** Running status, library version
- **Nodes:** Total count, online count, offline/dead count
- **Offline Nodes:** List each with node ID, name, and device type
- **Container:** Running status, uptime, any restart issues
- **Recent Errors:** Any notable errors from logs
- **Recommendations:** Steps to improve network health (e.g., heal network, re-interview nodes, check physical devices)`,
          },
        },
      ],
    })
  );
}
