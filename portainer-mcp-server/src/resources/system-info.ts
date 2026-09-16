import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPortainerClient } from "../lib/portainer-client.js";

export function registerSystemInfoResource(server: McpServer): void {
  server.resource(
    "system-info",
    "portainer://system/info",
    { description: "Portainer system information and version details" },
    async (uri) => {
      const client = getPortainerClient();
      const info = await client.get("/system/info");
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
