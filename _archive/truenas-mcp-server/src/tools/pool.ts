import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTrueNASClient } from "../lib/truenas-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerPoolTools(server: McpServer): void {
  server.registerTool(
    "list_pools",
    {
      title: "List Pools",
      description: "List all ZFS storage pools on the TrueNAS system.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("pool.query");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "get_pool_status",
    {
      title: "Get Pool Status",
      description: "Get detailed status of a specific ZFS storage pool by ID.",
      inputSchema: {
        id: z.number().describe("The numeric ID of the pool."),
      },
    },
    async ({ id }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("pool.query", [[["id", "=", id]]]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
