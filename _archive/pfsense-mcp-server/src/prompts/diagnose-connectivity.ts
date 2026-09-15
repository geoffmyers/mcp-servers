import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerDiagnoseConnectivityPrompt(server: McpServer): void {
  server.registerPrompt(
    "diagnose-connectivity",
    {
      title: "Diagnose Connectivity",
      description:
        "Diagnose network connectivity issues to a specific target host",
      argsSchema: {
        target: z
          .string()
          .describe("IP address or hostname to diagnose connectivity to"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please diagnose connectivity to "${args.target}". Use the available pfSense tools to:

1. Ping the target to check basic reachability
2. Run a traceroute to identify where packets may be dropping
3. Check gateway status to ensure the default gateway is online
4. Review active firewall states for any connections related to this target
5. Check the ARP table for the target's MAC address resolution

Based on the results, provide a summary of any issues found and recommended actions to resolve connectivity problems.`,
          },
        },
      ],
    })
  );
}
