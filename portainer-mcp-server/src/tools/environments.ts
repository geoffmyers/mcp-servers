import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPortainerClient } from "../lib/portainer-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerEnvironmentTools(server: McpServer): void {
  server.tool(
    "list_environments",
    "List all Portainer environments (endpoints)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get("/endpoints");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
