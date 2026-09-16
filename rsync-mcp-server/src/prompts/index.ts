import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBackupPlanPrompt } from "./backup-plan.js";

export function registerPrompts(server: McpServer): void {
  registerBackupPlanPrompt(server);
}
