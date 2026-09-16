import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getUniFiClient } from "../lib/unifi-client.js";

export function registerDeviceResources(server: McpServer): void {
  server.resource(
    "devices",
    "unifi://devices",
    { description: "UniFi network devices (APs, switches, gateways)" },
    async (uri) => {
      const client = getUniFiClient();
      const data = await client.stat("/device");
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
