import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export type ServerFactoryResponse = {
  server: McpServer;
  cleanup: (sessionId?: string) => void;
};

export interface ServerOptions {
  name: string;
  title: string;
  version: string;
  instructionsPath?: string;
  fallbackInstructions?: string;
  registerTools: (server: McpServer) => void;
  registerResources: (server: McpServer) => void;
  registerPrompts: (server: McpServer) => void;
}

function readInstructions(instructionsPath?: string, fallback?: string): string {
  if (instructionsPath) {
    try {
      return readFileSync(instructionsPath, "utf-8");
    } catch {
      return fallback ?? `${instructionsPath} not found`;
    }
  }
  return fallback ?? "";
}

export function createServerFactory(options: ServerOptions): () => ServerFactoryResponse {
  return () => {
    const instructions = readInstructions(
      options.instructionsPath,
      options.fallbackInstructions
    );

    const server = new McpServer(
      {
        name: options.name,
        title: options.title,
        version: options.version,
      },
      {
        capabilities: {
          tools: { listChanged: false },
          resources: { subscribe: false, listChanged: false },
          prompts: { listChanged: false },
          logging: {},
        },
        instructions,
      }
    );

    options.registerTools(server);
    options.registerResources(server);
    options.registerPrompts(server);

    return {
      server,
      cleanup: (_sessionId?: string) => {},
    };
  };
}

/**
 * Resolve the instructions.md path relative to the calling server's dist/ directory.
 * Call this from the consuming server's server/index.ts:
 *   resolveInstructionsPath(import.meta.url)
 * Returns: absolute path to dist/docs/instructions.md
 */
export function resolveInstructionsPath(importMetaUrl: string): string {
  const __dirname = dirname(fileURLToPath(importMetaUrl));
  return resolve(__dirname, "../docs/instructions.md");
}
