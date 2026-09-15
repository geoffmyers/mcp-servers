import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttRequestResponse } from "../lib/mqtt.js";

export function registerBindingTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "bind_devices",
    "Create a direct binding between two Zigbee devices",
    {
      source: z.string().describe("Source device friendly name"),
      target: z.string().describe("Target device friendly name"),
      clusters: z.array(z.string()).optional().describe("Cluster names to bind (e.g. ['genOnOff', 'genLevelCtrl'])"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          "zigbee2mqtt/bridge/request/device/bind",
          "zigbee2mqtt/bridge/response/device/bind",
          JSON.stringify({ from: args.source, to: args.target, ...(args.clusters ? { clusters: args.clusters } : {}) })
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
    "unbind_devices",
    "Remove a binding between two Zigbee devices",
    {
      source: z.string().describe("Source device friendly name"),
      target: z.string().describe("Target device friendly name"),
      clusters: z.array(z.string()).optional().describe("Cluster names to unbind (e.g. ['genOnOff', 'genLevelCtrl'])"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          "zigbee2mqtt/bridge/request/device/unbind",
          "zigbee2mqtt/bridge/response/device/unbind",
          JSON.stringify({ from: args.source, to: args.target, ...(args.clusters ? { clusters: args.clusters } : {}) })
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
