import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPfSenseClient } from "../lib/pfsense-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerInterfaceTools(server: McpServer): void {
  server.tool(
    "list_interfaces",
    "List all pfSense interface configurations",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/interfaces");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_interface",
    "Get details for a specific pfSense interface",
    {
      name: z.string().describe("Interface name (e.g. wan, lan, opt1)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/interface", { id: args.name });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
