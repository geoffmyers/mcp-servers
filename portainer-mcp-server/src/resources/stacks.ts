import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPortainerClient } from "../lib/portainer-client.js";

export function registerStackResources(server: McpServer): void {
  server.resource(
    "stacks",
    "portainer://stacks",
    { description: "List all Portainer stacks" },
    async (uri) => {
      const client = getPortainerClient();
      const stacks = await client.get("/stacks");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(stacks, null, 2),
          },
        ],
      };
    }
  );

  server.resource(
    "stack-by-id",
    new ResourceTemplate("portainer://stack/{id}", { list: undefined }),
    { description: "Get a specific Portainer stack by ID" },
    async (uri, { id }) => {
      const client = getPortainerClient();
      const stack = await client.get(`/stacks/${id}`);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(stack, null, 2),
          },
        ],
      };
    }
  );
}
