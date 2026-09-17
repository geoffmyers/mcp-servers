import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execute, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

/**
 * Splits a sed substitution pattern (e.g. "s/old/new/" or "s|old|new|gI")
 * into its delimiter, regex, replacement and trailing-flags parts, respecting
 * backslash-escaped delimiters. Returns null if `pattern` is not recognisable
 * as `s<delim>regex<delim>replacement<delim>[flags]` — the only shape this
 * module knows how to append flags to.
 */
export function parseSedSubstitution(
  pattern: string
): { delimiter: string; regex: string; replacement: string; flags: string } | null {
  if (pattern.length < 2 || pattern[0] !== "s") return null;
  const delimiter = pattern[1];
  if (delimiter === "\\" || /\s/.test(delimiter)) return null;

  const segments: string[] = [];
  let current = "";
  for (let i = 2; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === "\\" && i + 1 < pattern.length) {
      // Keep escaped characters (including an escaped delimiter) intact.
      current += ch + pattern[i + 1];
      i++;
      continue;
    }
    if (ch === delimiter) {
      segments.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (segments.length !== 2) return null;
  return { delimiter, regex: segments[0], replacement: segments[1], flags: current };
}

/**
 * Appends `flagsToAdd` (e.g. ["g", "I"]) to a sed substitution pattern,
 * merging with any flags already present and respecting whatever delimiter
 * the pattern uses (not just `/`). Returns an explicit error instead of
 * silently dropping the flags when the pattern cannot be parsed as
 * `s<delim>regex<delim>replacement<delim>[flags]`.
 */
export function appendSedFlags(
  pattern: string,
  flagsToAdd: string[]
): { pattern: string } | { error: string } {
  if (flagsToAdd.length === 0) return { pattern };

  const parsed = parseSedSubstitution(pattern);
  if (!parsed) {
    return {
      error:
        `Cannot apply the requested flag(s) (${flagsToAdd.join(", ")}): "${pattern}" is not ` +
        `a recognised s<delimiter>regex<delimiter>replacement<delimiter>[flags] substitution. ` +
        `Include the flags directly in the pattern instead (e.g. "s/old/new/gI"), or use a ` +
        `plain "s<delim>...<delim>...<delim>" pattern so they can be appended safely.`,
    };
  }

  const merged = parsed.flags.split("");
  for (const flag of flagsToAdd) {
    if (!merged.includes(flag)) merged.push(flag);
  }
  const { delimiter, regex, replacement } = parsed;
  return { pattern: `s${delimiter}${regex}${delimiter}${replacement}${delimiter}${merged.join("")}` };
}

let gnuSedCache: boolean | undefined;

/**
 * Detects whether the local `sed` binary is GNU sed (which answers
 * `sed --version` with a zero exit and "GNU sed" on stdout) or BSD/macOS sed
 * (which rejects `--version` as an unknown option). Cached after the first
 * call since the binary does not change mid-process.
 */
export async function isGnuSed(): Promise<boolean> {
  if (gnuSedCache !== undefined) return gnuSedCache;
  try {
    const result = await execute("sed", ["--version"]);
    gnuSedCache = result.exitCode === 0 && /GNU sed/i.test(result.stdout);
  } catch {
    gnuSedCache = false;
  }
  return gnuSedCache;
}

/** Test-only: reset the cached GNU/BSD sed detection between test cases. */
export function _resetGnuSedCacheForTests(): void {
  gnuSedCache = undefined;
}

/**
 * Builds the `-i` (in-place edit) argument(s) for the detected sed flavor.
 *
 * A non-empty suffix is always attached directly to `-i` in one argument
 * (`-i.bak`) — both GNU and BSD/macOS sed accept this form.
 *
 * An empty suffix (no backup) differs between the two: GNU sed takes a bare
 * `-i` with nothing after it. BSD/macOS sed requires the empty suffix as its
 * own argument (`-i` then `''`); a bare `-i` on BSD/macOS consumes the next
 * argument (the sed script) as if it were the suffix, which silently
 * corrupts the command.
 */
export function buildInPlaceArgs(suffix: string, gnu: boolean): string[] {
  if (suffix === "") {
    return gnu ? ["-i"] : ["-i", ""];
  }
  return [`-i${suffix}`];
}

export function registerSedTools(server: McpServer): void {
  server.tool(
    "sed_preview",
    "Preview a sed substitution without modifying the file (dry run)",
    {
      pattern: z.string().describe("Sed substitution pattern (e.g. 's/old/new/')"),
      file: z.string().describe("Path to the file to process"),
      global: z.boolean().optional().default(false).describe("Apply substitution globally on each line (appends 'g' flag)"),
      extended_regex: z.boolean().optional().default(false).describe("Use extended regular expressions (-E flag)"),
      case_insensitive: z.boolean().optional().default(false).describe("Case-insensitive matching (appends 'I' flag)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const flags: string[] = [];
        if (args.global) flags.push("g");
        if (args.case_insensitive) flags.push("I");

        const appended = appendSedFlags(args.pattern, flags);
        if ("error" in appended) {
          return { isError: true, content: [{ type: "text", text: appended.error }] };
        }

        const sedArgs: string[] = [];
        if (args.extended_regex) sedArgs.push("-E");
        sedArgs.push(appended.pattern, args.file);

        const result = await execute("sed", sedArgs);

        if (result.exitCode !== 0 && result.stderr) {
          return { isError: true, content: [{ type: "text", text: `sed error: ${result.stderr}` }] };
        }

        return { content: [{ type: "text", text: result.stdout || "(no output)" }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "sed_replace",
    "Perform an in-place sed substitution on a file (creates backup)",
    {
      pattern: z.string().describe("Sed substitution pattern (e.g. 's/old/new/')"),
      file: z.string().describe("Path to the file to modify"),
      global: z.boolean().optional().default(false).describe("Apply substitution globally on each line (appends 'g' flag)"),
      extended_regex: z.boolean().optional().default(false).describe("Use extended regular expressions (-E flag)"),
      case_insensitive: z.boolean().optional().default(false).describe("Case-insensitive matching (appends 'I' flag)"),
      confirm: z.boolean().describe("Must be true to proceed with in-place replacement"),
      backup_suffix: z.string().optional().default(".bak").describe("Backup file suffix (default: '.bak'; pass '' for no backup)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return { content: [{ type: "text", text: "Replace aborted: confirm must be true." }] };
        }

        const flags: string[] = [];
        if (args.global) flags.push("g");
        if (args.case_insensitive) flags.push("I");

        const appended = appendSedFlags(args.pattern, flags);
        if ("error" in appended) {
          return { isError: true, content: [{ type: "text", text: appended.error }] };
        }

        const gnu = await isGnuSed();
        const inPlaceArgs = buildInPlaceArgs(args.backup_suffix, gnu);

        const sedArgs: string[] = [];
        if (args.extended_regex) sedArgs.push("-E");
        sedArgs.push(...inPlaceArgs, appended.pattern, args.file);

        const result = await execute("sed", sedArgs);

        if (result.exitCode !== 0 && result.stderr) {
          return { isError: true, content: [{ type: "text", text: `sed error: ${result.stderr}` }] };
        }

        const backupNote = args.backup_suffix
          ? `Backup saved as ${args.file}${args.backup_suffix}`
          : "No backup created (empty backup_suffix)";
        return {
          content: [{ type: "text", text: `File modified in-place. ${backupNote}` }],
        };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "sed_extract",
    "Extract lines from a file using sed -n (e.g. print specific line ranges or pattern matches)",
    {
      expression: z.string().describe("Sed expression for extraction (e.g. '5,10p' for lines 5-10, '/pattern/p' for matching lines)"),
      file: z.string().describe("Path to the file to process"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const sedArgs: string[] = ["-n", args.expression, args.file];

        const result = await execute("sed", sedArgs);

        if (result.exitCode !== 0 && result.stderr) {
          return { isError: true, content: [{ type: "text", text: `sed error: ${result.stderr}` }] };
        }

        return { content: [{ type: "text", text: result.stdout || "(no matching lines)" }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
