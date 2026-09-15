import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getUniFiClient } from "../lib/unifi-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerGuestTools(server: McpServer): void {
  server.tool(
    "create_voucher",
    "Create guest access vouchers",
    {
      count: z.number().describe("Number of vouchers to create"),
      minutes: z.number().describe("Voucher validity in minutes"),
      quota: z.number().optional().default(1).describe("Number of uses per voucher (default 1)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.cmd("hotspot", {
          cmd: "create-voucher",
          n: args.count,
          expire: args.minutes,
          quota: args.quota,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "list_vouchers",
    "List all guest access vouchers",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.stat("/voucher");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
