import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { mongoQuery } from "../lib/mongo.js";

export function registerWlanTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_wlans",
    "List all configured wireless networks (SSIDs)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mongoQuery(
          config,
          'db.wlanconf.find({}).forEach(printjson)'
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No WLANs found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
