import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttRequestResponse } from "../lib/mqtt.js";

export function registerManagementTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "interview_device",
    "Re-interview a Zigbee device to refresh its configuration and capabilities",
    {
      device: z.string().describe("Device friendly name or IEEE address"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          "zigbee2mqtt/bridge/request/device/interview",
          "zigbee2mqtt/bridge/response/device/interview",
          JSON.stringify({ id: args.device })
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

  server.tool(
    "rename_device",
    "Rename a Zigbee device",
    {
      old_name: z.string().describe("Current device friendly name"),
      new_name: z.string().describe("New device friendly name"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          "zigbee2mqtt/bridge/request/device/rename",
          "zigbee2mqtt/bridge/response/device/rename",
          JSON.stringify({ from: args.old_name, to: args.new_name })
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

  server.tool(
    "remove_device",
    "Remove a Zigbee device from the network (requires confirm: true)",
    {
      device: z.string().describe("Device friendly name or IEEE address"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to remove this device." }] };
      }
      try {
        const result = await mqttRequestResponse(
          mqtt,
          "zigbee2mqtt/bridge/request/device/remove",
          "zigbee2mqtt/bridge/response/device/remove",
          JSON.stringify({ id: args.device })
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

  server.tool(
    "force_remove_device",
    "Force remove an unresponsive Zigbee device from the network (requires confirm: true)",
    {
      device: z.string().describe("Device friendly name or IEEE address"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to force remove this device." }] };
      }
      try {
        const result = await mqttRequestResponse(
          mqtt,
          "zigbee2mqtt/bridge/request/device/remove",
          "zigbee2mqtt/bridge/response/device/remove",
          JSON.stringify({ id: args.device, force: true })
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

  server.tool(
    "configure_device",
    "Re-send Zigbee configuration to a device",
    {
      device: z.string().describe("Device friendly name or IEEE address"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          "zigbee2mqtt/bridge/request/device/configure",
          "zigbee2mqtt/bridge/response/device/configure",
          JSON.stringify({ id: args.device })
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
