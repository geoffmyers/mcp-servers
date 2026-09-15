import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttRequestResponse } from "../lib/mqtt.js";

const ZWAVE_API_BASE = "zwave/_CLIENTS/ZWAVE_GATEWAY-zwave-js-ui/api";

export function registerManagementTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "interview_node",
    "Re-interview a Z-Wave node to refresh its capabilities and command classes",
    {
      node_id: z.coerce.number().int().positive().describe("Z-Wave node ID to interview"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/refreshNodeInfo/set`,
          `${ZWAVE_API_BASE}/refreshNodeInfo`,
          JSON.stringify({ args: [args.node_id] })
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Interview started for node ${args.node_id}.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "heal_node",
    "Heal network routes for a specific Z-Wave node",
    {
      node_id: z.coerce.number().int().positive().describe("Z-Wave node ID to heal"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/healNode/set`,
          `${ZWAVE_API_BASE}/healNode`,
          JSON.stringify({ args: [args.node_id] })
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Heal started for node ${args.node_id}.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "heal_network",
    "Heal the entire Z-Wave network (requires confirm: true). This can take a long time.",
    {
      confirm: z.boolean().describe("Must be true to start a network-wide heal"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Network heal is a long-running operation. Set confirm: true to proceed." }] };
      }
      try {
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/beginHealingNetwork/set`,
          `${ZWAVE_API_BASE}/beginHealingNetwork`,
          JSON.stringify({ args: [] })
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Z-Wave network heal started. This may take several minutes." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "refresh_node_values",
    "Refresh all values for a Z-Wave node by re-querying the device",
    {
      node_id: z.coerce.number().int().positive().describe("Z-Wave node ID to refresh"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/refreshNodeValues/set`,
          `${ZWAVE_API_BASE}/refreshNodeValues`,
          JSON.stringify({ args: [args.node_id] })
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Value refresh started for node ${args.node_id}.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "remove_failed_node",
    "Remove a failed/dead node from the Z-Wave network (requires confirm: true)",
    {
      node_id: z.coerce.number().int().positive().describe("Z-Wave node ID to remove"),
      confirm: z.boolean().describe("Must be true to remove the failed node"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Removing a failed node is destructive. Set confirm: true to proceed." }] };
      }
      try {
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/removeFailedNode/set`,
          `${ZWAVE_API_BASE}/removeFailedNode`,
          JSON.stringify({ args: [args.node_id] })
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Failed node ${args.node_id} removed.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
