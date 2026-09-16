import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerWifiOptimizationPrompt(server: McpServer): void {
  server.registerPrompt(
    "wifi-optimization",
    {
      title: "WiFi Optimization",
      description:
        "Analyze WiFi setup and suggest optimizations for better performance",
      argsSchema: {},
    },
    () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please analyze the WiFi setup for optimization opportunities. Use the available UniFi tools to:

1. List all access points with their models, firmware versions, and current status
2. Check channel utilization on both 2.4GHz and 5GHz bands for each AP
3. Review client distribution across access points to identify imbalanced loads
4. Check for channel overlap or interference between neighboring APs
5. Review current radio settings (channel width, transmit power, minimum RSSI)

Based on the analysis, suggest specific improvements such as:
- Channel reassignments to reduce interference
- Transmit power adjustments for better roaming
- Client band steering or load balancing settings
- Any APs that may need repositioning based on client distribution
- Firmware updates if applicable`,
          },
        },
      ],
    })
  );
}
