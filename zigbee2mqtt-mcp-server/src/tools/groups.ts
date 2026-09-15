import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttSubscribeOne, mqttRequestResponse } from "../lib/mqtt.js";

export function registerGroupTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "list_groups",
    "List all Zigbee groups",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mqttSubscribeOne(mqtt, "zigbee2mqtt/bridge/groups");
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
    "create_group",
    "Create a new Zigbee group",
    {
      name: z.string().describe("Group friendly name"),
      id: z.number().optional().describe("Optional group ID"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          "zigbee2mqtt/bridge/request/group/add",
          "zigbee2mqtt/bridge/response/group/add",
          JSON.stringify({ friendly_name: args.name, ...(args.id !== undefined ? { id: args.id } : {}) })
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
    "remove_group",
    "Remove a Zigbee group (requires confirm: true)",
    {
      name: z.string().describe("Group friendly name"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to remove this group." }] };
      }
      try {
        const result = await mqttRequestResponse(
          mqtt,
          "zigbee2mqtt/bridge/request/group/remove",
          "zigbee2mqtt/bridge/response/group/remove",
          JSON.stringify({ id: args.name })
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
    "add_to_group",
    "Add a device to a Zigbee group",
    {
      group: z.string().describe("Group friendly name"),
      device: z.string().describe("Device friendly name"),
      endpoint: z.string().optional().describe("Device endpoint"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          "zigbee2mqtt/bridge/request/group/members/add",
          "zigbee2mqtt/bridge/response/group/members/add",
          JSON.stringify({ group: args.group, device: args.device, ...(args.endpoint ? { endpoint: args.endpoint } : {}) })
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
    "remove_from_group",
    "Remove a device from a Zigbee group",
    {
      group: z.string().describe("Group friendly name"),
      device: z.string().describe("Device friendly name"),
      endpoint: z.string().optional().describe("Device endpoint"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          "zigbee2mqtt/bridge/request/group/members/remove",
          "zigbee2mqtt/bridge/response/group/members/remove",
          JSON.stringify({ group: args.group, device: args.device, ...(args.endpoint ? { endpoint: args.endpoint } : {}) })
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
