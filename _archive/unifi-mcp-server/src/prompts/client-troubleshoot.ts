import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerClientTroubleshootPrompt(server: McpServer): void {
  server.registerPrompt(
    "client-troubleshoot",
    {
      title: "Client Troubleshooting",
      description:
        "Troubleshoot connectivity issues for a specific network client",
      argsSchema: {
        mac: z
          .string()
          .describe("MAC address of the client to troubleshoot"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please troubleshoot connectivity for the client with MAC address "${args.mac}". Use the available UniFi tools to:

1. Get the client's details including IP address, hostname, network, and connection type
2. Check the client's current connection status (signal strength, TX/RX rates, uptime)
3. Review recent events related to this client (connections, disconnections, roaming)
4. Check the access point or switch port the client is connected to for any issues
5. Verify the client's VLAN assignment and network configuration

Based on the findings, identify any connectivity problems and provide recommendations to resolve them.`,
          },
        },
      ],
    })
  );
}
