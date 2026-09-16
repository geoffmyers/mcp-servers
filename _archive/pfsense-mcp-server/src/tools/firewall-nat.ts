import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPfSenseClient } from "../lib/pfsense-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerFirewallNatTools(server: McpServer): void {
  server.tool(
    "list_port_forwards",
    "List all pfSense NAT port forward rules",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/firewall/nat/port_forwards");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_port_forward",
    "Create a new pfSense NAT port forward rule",
    {
      interface: z.string().describe("Interface name (e.g. wan)"),
      protocol: z.string().describe("Protocol (e.g. tcp, udp, tcp/udp)"),
      src: z.string().optional().describe("Source address"),
      srcport: z.string().optional().describe("Source port or range"),
      dst: z.string().describe("Destination address (usually the WAN address or alias)"),
      dstport: z.string().describe("Destination port or range"),
      target: z.string().describe("Target internal IP address"),
      local_port: z.string().describe("Target internal port"),
      descr: z.string().optional().describe("Port forward description"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.post("/firewall/nat/port_forward", args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "delete_port_forward",
    "Delete a pfSense NAT port forward rule",
    {
      id: z.number().describe("Port forward rule ID to delete"),
      confirm: z.boolean().describe("Must be true to confirm deletion"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return { content: [{ type: "text", text: "Operation requires confirm: true" }] };
        }
        const client = getPfSenseClient();
        const result = await client.delete("/firewall/nat/port_forward", { id: String(args.id) });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
