import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttRequestResponse } from "../lib/mqtt.js";

const ZWAVE_API_BASE = "zwave/_CLIENTS/ZWAVE_GATEWAY-zwave-js-ui/api";

export function registerInclusionTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "begin_inclusion",
    "Start including (adding) a new Z-Wave device to the network (requires confirm: true). Strategy 0 = no security, 2 = S2 security.",
    {
      secure: z.boolean().optional().default(true).describe("Use S2 security if available"),
      confirm: z.boolean().describe("Must be true to start inclusion"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Inclusion modifies the network. Set confirm: true to proceed." }] };
      }
      try {
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/startInclusion/set`,
          `${ZWAVE_API_BASE}/startInclusion`,
          JSON.stringify({ args: [{ strategy: args.secure ? 2 : 0 }] }),
          60
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Inclusion started. Put your device in pairing mode now." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "stop_inclusion",
    "Stop the Z-Wave inclusion process",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/stopInclusion/set`,
          `${ZWAVE_API_BASE}/stopInclusion`,
          JSON.stringify({ args: [] })
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Inclusion stopped." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "begin_exclusion",
    "Start excluding (removing) a Z-Wave device from the network (requires confirm: true)",
    {
      confirm: z.boolean().describe("Must be true to start exclusion"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Exclusion modifies the network. Set confirm: true to proceed." }] };
      }
      try {
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/startExclusion/set`,
          `${ZWAVE_API_BASE}/startExclusion`,
          JSON.stringify({ args: [] }),
          60
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Exclusion started. Activate the device you want to remove." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "stop_exclusion",
    "Stop the Z-Wave exclusion process",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/stopExclusion/set`,
          `${ZWAVE_API_BASE}/stopExclusion`,
          JSON.stringify({ args: [] })
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Exclusion stopped." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
