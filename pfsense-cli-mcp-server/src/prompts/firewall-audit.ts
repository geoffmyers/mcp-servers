import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerFirewallAuditPrompt(server: McpServer): void {
  server.prompt(
    "firewall-audit",
    "Audit firewall rules on a pfSense interface",
    { interface_name: z.string().describe("Interface name to audit (e.g. WAN, LAN, OPT1)") },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Audit the firewall rules on the pfSense "${args.interface_name}" interface. Follow these steps:

1. Use list_firewall_rules to retrieve all active pfctl rules
2. Filter and examine rules relevant to the "${args.interface_name}" interface
3. Use firewall_state_count to check overall state table statistics
4. Check for common issues:
   - Overly permissive rules (any-to-any)
   - Rules that should be more specific
   - Redundant or shadowed rules
   - Missing anti-spoofing rules
   - Proper ordering (most specific first)
5. Summarize findings and suggest improvements for security hardening`,
          },
        },
      ],
    })
  );
}
