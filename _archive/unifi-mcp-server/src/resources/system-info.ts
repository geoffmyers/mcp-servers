import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getUniFiClient } from "../lib/unifi-client.js";

export function registerSystemInfoResource(server: McpServer): void {
  server.resource(
    "system-info",
    "unifi://system/info",
    { description: "UniFi system information and controller status" },
    async (uri) => {
      const client = getUniFiClient();
      const data = await client.stat("/sysinfo");
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
