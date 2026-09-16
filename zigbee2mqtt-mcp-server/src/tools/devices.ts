import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttSubscribeOne } from "../lib/mqtt.js";

export function registerDeviceTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "list_devices",
    "List all Zigbee devices with their type, model, manufacturer, and availability",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mqttSubscribeOne(mqtt, "zigbee2mqtt/bridge/devices");
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
    "device_info",
    "Get detailed information about a specific Zigbee device by friendly name or IEEE address",
    {
      friendly_name: z.string().describe("The friendly name or IEEE address of the device"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttSubscribeOne(mqtt, "zigbee2mqtt/bridge/devices");
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT subscribe failed: ${result.stderr}` }] };
        }
        try {
          const devices = JSON.parse(result.stdout);
          const device = devices.find(
            (d: { friendly_name?: string; ieee_address?: string }) =>
              d.friendly_name === args.friendly_name || d.ieee_address === args.friendly_name
          );
          if (!device) {
            return { isError: true, content: [{ type: "text", text: `Device not found: ${args.friendly_name}` }] };
          }
          return { content: [{ type: "text", text: JSON.stringify(device, null, 2) }] };
        } catch {
          return { content: [{ type: "text", text: `Raw device list (could not parse):\n${result.stdout}` }] };
        }
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "offline_devices",
    "List all Zigbee devices that are currently offline or unavailable",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mqttSubscribeOne(mqtt, "zigbee2mqtt/bridge/devices");
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT subscribe failed: ${result.stderr}` }] };
        }

        try {
          const devices = JSON.parse(result.stdout);
          const offline = devices.filter(
            (d: { disabled?: boolean; availability?: { state?: string } }) =>
              d.disabled || d.availability?.state === "offline"
          );
          if (offline.length === 0) {
            return { content: [{ type: "text", text: "All devices are online." }] };
          }
          return { content: [{ type: "text", text: JSON.stringify(offline, null, 2) }] };
        } catch {
          // If parsing fails, return raw output for manual inspection
          return { content: [{ type: "text", text: `Raw device list (could not filter):\n${result.stdout}` }] };
        }
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
