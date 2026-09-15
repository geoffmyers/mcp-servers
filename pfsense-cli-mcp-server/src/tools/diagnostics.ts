import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerDiagnosticTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "ping",
    "Ping a host from pfSense",
    {
      host: z.string().describe("Hostname or IP address to ping"),
      count: z.coerce.number().int().positive().optional().default(4).describe("Number of ping packets (default 4)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ping", ["-c", String(args.count), args.host], { timeout: 30000 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ping failed: ${result.stdout || result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "traceroute",
    "Traceroute to a host from pfSense",
    {
      host: z.string().describe("Hostname or IP address to trace"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "traceroute", [args.host], { timeout: 60000 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `traceroute failed: ${result.stdout || result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "list_packages",
    "List installed packages on pfSense (pkg info)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "pkg", ["info"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `pkg info failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No packages installed." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "backup_config",
    "Read the pfSense configuration XML backup (/cf/conf/config.xml)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "cat", ["/cf/conf/config.xml"], { maxBuffer: 1024 * 1024 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `Read config.xml failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "dns_lookup",
    "Perform DNS lookup from pfSense",
    {
      hostname: z.string().describe("Hostname to look up"),
      server: z.string().optional().describe("DNS server to query"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const cmdArgs = [args.hostname, ...(args.server ? [args.server] : [])];
        const result = await executeAuto(config, "host", cmdArgs, { timeout: 15000 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `DNS lookup failed: ${result.stdout || result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
