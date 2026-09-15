import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttRequestResponse } from "../lib/mqtt.js";

const ZWAVE_API_BASE = "zwave/_CLIENTS/ZWAVE_GATEWAY-zwave-js-ui/api";

export function registerConfigTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "get_node_config_params",
    "Get all values for a Z-Wave node, including configuration parameters (command class 112)",
    {
      node_id: z.coerce.number().int().positive().describe("Z-Wave node ID"),
    },
    async (args): Promise<CallToolResult> => {
      try {
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
            const configValues = values.filter((v: unknown) => {
              const val = v as { commandClass?: number };
              return val.commandClass === 112;
            });
            if (configValues.length === 0) {
              return { content: [{ type: "text", text: `Node ${args.node_id} has no configuration parameters (CC 112). Showing all ${values.length} values:\n${JSON.stringify(values.slice(0, 50), null, 2)}` }] };
            }
            return { content: [{ type: "text", text: JSON.stringify(configValues, null, 2) }] };
          }
        } catch {
          // If parsing fails, return raw output
        }
        return { content: [{ type: "text", text: result.stdout || "No response received." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "set_node_config_param",
    "Set a configuration parameter on a Z-Wave node using the Configuration command class (CC 112)",
    {
      node_id: z.coerce.number().int().positive().describe("Z-Wave node ID"),
      param_number: z.coerce.number().int().describe("Configuration parameter number"),
      value: z.coerce.number().int().describe("Value to set"),
      value_size: z.coerce.number().int().optional().default(1).describe("Value size in bytes (1, 2, or 4)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/sendCommand/set`,
          `${ZWAVE_API_BASE}/sendCommand`,
          JSON.stringify({
            args: [
              { nodeId: args.node_id, commandClass: 112, endpoint: 0 },
              "set",
              [args.param_number, args.value, args.value_size],
            ],
          })
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Configuration parameter ${args.param_number} set to ${args.value} on node ${args.node_id}.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
