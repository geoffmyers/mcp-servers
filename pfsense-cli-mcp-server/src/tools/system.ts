import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerSystemTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "system_info",
    "Get pfSense system information (hostname, kernel, uptime)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const hostname = await executeAuto(config, "hostname", []);
        const uname = await executeAuto(config, "uname", ["-a"]);
        const uptime = await executeAuto(config, "uptime", []);
        const output = `Hostname: ${hostname.stdout.trim()}\n${uname.stdout.trim()}\n${uptime.stdout.trim()}`;
        return { content: [{ type: "text", text: output }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "system_reboot",
    "Reboot the pfSense system (requires confirm: true)",
    {
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to reboot pfSense." }] };
      }
      try {
        const result = await executeAuto(config, "shutdown", ["-r", "now"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `Reboot failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: "pfSense reboot initiated." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
