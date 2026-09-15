import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerNetworkTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "network_info",
    "Get Home Assistant network configuration",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["network", "info", "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha network info failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
