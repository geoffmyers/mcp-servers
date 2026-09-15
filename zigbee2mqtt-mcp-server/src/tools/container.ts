import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerContainerTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "container_status",
    "Get the status of the Zigbee2MQTT Docker container",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["inspect", "zigbee2mqtt"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker inspect failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "container_logs",
    "View recent logs from the Zigbee2MQTT Docker container",
    {
      tail: z.coerce.number().int().positive().optional().default(100).describe("Number of lines from the end (default 100)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["logs", "--tail", String(args.tail), "zigbee2mqtt"], { maxBuffer: 512 * 1024 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker logs failed: ${result.stderr}` }] };
        }
        // Docker logs may go to stderr for some containers
        const rawOutput = result.stdout || result.stderr;
        // Enforce visual line limit — container log entries can be very large
        const lines = (rawOutput || "").split("\n");
        const output = lines.slice(-args.tail).join("\n");
        return { content: [{ type: "text", text: output || "No logs found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "container_restart",
    "Restart the Zigbee2MQTT Docker container (requires confirm: true)",
    {
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to restart the Zigbee2MQTT container." }] };
      }
      try {
        const result = await executeAuto(config, "docker", ["restart", "zigbee2mqtt"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker restart failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: "Zigbee2MQTT container restarted." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
