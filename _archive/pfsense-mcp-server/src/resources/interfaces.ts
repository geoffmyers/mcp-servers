import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPfSenseClient } from "../lib/pfsense-client.js";

export function registerInterfaceResources(server: McpServer): void {
  server.resource(
    "interfaces",
    "pfsense://interfaces",
    { description: "pfSense network interfaces and their configuration" },
    async (uri) => {
      const client = getPfSenseClient();
      const data = await client.get("/interfaces");
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
