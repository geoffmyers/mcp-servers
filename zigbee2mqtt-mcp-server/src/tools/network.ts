import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttPublish, mqttRequestResponse } from "../lib/mqtt.js";

export function registerNetworkTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "permit_join",
    "Allow new Zigbee devices to join the network for a specified duration",
    {
      duration: z.coerce.number().int().positive().optional().default(120).describe("Duration in seconds to permit joining (default 120)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttPublish(
          mqtt,
          "zigbee2mqtt/bridge/request/permit_join",
          JSON.stringify({ value: true, time: args.duration })
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT publish failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Permit join enabled for ${args.duration} seconds.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "network_map",
    "Generate a Zigbee network topology map showing device relationships",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          "zigbee2mqtt/bridge/request/networkmap",
          "zigbee2mqtt/bridge/response/networkmap",
          JSON.stringify({ type: "raw", routes: false }),
          30
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
