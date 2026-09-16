import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDiagnoseConnectivityPrompt } from "./diagnose-connectivity.js";
import { registerFirewallAuditPrompt } from "./firewall-audit.js";
import { registerVpnSetupPrompt } from "./vpn-setup.js";

export function registerPrompts(server: McpServer): void {
  registerDiagnoseConnectivityPrompt(server);
  registerFirewallAuditPrompt(server);
  registerVpnSetupPrompt(server);
}
