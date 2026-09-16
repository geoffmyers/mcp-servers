import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerNetworkHealthPrompt(server: McpServer): void {
  server.registerPrompt(
    "network-health",
    {
      title: "Network Health Check",
      description:
        "Comprehensive health check of the UniFi network environment",
      argsSchema: {},
    },
    () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please perform a comprehensive network health check using the available UniFi tools:

1. List all network devices and verify they are online and running expected firmware
2. Check for any offline or disconnected devices that should be online
3. Review client counts across the network and per device
4. Check for any active alarms or recent critical events
5. Analyze network utilization across switches and access points

Provide a summary report highlighting any issues that need attention, devices that may need firmware updates, and the overall health status of the network.`,
          },
        },
      ],
    })
  );
}
