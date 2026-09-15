import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getMqttConfig, mqttRequestResponse } from "../lib/mqtt.js";

const ZWAVE_API_BASE = "zwave/_CLIENTS/ZWAVE_GATEWAY-zwave-js-ui/api";

export function registerResources(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.resource(
    "nodes",
    "zwavejs://nodes",
    { description: "List of all Z-Wave nodes on the network" },
    async () => {
      const result = await mqttRequestResponse(
        mqtt,
        `${ZWAVE_API_BASE}/getNodes/set`,
        `${ZWAVE_API_BASE}/getNodes`,
        JSON.stringify({ args: [] })
      );
      return {
        contents: [
          {
            uri: "zwavejs://nodes",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );

  server.resource(
    "controller",
    "zwavejs://controller",
    { description: "Z-Wave controller information" },
    async () => {
      const result = await mqttRequestResponse(
        mqtt,
        `${ZWAVE_API_BASE}/getInfo/set`,
        `${ZWAVE_API_BASE}/getInfo`,
        JSON.stringify({ args: [] })
      );
      return {
        contents: [
          {
            uri: "zwavejs://controller",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );
}
