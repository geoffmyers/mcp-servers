import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttRequestResponse } from "../lib/mqtt.js";

const ZWAVE_API_BASE = "zwave/_CLIENTS/ZWAVE_GATEWAY-zwave-js-ui/api";

export function registerControlTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "set_node_value",
    "Set a value on a Z-Wave node (e.g., turn on a switch, set dimmer level)",
    {
      node_id: z.coerce.number().int().positive().describe("Z-Wave node ID"),
      command_class: z.coerce.number().int().describe("Z-Wave command class ID (e.g., 37 for Binary Switch, 38 for Multilevel Switch)"),
      property: z.string().describe("Property name (e.g., 'targetValue', 'currentValue')"),
      value: z.union([z.string(), z.number(), z.boolean()]).describe("Value to set"),
      endpoint: z.coerce.number().int().optional().default(0).describe("Endpoint index (default 0)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const valueId = {
          commandClass: args.command_class,
          endpoint: args.endpoint,
          property: args.property,
        };
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/writeValue/set`,
          `${ZWAVE_API_BASE}/writeValue`,
          JSON.stringify({ args: [valueId, args.value] })
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Value set on node ${args.node_id}: ${args.property} = ${args.value}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_node_value",
    "Get the current value of a Z-Wave node property",
    {
      node_id: z.coerce.number().int().positive().describe("Z-Wave node ID"),
      command_class: z.coerce.number().int().describe("Z-Wave command class ID"),
      property: z.string().describe("Property name (e.g., 'currentValue')"),
      endpoint: z.coerce.number().int().optional().default(0).describe("Endpoint index (default 0)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const valueId = {
          commandClass: args.command_class,
          endpoint: args.endpoint,
          property: args.property,
        };
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/getNodes/set`,
          `${ZWAVE_API_BASE}/getNodes`,
          JSON.stringify({ args: [] })
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }

        try {
          const response = JSON.parse(result.stdout);
          const nodes = response.result || response;
          if (Array.isArray(nodes)) {
            const node = nodes.find((n: { nodeId?: number; id?: number }) => n.nodeId === args.node_id || n.id === args.node_id);
            if (!node) {
              return { isError: true, content: [{ type: "text", text: `Node ${args.node_id} not found.` }] };
            }
            const values = node.values ? Object.values(node.values) : [];
            const match = values.find((v: unknown) => {
              const val = v as { commandClass?: number; endpoint?: number; property?: string };
              return val.commandClass === args.command_class &&
                val.endpoint === args.endpoint &&
                val.property === args.property;
            });
            if (match) {
              return { content: [{ type: "text", text: JSON.stringify(match, null, 2) }] };
            }
          }
          return {
            content: [{
              type: "text",
              text: `No matching value found for node ${args.node_id} (CC ${args.command_class}, property "${args.property}", endpoint ${args.endpoint}).`,
            }],
          };
        } catch {
          return { content: [{ type: "text", text: result.stdout }] };
        }
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
