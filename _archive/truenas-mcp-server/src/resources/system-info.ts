import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getTrueNASClient } from "../lib/truenas-client.js";

export function registerSystemInfoResource(server: McpServer): void {
  server.resource(
    "system-info",
    "truenas://system/info",
    { description: "TrueNAS system information including version, hostname, and hardware details" },
    async (uri) => {
      const client = getTrueNASClient();
      const info = await client.call("system.info");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    }
  );
}
