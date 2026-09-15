import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDiagnoseNodePrompt(server: McpServer): void {
  server.prompt(
    "diagnose-node",
    "Troubleshoot a Z-Wave node that may be unresponsive or misbehaving",
    { node_id: z.string().describe("Z-Wave node ID to diagnose") },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Diagnose Z-Wave node ${args.node_id}. Follow these steps:

1. Use node_info to get the node's current status, type, and capabilities
2. Use driver_status to check the overall Z-Wave driver health
3. If the node appears dead or offline:
   a. Check if the device is battery-powered (may be asleep)
   b. Try refresh_node_values to wake it up
   c. Consider interview_node to re-query its capabilities
   d. Try heal_node to repair its network routes
4. Use container_logs with tail=50 to check for Z-Wave errors related to this node
5. Summarize findings:
   - Is the node responding?
   - What type of device is it?
   - Are there communication errors?
   - Recommended next steps`,
          },
        },
      ],
    })
  );
}
