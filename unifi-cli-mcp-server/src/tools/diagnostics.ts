import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerDiagnosticTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "controller_logs",
    "View recent UniFi controller container logs",
    {
      tail: z.coerce.number().int().positive().optional().default(100).describe("Number of lines from the end (default 100)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(
          config,
          "docker",
          ["logs", "--tail", String(args.tail), "unifi"],
          { maxBuffer: 512 * 1024 }
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker logs failed: ${result.stderr}` }] };
        }
        // Docker logs may go to stderr for some containers
        const output = result.stdout || result.stderr;
        return { content: [{ type: "text", text: output || "No logs found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "ping_device",
    "Ping a device from the host to check connectivity",
    {
      host: z.string().min(1).describe("Hostname or IP address to ping"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        // Validate host to prevent command injection - allow hostnames, IPs, and FQDNs
        if (!/^[a-zA-Z0-9._-]+$/.test(args.host)) {
          return { isError: true, content: [{ type: "text", text: "Invalid host format. Only alphanumeric characters, dots, hyphens, and underscores are allowed." }] };
        }

        const result = await executeAuto(
          config,
          "ping",
          ["-c", "4", args.host],
          { timeout: 30_000 }
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ping failed: ${result.stderr || result.stdout}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
