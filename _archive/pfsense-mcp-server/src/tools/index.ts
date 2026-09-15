import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSystemTools } from "./system.js";
import { registerFirewallRuleTools } from "./firewall-rules.js";
import { registerFirewallNatTools } from "./firewall-nat.js";
import { registerAliasTools } from "./aliases.js";
import { registerInterfaceTools } from "./interfaces.js";
import { registerServiceTools } from "./services.js";
import { registerVpnTools } from "./vpn.js";
import { registerDiagnosticTools } from "./diagnostics.js";
import { registerGatewayTools } from "./gateway.js";

export function registerTools(server: McpServer): void {
  registerSystemTools(server);
  registerFirewallRuleTools(server);
  registerFirewallNatTools(server);
  registerAliasTools(server);
  registerInterfaceTools(server);
  registerServiceTools(server);
  registerVpnTools(server);
  registerDiagnosticTools(server);
  registerGatewayTools(server);
}
