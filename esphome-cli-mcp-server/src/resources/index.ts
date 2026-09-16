import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getServerConfig } from "@geoffmyers/mcp-server-shared";
import { executeInContainer } from "../lib/esphome.js";

export function registerResources(server: McpServer): void {
  const config = getServerConfig();
  const configDir = process.env.ESPHOME_CONFIG_DIR || "/config";

  server.resource(
    "devices",
    "esphome://devices",
    { description: "List of ESPHome device YAML files in the config directory" },
    async () => {
      const result = await executeInContainer(config, ["ls", "-1", configDir]);
      const files = result.exitCode === 0
        ? result.stdout
            .split("\n")
            .filter((f) => f.endsWith(".yaml") && f !== "secrets.yaml" && !f.startsWith("_"))
            .sort()
        : [];
      const devices = files.map((f) => f.replace(/\.yaml$/, ""));
      return {
        contents: [
          {
            uri: "esphome://devices",
            mimeType: "application/json",
            text: JSON.stringify(devices, null, 2),
          },
        ],
      };
    }
  );
}
