import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPfSenseClient } from "../lib/pfsense-client.js";

export function registerGatewayResources(server: McpServer): void {
  server.resource(
    "gateways-status",
    "pfsense://gateways/status",
    { description: "pfSense gateway status including latency and packet loss" },
    async (uri) => {
      const client = getPfSenseClient();
      const data = await client.get("/status/gateways");
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
