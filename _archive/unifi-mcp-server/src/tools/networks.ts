import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getUniFiClient } from "../lib/unifi-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerNetworkTools(server: McpServer): void {
  server.tool(
    "list_networks",
    "List all networks and VLANs",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.rest("GET", "/networkconf");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_network",
    "Get details for a single network",
    {
      id: z.string().describe("Network ID"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.rest("GET", "/networkconf/" + args.id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_network",
    "Create a new network",
    {
      name: z.string().describe("Network name"),
      purpose: z.enum(["corporate", "guest", "wan", "vlan-only"]).describe("Network purpose"),
      vlan: z.number().optional().describe("VLAN ID"),
      subnet: z.string().optional().describe("Network subnet (e.g. 192.168.1.0/24)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const body: Record<string, unknown> = { name: args.name, purpose: args.purpose };
        if (args.vlan !== undefined) body.vlan = args.vlan;
        if (args.subnet !== undefined) body.ip_subnet = args.subnet;
        const result = await client.rest("POST", "/networkconf", body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "update_network",
    "Update an existing network",
    {
      id: z.string().describe("Network ID"),
      name: z.string().optional().describe("Network name"),
      purpose: z.enum(["corporate", "guest", "wan", "vlan-only"]).optional().describe("Network purpose"),
      vlan: z.number().optional().describe("VLAN ID"),
      subnet: z.string().optional().describe("Network subnet"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const body: Record<string, unknown> = {};
        if (args.name !== undefined) body.name = args.name;
        if (args.purpose !== undefined) body.purpose = args.purpose;
        if (args.vlan !== undefined) body.vlan = args.vlan;
        if (args.subnet !== undefined) body.ip_subnet = args.subnet;
        const result = await client.rest("PUT", "/networkconf/" + args.id, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "delete_network",
    "Delete a network",
    {
      id: z.string().describe("Network ID to delete"),
      confirm: z.boolean().describe("Must be true to confirm"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return { content: [{ type: "text", text: "Operation cancelled: confirm must be true" }] };
        }
        const client = getUniFiClient();
        const result = await client.rest("DELETE", "/networkconf/" + args.id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
