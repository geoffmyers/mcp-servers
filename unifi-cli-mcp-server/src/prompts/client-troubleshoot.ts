import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerClientTroubleshootPrompt(server: McpServer): void {
  server.prompt(
    "client-troubleshoot",
    "Troubleshoot connectivity issues for a specific client",
    {
      mac: z.string().describe("Client MAC address to troubleshoot (e.g. aa:bb:cc:dd:ee:ff)"),
    },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Troubleshoot connectivity issues for UniFi client with MAC address "${args.mac}". Follow these steps:

1. Use client_info to get the client's current status, IP, connected AP, signal strength, and network
2. Use client_history to check recent connection history and statistics
3. If the client is connected to a device, use device_info with that device's MAC to check the AP/switch health
4. Use list_events with limit=20 and look for events related to this client (connection/disconnection events)
5. Use ping_device with the client's IP address (if available) to verify reachability
6. Analyze and summarize:
   - Is the client currently connected? To which AP/switch?
   - Signal strength and connection quality
   - Recent connection/disconnection patterns
   - Any errors or anomalies in the history
   - Recommendations for improving connectivity (e.g., move closer to AP, check for interference, channel optimization)`,
          },
        },
      ],
    })
  );
}
