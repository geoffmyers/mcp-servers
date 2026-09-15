import {
  createServerFactory,
  resolveInstructionsPath,
  type ServerFactoryResponse,
} from "@geoffmyers/mcp-server-shared";
import { registerTools } from "../tools/index.js";
import { registerResources } from "../resources/index.js";
import { registerPrompts } from "../prompts/index.js";

export const createServer: () => ServerFactoryResponse = createServerFactory({
  name: "mcp-server-find",
  title: "Find MCP Server",
  version: "1.0.0",
  instructionsPath: resolveInstructionsPath(import.meta.url),
  fallbackInstructions: "Find MCP Server - Search for files and directories using the find command.",
  registerTools,
  registerResources,
  registerPrompts,
});
