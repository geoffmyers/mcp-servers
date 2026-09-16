import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttPublish, mqttSubscribeOne } from "../lib/mqtt.js";

export function registerControlTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "set_device_state",
    "Set the state of a Zigbee device (e.g. turn on/off, set brightness, color temperature)",
    {
      device: z.string().describe("Device friendly name"),
      state: z.record(z.unknown()).describe("State object to set (e.g. {\"state\": \"ON\", \"brightness\": 254})"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttPublish(
          mqtt,
          `zigbee2mqtt/${args.device}/set`,
          JSON.stringify(args.state)
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT publish failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `State set for "${args.device}": ${JSON.stringify(args.state)}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_device_state",
    "Get the current state of a Zigbee device",
    {
      device: z.string().describe("Device friendly name"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttSubscribeOne(mqtt, `zigbee2mqtt/${args.device}`);
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
