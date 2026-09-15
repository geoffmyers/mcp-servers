import { executeAuto, type ServerConfig, type ExecutorResult } from "@geoffmyers/mcp-server-shared";

export async function mongoQuery(
  config: ServerConfig,
  query: string,
  options?: { timeout?: number; maxBuffer?: number }
): Promise<ExecutorResult> {
  return executeAuto(
    config,
    "docker",
    ["exec", "unifi", "/usr/lib/unifi/data/mongosh", "--quiet", "--norc", "--port", "27117", "ace", "--eval", query],
    { timeout: options?.timeout ?? 30_000, maxBuffer: options?.maxBuffer }
  );
}
