import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { executeAuto, getServerConfig } from "@geoffmyers/mcp-server-shared";

export function registerResources(server: McpServer): void {
  const config = getServerConfig();

  server.resource(
    "core-info",
    "homeassistant://core/info",
    { description: "Home Assistant Core information (version, state, etc.)" },
    async () => {
      const result = await executeAuto(config, "ha", ["core", "info", "--raw-json"]);
      return {
        contents: [
          {
            uri: "homeassistant://core/info",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );

  server.resource(
    "addons",
    "homeassistant://addons",
    { description: "List of all installed Home Assistant add-ons" },
    async () => {
      const result = await executeAuto(config, "ha", ["addons", "--raw-json"]);
      return {
        contents: [
          {
            uri: "homeassistant://addons",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );

  server.resource(
    "resolution",
    "homeassistant://resolution",
    { description: "Resolution Center information (issues and suggestions)" },
    async () => {
      const result = await executeAuto(config, "ha", ["resolution", "info", "--raw-json"]);
      return {
        contents: [
          {
            uri: "homeassistant://resolution",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );
}
