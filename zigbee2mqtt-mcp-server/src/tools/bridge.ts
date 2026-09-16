import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttSubscribeOne } from "../lib/mqtt.js";

export function registerBridgeTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "bridge_info",
    "Get Zigbee2MQTT bridge information including version, coordinator details, and configuration",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mqttSubscribeOne(mqtt, "zigbee2mqtt/bridge/info");
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT subscribe failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "bridge_state",
    "Get the current Zigbee2MQTT bridge connection state (online/offline)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mqttSubscribeOne(mqtt, "zigbee2mqtt/bridge/state");
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT subscribe failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
