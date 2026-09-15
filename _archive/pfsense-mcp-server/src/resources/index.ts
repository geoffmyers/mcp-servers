import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSystemInfoResource } from "./system-info.js";
import { registerInterfaceResources } from "./interfaces.js";
import { registerGatewayResources } from "./gateways.js";
import { registerServiceResources } from "./services.js";
import { registerFirewallRuleResources } from "./firewall-rules.js";

export function registerResources(server: McpServer): void {
  registerSystemInfoResource(server);
  registerInterfaceResources(server);
  registerGatewayResources(server);
  registerServiceResources(server);
  registerFirewallRuleResources(server);
}
