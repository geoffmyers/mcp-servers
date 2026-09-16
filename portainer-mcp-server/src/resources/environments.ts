import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPortainerClient } from "../lib/portainer-client.js";

export function registerEnvironmentResources(server: McpServer): void {
  server.resource(
    "environments",
    "portainer://environments",
    { description: "List all Portainer environments (endpoints)" },
    async (uri) => {
      const client = getPortainerClient();
      const environments = await client.get("/endpoints");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(environments, null, 2),
          },
        ],
      };
    }
  );

  server.resource(
    "environment-by-id",
    new ResourceTemplate("portainer://environment/{id}", { list: undefined }),
    { description: "Get a specific Portainer environment by ID" },
    async (uri, { id }) => {
      const client = getPortainerClient();
      const environment = await client.get(`/endpoints/${id}`);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(environment, null, 2),
          },
        ],
      };
    }
  );
}
