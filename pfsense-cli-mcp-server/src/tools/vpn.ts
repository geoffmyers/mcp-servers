import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerVpnTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "openvpn_status",
    "View OpenVPN server and client connection status",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const phpCode = `require_once('config.inc'); require_once('openvpn.inc'); require_once('service-utils.inc'); $servers = openvpn_get_active_servers(); $clients = openvpn_get_active_clients(); echo "=== OpenVPN Servers ===\\n"; if (empty($servers)) { echo "No active servers\\n"; } else { foreach($servers as $s) { echo $s['name'] . ' (vpnid=' . $s['vpnid'] . ', port=' . $s['port'] . ', mode=' . $s['mode'] . ')'; echo ' conns=' . count($s['conns']) . "\\n"; if (!empty($s['conns'])) { foreach($s['conns'] as $c) { echo '  ' . ($c['common_name'] ?? 'unknown') . ' ' . ($c['remote_host'] ?? '') . "\\n"; } } } } echo "\\n=== OpenVPN Clients ===\\n"; if (empty($clients)) { echo "No active clients\\n"; } else { foreach($clients as $c) { echo $c['name'] . ' status=' . $c['status'] . "\\n"; } }`;
        const result = await executeAuto(config, "php", ["-r", phpCode]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `OpenVPN status failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No OpenVPN status available." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "ipsec_status",
    "View IPsec tunnel status",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ipsec", ["statusall"]);
        // Exit code 3 means no tunnels configured — not an error
        if (result.exitCode !== 0 && result.exitCode !== 3) {
          return { isError: true, content: [{ type: "text", text: `IPsec status failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No IPsec tunnels configured." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "wireguard_status",
    "View WireGuard tunnel status",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "wg", ["show"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `WireGuard status failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No WireGuard tunnels configured." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
