import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { mongoQuery } from "../lib/mongo.js";

export function registerStatsTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_dpi_stats",
    "List Deep Packet Inspection statistics (app/category traffic usage)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mongoQuery(
          config,
          'db.dpi.find({}).sort({rx_bytes:-1}).limit(50).forEach(printjson)',
          { maxBuffer: 1024 * 1024 }
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No DPI stats found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "list_hourly_site_stats",
    "List hourly site statistics (traffic, clients)",
    {
      hours: z.coerce.number().int().positive().optional().default(24).describe("Number of hours of stats to return (default 24)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const threshold = new Date(Date.now() - args.hours * 3600000).getTime() / 1000;
        const result = await mongoQuery(
          config,
          `db.stat_hourly_site.find({time:{$gte:${threshold}}}).sort({time:-1}).forEach(printjson)`,
          { maxBuffer: 2 * 1024 * 1024 }
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No hourly site stats found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
