import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPfSenseClient } from "../lib/pfsense-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerFirewallRuleTools(server: McpServer): void {
  server.tool(
    "list_firewall_rules",
    "List all pfSense firewall rules, optionally filtered by interface",
    {
      interface: z.string().optional().describe("Filter rules by interface name (e.g. wan, lan)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const query: Record<string, string> = {};
        if (args.interface) query.interface = args.interface;
        const result = await client.get("/firewall/rules", Object.keys(query).length ? query : undefined);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_firewall_rule",
    "Create a new pfSense firewall rule",
    {
      interface: z.string().describe("Interface name (e.g. wan, lan)"),
      type: z.enum(["pass", "block", "reject"]).describe("Rule action type"),
      ipprotocol: z.enum(["inet", "inet6", "inet46"]).describe("IP protocol version"),
      protocol: z.string().optional().describe("Protocol (e.g. tcp, udp, tcp/udp, icmp)"),
      source: z.string().describe("Source address or alias"),
      destination: z.string().describe("Destination address or alias"),
      descr: z.string().optional().describe("Rule description"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.post("/firewall/rule", args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "update_firewall_rule",
    "Update an existing pfSense firewall rule",
    {
      id: z.number().describe("Rule ID to update"),
      interface: z.string().optional().describe("Interface name"),
      type: z.enum(["pass", "block", "reject"]).optional().describe("Rule action type"),
      ipprotocol: z.enum(["inet", "inet6", "inet46"]).optional().describe("IP protocol version"),
      protocol: z.string().optional().describe("Protocol"),
      source: z.string().optional().describe("Source address or alias"),
      destination: z.string().optional().describe("Destination address or alias"),
      descr: z.string().optional().describe("Rule description"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const { id, ...body } = args;
        const result = await client.patch(`/firewall/rule?id=${id}`, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "toggle_firewall_rule",
    "Enable or disable a pfSense firewall rule",
    {
      id: z.number().describe("Rule ID to toggle"),
      disabled: z.boolean().describe("Set to true to disable the rule, false to enable"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.patch(`/firewall/rule?id=${args.id}`, { disabled: args.disabled });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "delete_firewall_rule",
    "Delete a pfSense firewall rule",
    {
      id: z.number().describe("Rule ID to delete"),
      confirm: z.boolean().describe("Must be true to confirm deletion"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return { content: [{ type: "text", text: "Operation requires confirm: true" }] };
        }
        const client = getPfSenseClient();
        const result = await client.delete("/firewall/rule", { id: String(args.id) });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "reorder_firewall_rules",
    "Reorder pfSense firewall rules by specifying rule IDs in desired order",
    {
      rules: z.array(z.number()).describe("Array of rule IDs in the desired order"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.put("/firewall/rule/sort", { rules: args.rules });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
