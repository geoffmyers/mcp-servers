import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getUniFiClient } from "../lib/unifi-client.js";

export function registerSiteResources(server: McpServer): void {
  server.resource(
    "sites",
    "unifi://sites",
    { description: "UniFi sites managed by this controller" },
    async (uri) => {
      const client = getUniFiClient();
      const data = await client.requestGlobal("GET", "/self/sites");
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
