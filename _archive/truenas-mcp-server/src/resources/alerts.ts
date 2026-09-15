import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getTrueNASClient } from "../lib/truenas-client.js";

export function registerAlertResources(server: McpServer): void {
  server.resource(
    "alerts",
    "truenas://alerts",
    { description: "List all active system alerts" },
    async (uri) => {
      const client = getTrueNASClient();
      const alerts = await client.call("alert.list");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(alerts, null, 2),
          },
        ],
      };
    }
  );
}
