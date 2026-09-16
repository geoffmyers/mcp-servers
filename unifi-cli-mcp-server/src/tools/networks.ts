import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { mongoQuery } from "../lib/mongo.js";

export function registerNetworkTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_networks",
    "List all configured UniFi networks (VLANs, corporate, guest)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mongoQuery(
          config,
          'db.networkconf.find({}).forEach(printjson)'
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No networks found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "network_info",
    "Get detailed configuration for a specific network by name",
    {
      name: z.string().min(1).describe("Network name (e.g. 'Default', 'IoT', 'Guest')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        // Sanitize name to prevent injection - escape double quotes and backslashes
        const safeName = args.name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const result = await mongoQuery(
          config,
          `db.networkconf.find({name:"${safeName}"}).forEach(printjson)`
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `No network found with name "${args.name}".` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
