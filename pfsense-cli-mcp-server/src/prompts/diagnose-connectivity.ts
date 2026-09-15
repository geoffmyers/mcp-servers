import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDiagnoseConnectivityPrompt(server: McpServer): void {
  server.prompt(
    "diagnose-connectivity",
    "Diagnose network connectivity issues from pfSense to a target host",
    { target_host: z.string().describe("Target hostname or IP address to diagnose connectivity to") },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Diagnose network connectivity from pfSense to "${args.target_host}". Follow these steps:

1. Use ping with count=4 to test basic connectivity to "${args.target_host}"
2. If ping fails, use traceroute to identify where packets are being dropped
3. Use gateway_status to verify all gateways are online
4. Use routing_table to check if the route to the target exists
5. Use arp_table to check if the target (if local) has an ARP entry
6. Use list_firewall_rules to check if any rules might be blocking traffic
7. Summarize findings: Is connectivity working? Where is the failure? What remediation steps are recommended?`,
          },
        },
      ],
    })
  );
}
