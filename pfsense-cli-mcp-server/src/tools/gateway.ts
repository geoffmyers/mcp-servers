import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerGatewayTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "gateway_status",
    "View gateway status (uses pfSsh.php playback gatewaystatus, falls back to /tmp/gateway_status)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "pfSsh.php", ["playback", "gatewaystatus"]);
        if (result.exitCode === 0 && result.stdout.trim()) {
          return { content: [{ type: "text", text: result.stdout }] };
        }
        // Fallback: read gateway status file
        const fallback = await executeAuto(config, "cat", ["/tmp/gateway_status"]);
        if (fallback.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `Gateway status unavailable: ${fallback.stderr}` }] };
        }
        return { content: [{ type: "text", text: fallback.stdout || "No gateway status data." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
