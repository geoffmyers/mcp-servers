import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerNetworkHealthPrompt(server: McpServer): void {
  server.prompt(
    "network-health",
    "Comprehensive Zigbee network health check",
    {},
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Perform a comprehensive health check of the Zigbee network. Follow these steps:

1. Use bridge_state to verify the Zigbee2MQTT bridge is online
2. Use bridge_info to check the coordinator type, firmware version, and Zigbee2MQTT version
3. Use list_devices to get a full inventory of all devices
4. Use offline_devices to identify any devices that are unreachable
5. Use network_map to visualize the network topology
6. Use container_status to verify the Zigbee2MQTT container is healthy
7. Use container_logs with tail=50 to check for recent errors or warnings

Provide a summary report including:
- Bridge status and version information
- Total device count (routers vs end devices vs coordinator)
- Number of online vs offline devices
- Any devices with poor link quality
- Network topology observations (are there enough routers for good mesh coverage?)
- Any errors or warnings from recent logs
- Recommendations for improving network reliability`,
          },
        },
      ],
    })
  );
}
