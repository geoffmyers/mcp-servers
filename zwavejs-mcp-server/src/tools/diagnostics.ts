import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { getMqttConfig, mqttRequestResponse } from "../lib/mqtt.js";

const ZWAVE_API_BASE = "zwave/_CLIENTS/ZWAVE_GATEWAY-zwave-js-ui/api";

export function registerDiagnosticTools(server: McpServer): void {
  const mqtt = getMqttConfig();

  server.tool(
    "driver_status",
    "Get Z-Wave driver status and information (library version, home ID, etc.)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/getInfo/set`,
          `${ZWAVE_API_BASE}/getInfo`,
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
    "controller_info",
    "Get Z-Wave controller information (type, firmware, features)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mqttRequestResponse(
          mqtt,
          `${ZWAVE_API_BASE}/getInfo/set`,
          `${ZWAVE_API_BASE}/getInfo`,
          JSON.stringify({ args: [] })
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MQTT request failed: ${result.stderr}` }] };
        }

        try {
          const response = JSON.parse(result.stdout);
          const info = response.result || response;
          // Extract controller-specific fields if available
          const controllerInfo = info.controller || info;
          return { content: [{ type: "text", text: JSON.stringify(controllerInfo, null, 2) }] };
        } catch {
          return { content: [{ type: "text", text: result.stdout }] };
        }
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
