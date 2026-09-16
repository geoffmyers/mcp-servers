import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSystemTools } from "./system.js";
import { registerFirewallTools } from "./firewall.js";
import { registerInterfaceTools } from "./interfaces.js";
import { registerGatewayTools } from "./gateway.js";
import { registerServiceTools } from "./services.js";
import { registerNetworkTools } from "./network.js";
import { registerVpnTools } from "./vpn.js";
import { registerDiagnosticTools } from "./diagnostics.js";
import { registerDnsTools } from "./dns.js";

export function registerTools(server: McpServer): void {
  registerSystemTools(server);
  registerFirewallTools(server);
  registerInterfaceTools(server);
  registerGatewayTools(server);
  registerServiceTools(server);
  registerNetworkTools(server);
  registerVpnTools(server);
  registerDiagnosticTools(server);
  registerDnsTools(server);
}
