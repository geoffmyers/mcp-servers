import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPfSenseClient } from "../lib/pfsense-client.js";

export function registerFirewallRuleResources(server: McpServer): void {
  server.resource(
    "firewall-rules",
    new ResourceTemplate("pfsense://firewall/rules/{interface}", { list: undefined }),
    { description: "pfSense firewall rules filtered by interface" },
    async (uri, { interface: iface }) => {
      const client = getPfSenseClient();
      const data = await client.get("/firewall/rules", {
        interface: String(iface),
      });
      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(data, null, 2),
        }],
      };
    }
  );
}
