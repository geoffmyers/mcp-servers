import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPortainerClient } from "../lib/portainer-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerSystemTools(server: McpServer): void {
  server.tool(
    "get_system_info",
    "Get Portainer system information",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get("/system/info");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_system_status",
    "Get Portainer system status",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get("/system/status");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
