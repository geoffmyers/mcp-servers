import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getUniFiClient } from "../lib/unifi-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerWlanTools(server: McpServer): void {
  server.tool(
    "list_wlans",
    "List all wireless networks",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.rest("GET", "/wlanconf");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_wlan",
    "Create a new wireless network",
    {
      name: z.string().describe("WLAN name (SSID)"),
      x_passphrase: z.string().describe("WiFi password"),
      wlangroup_id: z.string().optional().describe("WLAN group ID"),
      networkconf_id: z.string().optional().describe("Network configuration ID"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const body: Record<string, unknown> = { name: args.name, x_passphrase: args.x_passphrase };
        if (args.wlangroup_id !== undefined) body.wlangroup_id = args.wlangroup_id;
        if (args.networkconf_id !== undefined) body.networkconf_id = args.networkconf_id;
        const result = await client.rest("POST", "/wlanconf", body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "update_wlan",
    "Update an existing wireless network",
    {
      id: z.string().describe("WLAN ID"),
      name: z.string().optional().describe("WLAN name (SSID)"),
      x_passphrase: z.string().optional().describe("WiFi password"),
      wlangroup_id: z.string().optional().describe("WLAN group ID"),
      networkconf_id: z.string().optional().describe("Network configuration ID"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const body: Record<string, unknown> = {};
        if (args.name !== undefined) body.name = args.name;
        if (args.x_passphrase !== undefined) body.x_passphrase = args.x_passphrase;
        if (args.wlangroup_id !== undefined) body.wlangroup_id = args.wlangroup_id;
        if (args.networkconf_id !== undefined) body.networkconf_id = args.networkconf_id;
        const result = await client.rest("PUT", "/wlanconf/" + args.id, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "delete_wlan",
    "Delete a wireless network",
    {
      id: z.string().describe("WLAN ID to delete"),
      confirm: z.boolean().describe("Must be true to confirm"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return { content: [{ type: "text", text: "Operation cancelled: confirm must be true" }] };
        }
        const client = getUniFiClient();
        const result = await client.rest("DELETE", "/wlanconf/" + args.id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
