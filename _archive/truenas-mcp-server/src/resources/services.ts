import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getTrueNASClient } from "../lib/truenas-client.js";

export function registerServiceResources(server: McpServer): void {
  server.resource(
    "services",
    "truenas://services",
    { description: "List all system services and their status" },
    async (uri) => {
      const client = getTrueNASClient();
      const services = await client.call("service.query");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(services, null, 2),
          },
        ],
      };
    }
  );
}
