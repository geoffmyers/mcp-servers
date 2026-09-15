import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerNetworkTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "arp_table",
    "View ARP table (arp -an)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "arp", ["-an"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `arp -an failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No ARP entries found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "routing_table",
    "View routing table (netstat -rn)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "netstat", ["-rn"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `netstat -rn failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
