import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getUniFiClient } from "../lib/unifi-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerSiteTools(server: McpServer): void {
  server.tool(
    "list_sites",
    "List all UniFi sites",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.requestGlobal("GET", "/self/sites");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
