import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getUniFiClient } from "../lib/unifi-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerDeviceTools(server: McpServer): void {
  server.tool(
    "list_devices",
    "List all adopted UniFi devices",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.stat("/device");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_device",
    "Get details for a single device by MAC address",
    {
      mac: z.string().describe("Device MAC address"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.stat("/device/" + args.mac);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "restart_device",
    "Reboot a UniFi device",
    {
      mac: z.string().describe("Device MAC address to restart"),
      confirm: z.boolean().describe("Must be true to confirm"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return { content: [{ type: "text", text: "Operation cancelled: confirm must be true" }] };
        }
        const client = getUniFiClient();
        const result = await client.cmd("devmgr", { cmd: "restart", mac: args.mac });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "adopt_device",
    "Adopt a new device into the UniFi controller",
    {
      mac: z.string().describe("Device MAC address to adopt"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.cmd("devmgr", { cmd: "adopt", mac: args.mac });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "locate_device",
    "Toggle the locate LED on a UniFi device",
    {
      mac: z.string().describe("Device MAC address"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.cmd("devmgr", { cmd: "set-locate", mac: args.mac });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "upgrade_device",
    "Upgrade firmware on a UniFi device",
    {
      mac: z.string().describe("Device MAC address to upgrade"),
      confirm: z.boolean().describe("Must be true to confirm"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return { content: [{ type: "text", text: "Operation cancelled: confirm must be true" }] };
        }
        const client = getUniFiClient();
        const result = await client.cmd("devmgr", { cmd: "upgrade", mac: args.mac });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
