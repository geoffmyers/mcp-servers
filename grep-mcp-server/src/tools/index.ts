import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGrepTools } from "./grep.js";

export function registerTools(server: McpServer): void {
  registerGrepTools(server);
}
