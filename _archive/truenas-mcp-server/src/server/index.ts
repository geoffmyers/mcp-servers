import {
  createServerFactory,
  resolveInstructionsPath,
  type ServerFactoryResponse,
} from "@geoffmyers/mcp-server-shared";
import { registerTools } from "../tools/index.js";
import { registerResources } from "../resources/index.js";
import { registerPrompts } from "../prompts/index.js";

export const createServer: () => ServerFactoryResponse = createServerFactory({
  name: "mcp-server-truenas",
  title: "TrueNAS SCALE MCP Server",
  version: "1.0.0",
  instructionsPath: resolveInstructionsPath(import.meta.url),
  fallbackInstructions: "TrueNAS SCALE MCP Server - Manage TrueNAS via WebSocket API.",
  registerTools,
  registerResources,
  registerPrompts,
});
