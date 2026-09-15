import { execFile, spawn } from "node:child_process";
import type { ExecutorResult, ExecutorOptions, ServerConfig } from "./types.js";

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_BUFFER = 100 * 1024; // 100KB

export function execute(
  command: string,
  args: string[],
  options?: ExecutorOptions
): Promise<ExecutorResult> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  const maxBuffer = options?.maxBuffer ?? DEFAULT_MAX_BUFFER;

  return new Promise((resolve) => {
    execFile(
      command,
      args,
      {
        timeout,
        maxBuffer,
        cwd: options?.cwd,
      },
      (error, stdout, stderr) => {
        const exitCode =
          error && "code" in error ? (error.code as number) ?? 1 : error ? 1 : 0;
        resolve({ stdout, stderr, exitCode });
      }
    );
  });
}

export function executeRemote(
  sshHost: string,
  command: string,
  args: string[],
  options?: ExecutorOptions
): Promise<ExecutorResult> {
  // Build the remote command as a single string for SSH.
  // Each arg is shell-escaped to prevent injection on the remote side.
  const remoteCommand = [command, ...args]
    .map((a) => `'${a.replace(/'/g, "'\\''")}'`)
    .join(" ");

  // Uses execFile("ssh", [...]) — not exec() — for safe argument passing.
  return execute("ssh", ["-o", "ConnectTimeout=10", sshHost, remoteCommand], options);
}

export function executeWithStdin(
  command: string,
  args: string[],
  stdin: string,
  options?: ExecutorOptions
): Promise<ExecutorResult> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  return new Promise((resolve) => {
    const child = spawn(command, args, { timeout, cwd: options?.cwd });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data: Buffer) => { stdout += data.toString(); });
    child.stderr.on("data", (data: Buffer) => { stderr += data.toString(); });
    child.on("close", (code) => { resolve({ stdout, stderr, exitCode: code ?? 0 }); });
    child.on("error", () => { resolve({ stdout, stderr, exitCode: 1 }); });
    child.stdin.write(stdin);
    child.stdin.end();
  });
}

export function executeAuto(
  config: ServerConfig,
  command: string,
  args: string[],
  options?: ExecutorOptions
): Promise<ExecutorResult> {
  if (config.executionMode === "ssh") {
    if (!config.sshHost) {
      return Promise.resolve({
        stdout: "",
        stderr: "SSH_HOST is required when EXECUTION_MODE=ssh",
        exitCode: 1,
      });
    }
    return executeRemote(config.sshHost, command, args, options);
  }
  return execute(command, args, options);
}

export function getServerConfig(): ServerConfig {
  const mode = process.env.EXECUTION_MODE || "local";
  if (mode !== "local" && mode !== "ssh") {
    throw new Error(`Invalid EXECUTION_MODE: ${mode}. Must be "local" or "ssh".`);
  }
  return {
    executionMode: mode,
    sshHost: process.env.SSH_HOST,
  };
}
