import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPfSenseClient } from "../lib/pfsense-client.js";

export function registerServiceResources(server: McpServer): void {
  server.resource(
    "services-status",
    "pfsense://services/status",
    { description: "pfSense services and their running status" },
    async (uri) => {
      const client = getPfSenseClient();
      const data = await client.get("/status/services");
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
