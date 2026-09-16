import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { mongoQuery } from "../lib/mongo.js";

const MAC_REGEX = /^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/;

export function registerClientTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_active_clients",
    "List all known UniFi clients (active and historical)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mongoQuery(
          config,
          'db.user.find({}).forEach(printjson)',
          { timeout: 30_000, maxBuffer: 1024 * 1024 }
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No clients found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "client_info",
    "Get detailed information about a specific client by MAC address",
    {
      mac: z.string().regex(MAC_REGEX).describe("Client MAC address (e.g. aa:bb:cc:dd:ee:ff)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mongoQuery(
          config,
          `db.user.find({mac:"${args.mac.toLowerCase()}"}).forEach(printjson)`
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No client found with that MAC address." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "list_all_clients",
    "List ALL known clients including historical (not just active)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mongoQuery(
          config,
          'db.user.find({}).sort({last_seen:-1}).limit(200).forEach(printjson)',
          { maxBuffer: 2 * 1024 * 1024 }
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No clients found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "client_history",
    "Get client connection history and statistics by MAC address",
    {
      mac: z.string().regex(MAC_REGEX).describe("Client MAC address (e.g. aa:bb:cc:dd:ee:ff)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const mac = args.mac.toLowerCase();
        const userResult = await mongoQuery(
          config,
          `db.user.find({mac:"${mac}"}).forEach(printjson)`
        );
        const statResult = await mongoQuery(
          config,
          `db.stat_hourly.find({mac:"${mac}"}).sort({time:-1}).limit(24).forEach(printjson)`,
          { maxBuffer: 1024 * 1024 }
        );

        const parts: string[] = [];
        if (userResult.exitCode === 0 && userResult.stdout) {
          parts.push("=== Client Info ===\n" + userResult.stdout);
        }
        if (statResult.exitCode === 0 && statResult.stdout) {
          parts.push("=== Recent Hourly Stats ===\n" + statResult.stdout);
        }

        const output = parts.join("\n\n");
        return { content: [{ type: "text", text: output || "No client data found for that MAC address." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
