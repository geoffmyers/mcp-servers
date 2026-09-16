import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { executeAuto, getServerConfig } from "@geoffmyers/mcp-server-shared";
import { mongoQuery } from "../lib/mongo.js";

export function registerResources(server: McpServer): void {
  const config = getServerConfig();

  server.resource(
    "system-info",
    "unifi-cli://system/info",
    { description: "UniFi controller container status" },
    async () => {
      const result = await executeAuto(config, "docker", ["inspect", "unifi"]);
      return {
        contents: [
          {
            uri: "unifi-cli://system/info",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );

  server.resource(
    "devices",
    "unifi-cli://devices",
    { description: "All adopted UniFi devices" },
    async () => {
      const result = await mongoQuery(
        config,
        'db.device.find({}).forEach(printjson)',
        { maxBuffer: 1024 * 1024 }
      );
      return {
        contents: [
          {
            uri: "unifi-cli://devices",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );

  server.resource(
    "clients",
    "unifi-cli://clients",
    { description: "All known UniFi clients" },
    async () => {
      const result = await mongoQuery(
        config,
        'db.user.find({}).forEach(printjson)',
        { maxBuffer: 1024 * 1024 }
      );
      return {
        contents: [
          {
            uri: "unifi-cli://clients",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );
}
