import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerServiceTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_services",
    "List all services with their status",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "service.query"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call service.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "start_service",
    "Start a service",
    {
      service: z.string().describe("Service name (e.g. 'cifs', 'nfs', 'ssh', 'smartd')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "service.start", args.service]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call service.start failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Service ${args.service} started.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "stop_service",
    "Stop a service",
    {
      service: z.string().describe("Service name (e.g. 'cifs', 'nfs', 'ssh', 'smartd')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "service.stop", args.service]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call service.stop failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Service ${args.service} stopped.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "restart_service",
    "Restart a service",
    {
      service: z.string().describe("Service name (e.g. 'cifs', 'nfs', 'ssh', 'smartd')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "service.restart", args.service]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call service.restart failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Service ${args.service} restarted.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
