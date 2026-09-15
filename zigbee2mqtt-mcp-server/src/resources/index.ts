import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getMqttConfig, mqttSubscribeOne } from "../lib/mqtt.js";

export function registerResources(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.resource(
    "devices",
    "zigbee2mqtt://devices",
    { description: "List of all Zigbee devices with status and properties" },
    async () => {
      const result = await mqttSubscribeOne(mqtt, "zigbee2mqtt/bridge/devices");
      return {
        contents: [
          {
            uri: "zigbee2mqtt://devices",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );

  server.resource(
    "bridge-info",
    "zigbee2mqtt://bridge/info",
    { description: "Zigbee2MQTT bridge information including version and coordinator details" },
    async () => {
      const result = await mqttSubscribeOne(mqtt, "zigbee2mqtt/bridge/info");
      return {
        contents: [
          {
            uri: "zigbee2mqtt://bridge/info",
            mimeType: "application/json",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );
}
