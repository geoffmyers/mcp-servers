import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerFirewallTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_firewall_rules",
    "List active pfSense firewall rules (pfctl -sr)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "pfctl", ["-sr"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `pfctl -sr failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No firewall rules found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "firewall_states",
    "View active firewall state table entries (pfctl -ss)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "pfctl", ["-ss"], { maxBuffer: 512 * 1024 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `pfctl -ss failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No firewall states found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "firewall_state_count",
    "View firewall state statistics and counters (pfctl -si)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "pfctl", ["-si"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `pfctl -si failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "list_firewall_aliases",
    "List firewall aliases from pfSense config",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const phpCode = `require_once('/etc/inc/config.inc'); $c = parse_config(true); echo json_encode($c['aliases']['alias'] ?? [], JSON_PRETTY_PRINT);`;
        const result = await executeAuto(config, "php", ["-r", phpCode]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `List firewall aliases failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No firewall aliases found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
