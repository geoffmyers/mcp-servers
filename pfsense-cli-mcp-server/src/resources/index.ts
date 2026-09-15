import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { executeAuto, getServerConfig } from "@geoffmyers/mcp-server-shared";

export function registerResources(server: McpServer): void {
  const config = getServerConfig();

  server.resource(
    "system-info",
    "pfsense-cli://system/info",
    { description: "pfSense system information (hostname, kernel, uptime)" },
    async () => {
      const hostname = await executeAuto(config, "hostname", []);
      const uname = await executeAuto(config, "uname", ["-a"]);
      const uptime = await executeAuto(config, "uptime", []);
      const text = `Hostname: ${hostname.stdout.trim()}\n${uname.stdout.trim()}\n${uptime.stdout.trim()}`;
      return {
        contents: [
          {
            uri: "pfsense-cli://system/info",
            mimeType: "text/plain",
            text,
          },
        ],
      };
    }
  );

  server.resource(
    "interfaces",
    "pfsense-cli://interfaces",
    { description: "pfSense network interfaces" },
    async () => {
      const result = await executeAuto(config, "ifconfig", ["-a"], { maxBuffer: 256 * 1024 });
      return {
        contents: [
          {
            uri: "pfsense-cli://interfaces",
            mimeType: "text/plain",
            text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
          },
        ],
      };
    }
  );

  server.resource(
    "gateways",
    "pfsense-cli://gateways",
    { description: "pfSense gateway status" },
    async () => {
      const result = await executeAuto(config, "pfSsh.php", ["playback", "gatewaystatus"]);
      let text: string;
      if (result.exitCode === 0 && result.stdout.trim()) {
        text = result.stdout;
      } else {
        const fallback = await executeAuto(config, "cat", ["/tmp/gateway_status"]);
        text = fallback.exitCode === 0 ? fallback.stdout : `Error: ${fallback.stderr}`;
      }
      return {
        contents: [
          {
            uri: "pfsense-cli://gateways",
            mimeType: "text/plain",
            text,
          },
        ],
      };
    }
  );
}
