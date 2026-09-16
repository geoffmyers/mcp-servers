import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execute, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export function registerFindTools(server: McpServer): void {
  server.tool(
    "find_files",
    "Find files and directories matching criteria (name, type, size, modification time)",
    {
      path: z.string().describe("Starting directory path"),
      name: z.string().optional().describe("File name pattern (glob, e.g. '*.ts')"),
      type: z.enum(["f", "d", "l"]).optional().describe("File type: f=file, d=directory, l=symlink"),
      maxdepth: z.coerce.number().int().positive().optional().describe("Maximum directory depth"),
      mindepth: z.coerce.number().int().nonnegative().optional().describe("Minimum directory depth"),
      size: z.string().optional().describe("File size filter (e.g. '+1M', '-100k', '50c')"),
      mtime: z.string().optional().describe("Modification time filter (e.g. '-7' for last 7 days, '+30' for older than 30 days)"),
      empty: z.boolean().optional().describe("Find empty files or directories"),
      limit: z.coerce.number().int().positive().optional().default(100).describe("Maximum results (default 100)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const findArgs: string[] = [args.path];
        if (args.maxdepth !== undefined) findArgs.push("-maxdepth", String(args.maxdepth));
        if (args.mindepth !== undefined) findArgs.push("-mindepth", String(args.mindepth));
        if (args.type) findArgs.push("-type", args.type);
        if (args.name) findArgs.push("-name", args.name);
        if (args.size) findArgs.push("-size", args.size);
        if (args.mtime) findArgs.push("-mtime", args.mtime);
        if (args.empty) findArgs.push("-empty");
        findArgs.push("-print");

        const result = await execute("find", findArgs);
        const lines = result.stdout.trim().split("\n").filter(Boolean);
        const limited = lines.slice(0, args.limit);
        const output = limited.join("\n") + (lines.length > args.limit! ? `\n\n... (${lines.length - args.limit!} more results truncated)` : "");

        return { content: [{ type: "text", text: output || "No files found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "find_by_content",
    "Find files containing text (combines find with grep)",
    {
      path: z.string().describe("Starting directory path"),
      pattern: z.string().describe("Text pattern to search for (basic regex)"),
      name: z.string().optional().describe("File name pattern to filter (glob, e.g. '*.ts')"),
      type: z.enum(["f", "d", "l"]).optional().default("f").describe("File type (default: f)"),
      maxdepth: z.coerce.number().int().positive().optional().describe("Maximum directory depth"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        // Build find args to list files, then grep through them
        const findArgs: string[] = [args.path];
        if (args.maxdepth !== undefined) findArgs.push("-maxdepth", String(args.maxdepth));
        if (args.type) findArgs.push("-type", args.type);
        if (args.name) findArgs.push("-name", args.name);
        findArgs.push("-print0");

        const findResult = await execute("find", findArgs);
        if (!findResult.stdout.trim()) {
          return { content: [{ type: "text", text: "No files found matching criteria." }] };
        }

        // Use xargs + grep to search within found files
        const grepArgs = ["-0", "-l", "grep", "-l", args.pattern];
        const grepResult = await execute("xargs", grepArgs, { timeout: 60_000 });

        // Feed find output to xargs via a temp approach - actually, just use grep -rl directly
        const grepDirectArgs = ["-rl", args.pattern, args.path];
        if (args.name) {
          grepDirectArgs.push("--include", args.name);
        }
        const result = await execute("grep", grepDirectArgs, { timeout: 60_000 });

        const lines = result.stdout.trim().split("\n").filter(Boolean);
        const output = lines.slice(0, 100).join("\n") + (lines.length > 100 ? `\n\n... (${lines.length - 100} more results truncated)` : "");

        return { content: [{ type: "text", text: output || "No files contain the specified pattern." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "find_duplicates",
    "Find potential duplicate files by size in a directory",
    {
      path: z.string().describe("Starting directory path"),
      minsize: z.string().optional().default("+1c").describe("Minimum file size (default: +1c, non-empty)"),
      maxdepth: z.coerce.number().int().positive().optional().describe("Maximum directory depth"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const findArgs: string[] = [args.path];
        if (args.maxdepth !== undefined) findArgs.push("-maxdepth", String(args.maxdepth));
        findArgs.push("-type", "f", "-size", args.minsize, "-printf", "%s %p\\n");

        const result = await execute("find", findArgs);
        if (!result.stdout.trim()) {
          return { content: [{ type: "text", text: "No files found." }] };
        }

        // Group files by size
        const sizeMap = new Map<string, string[]>();
        for (const line of result.stdout.trim().split("\n").filter(Boolean)) {
          const spaceIdx = line.indexOf(" ");
          const size = line.substring(0, spaceIdx);
          const path = line.substring(spaceIdx + 1);
          if (!sizeMap.has(size)) sizeMap.set(size, []);
          sizeMap.get(size)!.push(path);
        }

        // Filter to only sizes with multiple files
        const duplicates: string[] = [];
        for (const [size, files] of sizeMap) {
          if (files.length > 1) {
            duplicates.push(`Size ${size} bytes (${files.length} files):`);
            for (const f of files) duplicates.push(`  ${f}`);
            duplicates.push("");
          }
        }

        return { content: [{ type: "text", text: duplicates.length ? duplicates.join("\n") : "No potential duplicates found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
