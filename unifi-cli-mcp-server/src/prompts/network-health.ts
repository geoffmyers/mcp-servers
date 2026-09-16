import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerNetworkHealthPrompt(server: McpServer): void {
  server.prompt(
    "network-health",
    "Comprehensive UniFi network health check",
    {},
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Perform a comprehensive UniFi network health check. Follow these steps:

1. Use system_info to check the UniFi controller container is running and healthy
2. Use controller_status to verify the controller version and identity
3. Use list_devices to get all adopted devices - check for any that are offline or have high uptime (may need restart)
4. Use list_networks to review network configuration
5. Use list_wlans to check wireless network status
6. Use list_events with limit=20 to check for recent concerning events
7. Use list_alarms with limit=20 to check for active alarms
8. Summarize findings:
   - Controller status (version, uptime)
   - Device health (how many online/offline, any issues)
   - Network configuration overview
   - Recent events or alarms that need attention
   - Recommendations for any issues found`,
          },
        },
      ],
    })
  );
}
