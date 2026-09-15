import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getTrueNASClient } from "../lib/truenas-client.js";

export function registerPoolResources(server: McpServer): void {
  server.resource(
    "pools",
    "truenas://pools",
    { description: "List all ZFS storage pools" },
    async (uri) => {
      const client = getTrueNASClient();
      const pools = await client.call("pool.query");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(pools, null, 2),
          },
        ],
      };
    }
  );

  server.resource(
    "pool-by-name",
    new ResourceTemplate("truenas://pool/{name}", { list: undefined }),
    { description: "Get a specific ZFS pool by name" },
    async (uri, { name }) => {
      const client = getTrueNASClient();
      const pools = await client.call("pool.query", [[["name", "=", name]]]);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(pools, null, 2),
          },
        ],
      };
    }
  );
}
