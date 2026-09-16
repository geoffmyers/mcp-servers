import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerVolumeTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_volumes",
    "List Docker volumes",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["volume", "ls", "--format", "table {{.Name}}\t{{.Driver}}\t{{.Mountpoint}}"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker volume ls failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No volumes found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_volume",
    "Create a Docker volume",
    {
      name: z.string().describe("Volume name"),
      driver: z.string().optional().describe("Volume driver (default: local)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const dockerArgs = ["volume", "create"];
        if (args.driver) dockerArgs.push("--driver", args.driver);
        dockerArgs.push(args.name);

        const result = await executeAuto(config, "docker", dockerArgs);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker volume create failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Volume ${args.name} created.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "remove_volume",
    "Remove a Docker volume (requires confirm: true)",
    {
      name: z.string().describe("Volume name"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to remove this volume." }] };
      }
      try {
        const result = await executeAuto(config, "docker", ["volume", "rm", args.name]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker volume rm failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Volume ${args.name} removed.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "inspect_volume",
    "Get detailed information about a Docker volume",
    {
      name: z.string().describe("Volume name"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["volume", "inspect", args.name]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker volume inspect failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
