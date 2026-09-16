import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getUniFiClient } from "../lib/unifi-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerFirewallTools(server: McpServer): void {
  server.tool(
    "list_firewall_rules",
    "List all firewall rules",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.rest("GET", "/firewallrule");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_firewall_rule",
    "Create a new firewall rule",
    {
      name: z.string().describe("Rule name"),
      rule_index: z.number().describe("Rule index/priority"),
      action: z.enum(["accept", "drop", "reject"]).describe("Rule action"),
      protocol: z.string().optional().describe("Protocol (e.g. tcp, udp, all)"),
      src_firewallgroup_ids: z.array(z.string()).optional().describe("Source firewall group IDs"),
      dst_firewallgroup_ids: z.array(z.string()).optional().describe("Destination firewall group IDs"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const body: Record<string, unknown> = {
          name: args.name,
          rule_index: args.rule_index,
          action: args.action,
        };
        if (args.protocol !== undefined) body.protocol = args.protocol;
        if (args.src_firewallgroup_ids !== undefined) body.src_firewallgroup_ids = args.src_firewallgroup_ids;
        if (args.dst_firewallgroup_ids !== undefined) body.dst_firewallgroup_ids = args.dst_firewallgroup_ids;
        const result = await client.rest("POST", "/firewallrule", body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "delete_firewall_rule",
    "Delete a firewall rule",
    {
      id: z.string().describe("Firewall rule ID to delete"),
      confirm: z.boolean().describe("Must be true to confirm"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return { content: [{ type: "text", text: "Operation cancelled: confirm must be true" }] };
        }
        const client = getUniFiClient();
        const result = await client.rest("DELETE", "/firewallrule/" + args.id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
