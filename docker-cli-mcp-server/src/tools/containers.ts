import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerContainerTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_containers",
    "List Docker containers (running by default, or all with include_stopped)",
    {
      include_stopped: z.boolean().optional().default(false).describe("Include stopped containers"),
      format: z.string().optional().describe("Go template format string for output"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const dockerArgs = ["ps", "--format", args.format || "table {{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"];
        if (args.include_stopped) dockerArgs.splice(1, 0, "-a");

        const result = await executeAuto(config, "docker", dockerArgs);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker ps failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No containers found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "inspect_container",
    "Get detailed information about a container",
    {
      container: z.string().describe("Container name or ID"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["inspect", args.container]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker inspect failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "container_logs",
    "View logs from a container",
    {
      container: z.string().describe("Container name or ID"),
      tail: z.coerce.number().int().positive().optional().default(100).describe("Number of lines from the end (default 100)"),
      since: z.string().optional().describe("Show logs since timestamp or relative (e.g. '5m', '1h', '2024-01-01')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const dockerArgs = ["logs", "--tail", String(args.tail)];
        if (args.since) dockerArgs.push("--since", args.since);
        dockerArgs.push(args.container);

        const result = await executeAuto(config, "docker", dockerArgs, { maxBuffer: 512 * 1024 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker logs failed: ${result.stderr}` }] };
        }
        // Docker logs go to stderr for some containers
        const output = result.stdout || result.stderr;
        return { content: [{ type: "text", text: output || "No logs found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "start_container",
    "Start a stopped container",
    { container: z.string().describe("Container name or ID") },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["start", args.container]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker start failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Container ${args.container} started.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "stop_container",
    "Stop a running container",
    { container: z.string().describe("Container name or ID") },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["stop", args.container]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker stop failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Container ${args.container} stopped.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "restart_container",
    "Restart a container",
    { container: z.string().describe("Container name or ID") },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["restart", args.container]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker restart failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Container ${args.container} restarted.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "remove_container",
    "Remove a container (requires confirm: true)",
    {
      container: z.string().describe("Container name or ID"),
      force: z.boolean().optional().default(false).describe("Force remove a running container"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to remove this container." }] };
      }
      try {
        const dockerArgs = ["rm"];
        if (args.force) dockerArgs.push("-f");
        dockerArgs.push(args.container);

        const result = await executeAuto(config, "docker", dockerArgs);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker rm failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Container ${args.container} removed.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "exec_container",
    "Execute a command in a running container",
    {
      container: z.string().describe("Container name or ID"),
      command: z.string().describe("Command to execute"),
      user: z.string().optional().describe("User to run as (e.g. root)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const dockerArgs = ["exec"];
        if (args.user) dockerArgs.push("-u", args.user);
        dockerArgs.push(args.container, "sh", "-c", args.command);

        const result = await executeAuto(config, "docker", dockerArgs);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker exec failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Command executed successfully." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "cp_container",
    "Copy files between container and host",
    {
      container: z.string().describe("Container name or ID"),
      src: z.string().describe("Source path"),
      dst: z.string().describe("Destination path"),
      from_container: z.boolean().optional().default(true).describe("If true, copy FROM container (container:src -> dst). If false, copy TO container (src -> container:dst)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const srcPath = args.from_container ? `${args.container}:${args.src}` : args.src;
        const dstPath = args.from_container ? args.dst : `${args.container}:${args.dst}`;

        const result = await executeAuto(config, "docker", ["cp", srcPath, dstPath]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker cp failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Copied ${srcPath} to ${dstPath}.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "container_stats",
    "Get resource usage stats for containers",
    {
      container: z.string().optional().describe("Container name or ID (omit for all)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const dockerArgs = ["stats", "--no-stream", "--format", "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}\t{{.PIDs}}"];
        if (args.container) dockerArgs.push(args.container);

        const result = await executeAuto(config, "docker", dockerArgs);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker stats failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No stats available." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "container_top",
    "List processes in a container",
    {
      container: z.string().describe("Container name or ID"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["top", args.container]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker top failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No processes found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "rename_container",
    "Rename a container",
    {
      container: z.string().describe("Container name or ID"),
      new_name: z.string().describe("New container name"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["rename", args.container, args.new_name]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker rename failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Container ${args.container} renamed to ${args.new_name}.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "pause_container",
    "Pause a container",
    {
      container: z.string().describe("Container name or ID"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["pause", args.container]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker pause failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Container ${args.container} paused.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "unpause_container",
    "Unpause a container",
    {
      container: z.string().describe("Container name or ID"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["unpause", args.container]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker unpause failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Container ${args.container} unpaused.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
