import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerCronTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_cron_jobs",
    "List all cron jobs",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "cronjob.query"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call cronjob.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_cron_job",
    "Create a new cron job",
    {
      description: z.string().describe("Description of the cron job"),
      command: z.string().describe("Command to execute"),
      schedule: z.object({
        minute: z.string().default("0").describe("Minute (0-59 or cron expression)"),
        hour: z.string().default("0").describe("Hour (0-23 or cron expression)"),
        dom: z.string().default("*").describe("Day of month (1-31 or cron expression)"),
        month: z.string().default("*").describe("Month (1-12 or cron expression)"),
        dow: z.string().default("*").describe("Day of week (0-6 or cron expression)"),
      }).describe("Cron schedule"),
      user: z.string().optional().default("root").describe("User to run the command as (default: root)"),
      enabled: z.boolean().optional().default(true).describe("Whether the cron job is enabled (default: true)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const payload = JSON.stringify({
          description: args.description,
          command: args.command,
          schedule: args.schedule,
          user: args.user,
          enabled: args.enabled,
        });
        const result = await executeAuto(config, "midclt", ["call", "cronjob.create", payload]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call cronjob.create failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Cron job "${args.description}" created.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "run_cron_job",
    "Run a cron job immediately",
    {
      id: z.number().describe("Cron job ID to run"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "cronjob.run", String(args.id)]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call cronjob.run failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Cron job ${args.id} started.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
