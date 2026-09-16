import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTrueNASClient } from "../lib/truenas-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerSnapshotTaskTools(server: McpServer): void {
  server.registerTool(
    "list_snapshot_tasks",
    {
      title: "List Snapshot Tasks",
      description: "List all periodic snapshot tasks on the TrueNAS system.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("pool.snapshottask.query");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "create_snapshot_task",
    {
      title: "Create Snapshot Task",
      description: "Create a new periodic snapshot task.",
      inputSchema: {
        dataset: z.string().describe("The dataset to snapshot (e.g. 'tank/data')."),
        recursive: z.boolean().describe("Whether to recursively snapshot child datasets."),
        lifetime_value: z.number().describe("How long to keep snapshots (numeric value)."),
        lifetime_unit: z.enum(["HOUR", "DAY", "WEEK", "MONTH", "YEAR"]).describe("The unit for lifetime_value."),
        naming_schema: z.string().optional().describe("Naming schema for snapshots (e.g. 'auto-%Y-%m-%d_%H-%M')."),
        schedule: z.object({
          minute: z.string().optional().describe("Cron minute field (default '0')."),
          hour: z.string().optional().describe("Cron hour field (default '0')."),
          dom: z.string().optional().describe("Cron day-of-month field (default '*')."),
          month: z.string().optional().describe("Cron month field (default '*')."),
          dow: z.string().optional().describe("Cron day-of-week field (default '*')."),
        }).optional().describe("Cron-style schedule for the task."),
      },
    },
    async ({ dataset, recursive, lifetime_value, lifetime_unit, naming_schema, schedule }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const params: Record<string, unknown> = { dataset, recursive, lifetime_value, lifetime_unit };
        if (naming_schema !== undefined) params.naming_schema = naming_schema;
        if (schedule !== undefined) params.schedule = schedule;

        const result = await client.call("pool.snapshottask.create", [params]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
