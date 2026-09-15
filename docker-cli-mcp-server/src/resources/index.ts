import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { executeAuto, getServerConfig } from "@geoffmyers/mcp-server-shared";

export function registerResources(server: McpServer): void {
  const config = getServerConfig();

  server.resource(
    "containers",
    "docker://containers",
    { description: "List of all Docker containers with status" },
    async () => {
      const result = await executeAuto(config, "docker", ["ps", "-a", "--format", "json"]);
      return {
        contents: [
          {
            uri: "docker://containers",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );

  server.resource(
    "system-info",
    "docker://system/info",
    { description: "Docker system information" },
    async () => {
      const result = await executeAuto(config, "docker", ["system", "info", "--format", "json"]);
      return {
        contents: [
          {
            uri: "docker://system/info",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );
}
