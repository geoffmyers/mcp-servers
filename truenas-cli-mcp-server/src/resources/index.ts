import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { executeAuto, getServerConfig } from "@geoffmyers/mcp-server-shared";

export function registerResources(server: McpServer): void {
  const config = getServerConfig();

  server.resource(
    "system-info",
    "truenas-cli://system/info",
    { description: "TrueNAS SCALE system information" },
    async () => {
      const result = await executeAuto(config, "midclt", ["call", "system.info"]);
      return {
        contents: [
          {
            uri: "truenas-cli://system/info",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );

  server.resource(
    "pools",
    "truenas-cli://pools",
    { description: "List of all ZFS storage pools" },
    async () => {
      const result = await executeAuto(config, "midclt", ["call", "pool.query"]);
      return {
        contents: [
          {
            uri: "truenas-cli://pools",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );

  server.resource(
    "alerts",
    "truenas-cli://alerts",
    { description: "List of all active alerts" },
    async () => {
      const result = await executeAuto(config, "midclt", ["call", "alert.list"]);
      return {
        contents: [
          {
            uri: "truenas-cli://alerts",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );
}
