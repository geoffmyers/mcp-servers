import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerFirewallAuditPrompt } from "./firewall-audit.js";
import { registerDiagnoseConnectivityPrompt } from "./diagnose-connectivity.js";

export function registerPrompts(server: McpServer): void {
  registerFirewallAuditPrompt(server);
  registerDiagnoseConnectivityPrompt(server);
}
