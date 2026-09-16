import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getTrueNASClient } from "../lib/truenas-client.js";

export function registerDatasetResources(server: McpServer): void {
  server.resource(
    "datasets",
    "truenas://datasets",
    { description: "List all ZFS datasets" },
    async (uri) => {
      const client = getTrueNASClient();
      const datasets = await client.call("pool.dataset.query");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(datasets, null, 2),
          },
        ],
      };
    }
  );

  server.resource(
    "dataset-by-id",
    new ResourceTemplate("truenas://dataset/{id}", { list: undefined }),
    { description: "Get a specific ZFS dataset by ID" },
    async (uri, { id }) => {
      const client = getTrueNASClient();
      const dataset = await client.call("pool.dataset.get_instance", [id]);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(dataset, null, 2),
          },
        ],
      };
    }
  );
}
