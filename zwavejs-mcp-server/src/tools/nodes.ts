import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttRequestResponse } from "../lib/mqtt.js";

const ZWAVE_API_BASE = "zwave/_CLIENTS/ZWAVE_GATEWAY-zwave-js-ui/api";

export function registerNodeTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "list_nodes",
    "List all Z-Wave nodes on the network with their status and basic info",
    {},
    async (): Promise<CallToolResult> => {
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
        return { content: [{ type: "text", text: result.stdout || "No response received." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "node_info",
    "Get detailed information about a specific Z-Wave node",
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
            if (node) {
              return { content: [{ type: "text", text: JSON.stringify(node, null, 2) }] };
            }
            return { isError: true, content: [{ type: "text", text: `Node ${args.node_id} not found.` }] };
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
    "offline_nodes",
    "Find Z-Wave nodes that are dead or offline",
    {},
    async (): Promise<CallToolResult> => {
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
          if (!Array.isArray(nodes)) {
            return { content: [{ type: "text", text: `Unexpected response format:\n${result.stdout}` }] };
          }

          const offlineNodes = nodes.filter((node: { status?: string }) => {
            const status = (node.status || "").toLowerCase();
            return status === "dead" || status === "offline" || status === "asleep";
          });

          if (offlineNodes.length === 0) {
            return { content: [{ type: "text", text: "All Z-Wave nodes are online." }] };
          }

          return { content: [{ type: "text", text: JSON.stringify(offlineNodes, null, 2) }] };
        } catch {
          // If we can't parse, return the raw response for manual inspection
          return { content: [{ type: "text", text: `Raw node list (could not filter):\n${result.stdout}` }] };
        }
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_node_statistics",
    "Get communication statistics for a Z-Wave node (TX/RX counts, RTT, route changes)",
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
            const stats = node.statistics || node.stats || {};
            const info = {
              nodeId: node.nodeId || node.id,
              name: node.name || node.label || "",
              status: node.status,
              lastActive: node.lastActive,
              interviewStage: node.interviewStage,
              statistics: stats,
            };
            return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
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
}
