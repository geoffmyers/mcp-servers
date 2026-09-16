import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getPortainerClient } from "../lib/portainer-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerTemplateTools(server: McpServer): void {
  server.tool(
    "list_templates",
    "List all available application templates",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get("/templates");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
