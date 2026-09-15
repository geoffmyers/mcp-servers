import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSystemTools } from "./system.js";
import { registerSiteTools } from "./sites.js";
import { registerClientTools } from "./clients.js";
import { registerDeviceTools } from "./devices.js";
import { registerNetworkTools } from "./networks.js";
import { registerWlanTools } from "./wlans.js";
import { registerFirewallTools } from "./firewall.js";
import { registerEventTools } from "./events.js";
import { registerGuestTools } from "./guests.js";
import { registerDpiTools } from "./dpi.js";
import { registerDnsTools } from "./dns.js";

export function registerTools(server: McpServer): void {
  registerSystemTools(server);
  registerSiteTools(server);
  registerClientTools(server);
  registerDeviceTools(server);
  registerNetworkTools(server);
  registerWlanTools(server);
  registerFirewallTools(server);
  registerEventTools(server);
  registerGuestTools(server);
  registerDpiTools(server);
  registerDnsTools(server);
}
