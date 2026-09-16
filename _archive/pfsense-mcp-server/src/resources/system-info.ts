import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPfSenseClient } from "../lib/pfsense-client.js";

export function registerSystemInfoResource(server: McpServer): void {
  server.resource(
    "system-info",
    "pfsense://system/info",
    { description: "pfSense system information including version, hostname, and uptime" },
    async (uri) => {
      const client = getPfSenseClient();
      const data = await client.get("/system/version");
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
