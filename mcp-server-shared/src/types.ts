export interface ExecutorResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ExecutorOptions {
  timeout?: number;
  cwd?: string;
  maxBuffer?: number;
}

export interface ServerConfig {
  executionMode: "local" | "ssh";
  sshHost?: string;
}

export interface ToolRegistrar {
  (server: import("@modelcontextprotocol/sdk/server/mcp.js").McpServer): void;
}
