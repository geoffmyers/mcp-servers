import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execute, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export function registerGrepTools(server: McpServer): void {
  server.tool(
    "grep_search",
    "Search file contents for lines matching a pattern (regex or fixed string)",
    {
      pattern: z.string().describe("Search pattern (basic regex by default)"),
      path: z.string().describe("File or directory path to search"),
      recursive: z.boolean().optional().default(true).describe("Search directories recursively (default true)"),
      ignore_case: z.boolean().optional().describe("Case-insensitive matching"),
      word_regexp: z.boolean().optional().describe("Match whole words only"),
      fixed_strings: z.boolean().optional().describe("Treat pattern as literal string, not regex"),
      include: z.string().optional().describe("Only search files matching glob (e.g. '*.ts')"),
      exclude: z.string().optional().describe("Skip files matching glob (e.g. '*.min.js')"),
      max_count: z.number().int().positive().optional().describe("Max matches per file"),
      context_lines: z.number().int().nonnegative().optional().describe("Lines of context around each match"),
      limit: z.number().int().positive().optional().default(100).describe("Maximum result lines (default 100)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const grepArgs: string[] = ["-n"]; // always show line numbers
        if (args.recursive) grepArgs.push("-r");
        if (args.ignore_case) grepArgs.push("-i");
        if (args.word_regexp) grepArgs.push("-w");
        if (args.fixed_strings) grepArgs.push("-F");
        if (args.include) grepArgs.push("--include", args.include);
        if (args.exclude) grepArgs.push("--exclude", args.exclude);
        if (args.max_count !== undefined) grepArgs.push("-m", String(args.max_count));
        if (args.context_lines !== undefined) grepArgs.push("-C", String(args.context_lines));
        grepArgs.push("--", args.pattern, args.path);

        const result = await execute("grep", grepArgs, { timeout: 60_000 });

        if (result.exitCode === 1 && !result.stdout.trim()) {
          return { content: [{ type: "text", text: "No matches found." }] };
        }
        if (result.exitCode > 1) {
          return { isError: true, content: [{ type: "text", text: `grep error: ${result.stderr || "unknown error"}` }] };
        }

        const lines = result.stdout.trimEnd().split("\n");
        const limited = lines.slice(0, args.limit);
        const output = limited.join("\n") + (lines.length > args.limit! ? `\n\n... (${lines.length - args.limit!} more lines truncated)` : "");

        return { content: [{ type: "text", text: output }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "grep_count",
    "Count the number of matching lines per file",
    {
      pattern: z.string().describe("Search pattern (basic regex by default)"),
      path: z.string().describe("File or directory path to search"),
      recursive: z.boolean().optional().default(true).describe("Search directories recursively (default true)"),
      ignore_case: z.boolean().optional().describe("Case-insensitive matching"),
      word_regexp: z.boolean().optional().describe("Match whole words only"),
      fixed_strings: z.boolean().optional().describe("Treat pattern as literal string, not regex"),
      include: z.string().optional().describe("Only search files matching glob (e.g. '*.ts')"),
      exclude: z.string().optional().describe("Skip files matching glob (e.g. '*.min.js')"),
      limit: z.number().int().positive().optional().default(100).describe("Maximum result lines (default 100)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const grepArgs: string[] = ["-c"];
        if (args.recursive) grepArgs.push("-r");
        if (args.ignore_case) grepArgs.push("-i");
        if (args.word_regexp) grepArgs.push("-w");
        if (args.fixed_strings) grepArgs.push("-F");
        if (args.include) grepArgs.push("--include", args.include);
        if (args.exclude) grepArgs.push("--exclude", args.exclude);
        grepArgs.push("--", args.pattern, args.path);

        const result = await execute("grep", grepArgs, { timeout: 60_000 });

        if (result.exitCode > 1) {
          return { isError: true, content: [{ type: "text", text: `grep error: ${result.stderr || "unknown error"}` }] };
        }

        // Filter out files with 0 matches for cleaner output
        const lines = result.stdout.trimEnd().split("\n").filter((line) => {
          const match = line.match(/:(\d+)$/);
          return match && match[1] !== "0";
        });

        if (lines.length === 0) {
          return { content: [{ type: "text", text: "No matches found." }] };
        }

        const limited = lines.slice(0, args.limit);
        const output = limited.join("\n") + (lines.length > args.limit! ? `\n\n... (${lines.length - args.limit!} more lines truncated)` : "");

        return { content: [{ type: "text", text: output }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "grep_files_matching",
    "List file paths that contain at least one match for the pattern",
    {
      pattern: z.string().describe("Search pattern (basic regex by default)"),
      path: z.string().describe("File or directory path to search"),
      recursive: z.boolean().optional().default(true).describe("Search directories recursively (default true)"),
      ignore_case: z.boolean().optional().describe("Case-insensitive matching"),
      word_regexp: z.boolean().optional().describe("Match whole words only"),
      fixed_strings: z.boolean().optional().describe("Treat pattern as literal string, not regex"),
      include: z.string().optional().describe("Only search files matching glob (e.g. '*.ts')"),
      exclude: z.string().optional().describe("Skip files matching glob (e.g. '*.min.js')"),
      limit: z.number().int().positive().optional().default(100).describe("Maximum result lines (default 100)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const grepArgs: string[] = ["-l"];
        if (args.recursive) grepArgs.push("-r");
        if (args.ignore_case) grepArgs.push("-i");
        if (args.word_regexp) grepArgs.push("-w");
        if (args.fixed_strings) grepArgs.push("-F");
        if (args.include) grepArgs.push("--include", args.include);
        if (args.exclude) grepArgs.push("--exclude", args.exclude);
        grepArgs.push("--", args.pattern, args.path);

        const result = await execute("grep", grepArgs, { timeout: 60_000 });

        if (result.exitCode === 1 && !result.stdout.trim()) {
          return { content: [{ type: "text", text: "No matching files found." }] };
        }
        if (result.exitCode > 1) {
          return { isError: true, content: [{ type: "text", text: `grep error: ${result.stderr || "unknown error"}` }] };
        }

        const lines = result.stdout.trim().split("\n").filter(Boolean);
        const limited = lines.slice(0, args.limit);
        const output = limited.join("\n") + (lines.length > args.limit! ? `\n\n... (${lines.length - args.limit!} more files truncated)` : "");

        return { content: [{ type: "text", text: output }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
