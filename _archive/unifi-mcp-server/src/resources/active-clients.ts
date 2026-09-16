import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getUniFiClient } from "../lib/unifi-client.js";

export function registerActiveClientResources(server: McpServer): void {
  server.resource(
    "active-clients",
    "unifi://clients/active",
    { description: "Currently connected UniFi network clients" },
    async (uri) => {
      const client = getUniFiClient();
      const data = await client.stat("/sta");
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
