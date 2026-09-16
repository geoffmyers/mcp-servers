import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerStorageReportPrompt } from "./storage-report.js";
import { registerDiagnosePoolPrompt } from "./diagnose-pool.js";

export function registerPrompts(server: McpServer): void {
  registerStorageReportPrompt(server);
  registerDiagnosePoolPrompt(server);
}
