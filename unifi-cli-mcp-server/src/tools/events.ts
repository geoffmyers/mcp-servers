import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { mongoQuery } from "../lib/mongo.js";

export function registerEventTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_events",
    "List recent UniFi network events (sorted newest first)",
    {
      limit: z.coerce.number().int().positive().optional().default(50).describe("Maximum number of events to return (default 50)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mongoQuery(
          config,
          `db.event.find({}).sort({time:-1}).limit(${args.limit}).forEach(printjson)`,
          { maxBuffer: 1024 * 1024 }
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No events found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "list_alarms",
    "List recent UniFi alarms (sorted newest first)",
    {
      limit: z.coerce.number().int().positive().optional().default(50).describe("Maximum number of alarms to return (default 50)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mongoQuery(
          config,
          `db.alarm.find({}).sort({time:-1}).limit(${args.limit}).forEach(printjson)`,
          { maxBuffer: 1024 * 1024 }
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No alarms found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "list_recent_alarms",
    "List recent alarms with detail",
    {
      limit: z.coerce.number().int().positive().optional().default(20).describe("Number of alarms to return (default 20)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mongoQuery(
          config,
          `db.alarm.find({}).sort({time:-1}).limit(${args.limit}).forEach(printjson)`,
          { maxBuffer: 1024 * 1024 }
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No alarms found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
