import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTrueNASClient } from "../lib/truenas-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerReplicationTools(server: McpServer): void {
  server.registerTool(
    "list_replications",
    {
      title: "List Replications",
      description: "List all replication tasks on the TrueNAS system.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("replication.query");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "run_replication",
    {
      title: "Run Replication",
      description: "Manually trigger a replication task by ID.",
      inputSchema: {
        id: z.number().describe("The numeric ID of the replication task to run."),
      },
    },
    async ({ id }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.callJob("replication.run", [id]);
        return { content: [{ type: "text", text: `Replication task ${id} completed successfully.\n${JSON.stringify(result, null, 2)}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
