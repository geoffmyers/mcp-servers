import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDiagnosePoolPrompt } from "./diagnose-pool.js";
import { registerPlanBackupPrompt } from "./plan-backup.js";
import { registerStorageReportPrompt } from "./storage-report.js";

export function registerPrompts(server: McpServer): void {
  registerDiagnosePoolPrompt(server);
  registerPlanBackupPrompt(server);
  registerStorageReportPrompt(server);
}
