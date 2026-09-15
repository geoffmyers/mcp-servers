import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getUniFiClient } from "../lib/unifi-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerSystemTools(server: McpServer): void {
  server.tool(
    "get_system_info",
    "Get UniFi controller system information including version and uptime",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.stat("/sysinfo");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_backup",
    "Generate a UniFi controller backup",
    {
      confirm: z.boolean().describe("Must be true to confirm"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return { content: [{ type: "text", text: "Operation cancelled: confirm must be true" }] };
        }
        const client = getUniFiClient();
        const result = await client.cmd("system", { cmd: "backup" });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
