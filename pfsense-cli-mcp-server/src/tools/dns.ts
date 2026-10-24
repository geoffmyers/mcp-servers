import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerDnsTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_dns_host_overrides",
    "List DNS Resolver (Unbound) host overrides from pfSense config",
    {},
    async (): Promise<CallToolResult> => {
      try {
        // pfSense 2.9 removed parse_config(); config_get_path() is its replacement (2026-10-20).
        const phpCode = `require_once('/etc/inc/config.inc'); echo json_encode(config_get_path('unbound/hosts', []), JSON_PRETTY_PRINT);`;
        const result = await executeAuto(config, "php", ["-r", phpCode]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `List DNS host overrides failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No DNS host overrides found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "list_dns_domain_overrides",
    "List DNS Resolver (Unbound) domain overrides from pfSense config",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const phpCode = `require_once('/etc/inc/config.inc'); echo json_encode(config_get_path('unbound/domainoverrides', []), JSON_PRETTY_PRINT);`;
        const result = await executeAuto(config, "php", ["-r", phpCode]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `List DNS domain overrides failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No DNS domain overrides found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
