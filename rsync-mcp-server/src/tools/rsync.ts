import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execute, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const rsyncArgsSchema = {
  source: z.string().describe("Source path (local path or remote in user@host:path format)"),
  destination: z.string().describe("Destination path (local path or remote in user@host:path format)"),
  archive: z.boolean().optional().default(true).describe("Archive mode (-a): recursion, preserves symlinks, permissions, times, group, owner, device files, special files"),
  delete: z.boolean().optional().describe("Delete extraneous files from destination (--delete)"),
  exclude: z.array(z.string()).optional().describe("Patterns to exclude (e.g. ['node_modules', '.git'])"),
  include: z.array(z.string()).optional().describe("Patterns to include (e.g. ['*.ts', '*.json'])"),
  compress: z.boolean().optional().describe("Compress file data during transfer (-z)"),
  verbose: z.boolean().optional().default(true).describe("Increase verbosity (-v)"),
};

function buildRsyncArgs(args: {
  source: string;
  destination: string;
  archive: boolean;
  delete?: boolean;
  exclude?: string[];
  include?: string[];
  compress?: boolean;
  verbose: boolean;
}): string[] {
  const rsyncArgs: string[] = [];

  if (args.archive) rsyncArgs.push("-a");
  if (args.verbose) rsyncArgs.push("-v");
  if (args.compress) rsyncArgs.push("-z");
  if (args.delete) rsyncArgs.push("--delete");

  if (args.include) {
    for (const pattern of args.include) {
      rsyncArgs.push("--include", pattern);
    }
  }

  if (args.exclude) {
    for (const pattern of args.exclude) {
      rsyncArgs.push("--exclude", pattern);
    }
  }

  rsyncArgs.push(args.source, args.destination);

  return rsyncArgs;
}

function formatResult(stdout: string, stderr: string, exitCode: number, isDryRun: boolean): string {
  const parts: string[] = [];

  if (isDryRun) {
    parts.push("=== DRY RUN (no changes made) ===\n");
  }

  if (stdout.trim()) {
    parts.push(stdout.trim());
  }

  if (stderr.trim()) {
    parts.push(`\nStderr:\n${stderr.trim()}`);
  }

  parts.push(`\nExit code: ${exitCode}`);

  return parts.join("\n");
}

export function registerRsyncTools(server: McpServer): void {
  server.tool(
    "rsync_dry_run",
    "Preview an rsync transfer without making changes (always uses --dry-run)",
    rsyncArgsSchema,
    async (args): Promise<CallToolResult> => {
      try {
        const rsyncArgs = buildRsyncArgs(args);
        rsyncArgs.unshift("--dry-run");

        const result = await execute("rsync", rsyncArgs, { timeout: 60_000 });
        const output = formatResult(result.stdout, result.stderr, result.exitCode, true);

        return { content: [{ type: "text", text: output }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "rsync_execute",
    "Execute an rsync file transfer (requires explicit confirmation)",
    {
      ...rsyncArgsSchema,
      confirm: z.boolean().describe("Must be set to true to execute the transfer. Use rsync_dry_run first to preview changes."),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return { content: [{ type: "text", text: "Rsync aborted: confirm must be true." }] };
        }

        const rsyncArgs = buildRsyncArgs(args);

        const result = await execute("rsync", rsyncArgs, { timeout: 300_000 });
        const output = formatResult(result.stdout, result.stderr, result.exitCode, false);

        return { content: [{ type: "text", text: output }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
