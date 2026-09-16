import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerComposeTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "compose_up",
    "Deploy a Docker Compose stack (docker compose up -d)",
    {
      project_dir: z.string().describe("Absolute path to the directory containing docker-compose.yml"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(
          config,
          "docker",
          ["compose", "--project-directory", args.project_dir, "-f", `${args.project_dir}/docker-compose.yml`, "up", "-d"],
          { timeout: 300_000 }
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker compose up failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || result.stderr || "Stack deployed." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "compose_down",
    "Tear down a Docker Compose stack (requires confirm: true)",
    {
      project_dir: z.string().describe("Absolute path to the directory containing docker-compose.yml"),
      volumes: z.boolean().optional().default(false).describe("Also remove volumes"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to tear down this stack." }] };
      }
      try {
        const composeArgs = ["compose", "--project-directory", args.project_dir, "-f", `${args.project_dir}/docker-compose.yml`, "down"];
        if (args.volumes) composeArgs.push("-v");

        const result = await executeAuto(config, "docker", composeArgs, { timeout: 120_000 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker compose down failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || result.stderr || "Stack torn down." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "compose_status",
    "View status of a Docker Compose stack",
    {
      project_dir: z.string().describe("Absolute path to the directory containing docker-compose.yml"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(
          config,
          "docker",
          ["compose", "--project-directory", args.project_dir, "-f", `${args.project_dir}/docker-compose.yml`, "ps"]
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker compose ps failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No services found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "compose_logs",
    "View logs from a Docker Compose stack",
    {
      project_dir: z.string().describe("Absolute path to the directory containing docker-compose.yml"),
      service: z.string().optional().describe("Specific service name (omit for all services)"),
      tail: z.coerce.number().int().positive().optional().default(100).describe("Number of lines from the end (default 100)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const composeArgs = ["compose", "--project-directory", args.project_dir, "-f", `${args.project_dir}/docker-compose.yml`, "logs", "--tail", String(args.tail)];
        if (args.service) composeArgs.push(args.service);

        const result = await executeAuto(config, "docker", composeArgs, { maxBuffer: 512 * 1024 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker compose logs failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No logs found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "compose_pull",
    "Pull latest images for a Docker Compose stack",
    {
      project_dir: z.string().describe("Absolute path to the directory containing docker-compose.yml"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(
          config,
          "docker",
          ["compose", "--project-directory", args.project_dir, "-f", `${args.project_dir}/docker-compose.yml`, "pull"],
          { timeout: 300_000 }
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker compose pull failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || result.stderr || "Images pulled." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "compose_exec",
    "Execute a command in a running Compose service container",
    {
      project_dir: z.string().describe("Absolute path to the directory containing docker-compose.yml"),
      service: z.string().describe("Service name"),
      command: z.string().describe("Command to execute"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(
          config,
          "docker",
          ["compose", "--project-directory", args.project_dir, "-f", `${args.project_dir}/docker-compose.yml`, "exec", "-T", args.service, "sh", "-c", args.command]
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker compose exec failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Command executed successfully." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "compose_restart",
    "Restart Compose services (requires confirm: true)",
    {
      project_dir: z.string().describe("Absolute path to the directory containing docker-compose.yml"),
      service: z.string().optional().describe("Specific service (omit for all)"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to restart this stack." }] };
      }
      try {
        const composeArgs = ["compose", "--project-directory", args.project_dir, "-f", `${args.project_dir}/docker-compose.yml`, "restart"];
        if (args.service) composeArgs.push(args.service);

        const result = await executeAuto(config, "docker", composeArgs, { timeout: 120_000 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker compose restart failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || result.stderr || "Services restarted." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
