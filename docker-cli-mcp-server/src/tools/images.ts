import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerImageTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_images",
    "List Docker images",
    {
      format: z.string().optional().describe("Go template format string for output"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const dockerArgs = ["images", "--format", args.format || "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}\t{{.CreatedSince}}"];
        const result = await executeAuto(config, "docker", dockerArgs);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker images failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No images found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "pull_image",
    "Pull a Docker image from a registry",
    {
      image: z.string().describe("Image name with optional tag (e.g. 'nginx:latest')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["pull", args.image], { timeout: 300_000 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker pull failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Image ${args.image} pulled.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "remove_image",
    "Remove a Docker image (requires confirm: true)",
    {
      image: z.string().describe("Image name, ID, or tag"),
      force: z.boolean().optional().default(false).describe("Force remove the image"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to remove this image." }] };
      }
      try {
        const dockerArgs = ["rmi"];
        if (args.force) dockerArgs.push("-f");
        dockerArgs.push(args.image);

        const result = await executeAuto(config, "docker", dockerArgs);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker rmi failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Image ${args.image} removed.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "prune_images",
    "Remove unused Docker images (requires confirm: true)",
    {
      all: z.boolean().optional().default(false).describe("Remove all unused images, not just dangling ones"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to prune images." }] };
      }
      try {
        const dockerArgs = ["image", "prune", "-f"];
        if (args.all) dockerArgs.push("-a");

        const result = await executeAuto(config, "docker", dockerArgs);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker image prune failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Images pruned." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
