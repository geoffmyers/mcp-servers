import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerFindFilesPrompt } from "./find-files.js";

export function registerPrompts(server: McpServer): void {
  registerFindFilesPrompt(server);
}
