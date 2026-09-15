import {
  createServerFactory,
  resolveInstructionsPath,
  type ServerFactoryResponse,
} from "@geoffmyers/mcp-server-shared";
import { registerTools } from "../tools/index.js";
import { registerResources } from "../resources/index.js";
import { registerPrompts } from "../prompts/index.js";

export const createServer: () => ServerFactoryResponse = createServerFactory({
  name: "mcp-server-truenas-cli",
  title: "TrueNAS SCALE CLI MCP Server",
  version: "1.0.0",
  instructionsPath: resolveInstructionsPath(import.meta.url),
  fallbackInstructions: "TrueNAS SCALE CLI MCP Server - Manage TrueNAS SCALE via midclt commands.",
  registerTools,
  registerResources,
  registerPrompts,
});
