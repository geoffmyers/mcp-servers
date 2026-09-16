import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getUniFiClient } from "../lib/unifi-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerClientTools(server: McpServer): void {
  server.tool(
    "list_active_clients",
    "List all currently connected clients",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.stat("/sta");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_client",
    "Get details for a single client by MAC address",
    {
      mac: z.string().describe("Client MAC address"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.stat("/sta/" + args.mac);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "block_client",
    "Block a client device by MAC address",
    {
      mac: z.string().describe("Client MAC address to block"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.cmd("stamgr", { cmd: "block-sta", mac: args.mac });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "unblock_client",
    "Unblock a client device by MAC address",
    {
      mac: z.string().describe("Client MAC address to unblock"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.cmd("stamgr", { cmd: "unblock-sta", mac: args.mac });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "reconnect_client",
    "Force a client to reconnect by MAC address",
    {
      mac: z.string().describe("Client MAC address to reconnect"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.cmd("stamgr", { cmd: "kick-sta", mac: args.mac });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "forget_client",
    "Remove a client from the UniFi controller",
    {
      mac: z.string().describe("Client MAC address to forget"),
      confirm: z.boolean().describe("Must be true to confirm"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return { content: [{ type: "text", text: "Operation cancelled: confirm must be true" }] };
        }
        const client = getUniFiClient();
        const result = await client.cmd("stamgr", { cmd: "forget-sta", macs: [args.mac] });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "authorize_guest",
    "Authorize a guest client for network access",
    {
      mac: z.string().describe("Guest MAC address"),
      minutes: z.number().describe("Number of minutes to authorize"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.cmd("stamgr", { cmd: "authorize-guest", mac: args.mac, minutes: args.minutes });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
