import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerFirewallAuditPrompt(server: McpServer): void {
  server.registerPrompt(
    "firewall-audit",
    {
      title: "Firewall Rule Audit",
      description:
        "Audit firewall rules on a specific interface for security issues",
      argsSchema: {
        interface: z
          .string()
          .describe(
            'Interface name to audit firewall rules on (e.g., "wan", "lan")'
          ),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please perform a security audit of the firewall rules on the "${args.interface}" interface. Use the available pfSense tools to retrieve the rules and then analyze them for:

1. Overly permissive rules (e.g., allow any-any, wide open port ranges)
2. Shadowed rules that are unreachable because a broader rule above already matches
3. Rules missing proper descriptions or documentation
4. Best practice violations (e.g., no explicit deny at the end, insecure protocols allowed from untrusted zones)
5. Unused or redundant rules that could be consolidated

Provide a detailed report with specific recommendations for improving the security posture of this interface.`,
          },
        },
      ],
    })
  );
}
