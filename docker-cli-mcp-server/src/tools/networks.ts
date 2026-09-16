import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerNetworkTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_networks",
    "List Docker networks",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["network", "ls", "--format", "table {{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker network ls failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No networks found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "inspect_network",
    "Get detailed information about a Docker network",
    {
      network: z.string().describe("Network name or ID"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["network", "inspect", args.network]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker network inspect failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_network",
    "Create a Docker network",
    {
      name: z.string().describe("Network name"),
      driver: z.string().optional().default("bridge").describe("Network driver (default: bridge)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["network", "create", "--driver", args.driver, args.name]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker network create failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Network ${args.name} created.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "remove_network",
    "Remove a Docker network (requires confirm: true)",
    {
      name: z.string().describe("Network name or ID"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to remove this network." }] };
      }
      try {
        const result = await executeAuto(config, "docker", ["network", "rm", args.name]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker network rm failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Network ${args.name} removed.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
