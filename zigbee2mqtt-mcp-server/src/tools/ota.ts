import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttRequestResponse } from "../lib/mqtt.js";

export function registerOtaTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "ota_check_update",
    "Check if an OTA firmware update is available for a Zigbee device",
    {
      device: z.string().describe("Device friendly name or IEEE address"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          "zigbee2mqtt/bridge/request/device/ota_update/check",
          "zigbee2mqtt/bridge/response/device/ota_update/check",
          JSON.stringify({ id: args.device }),
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
