import {
  createServerFactory,
  resolveInstructionsPath,
  type ServerFactoryResponse,
} from "@geoffmyers/mcp-server-shared";
import { registerTools } from "../tools/index.js";
import { registerResources } from "../resources/index.js";
import { registerPrompts } from "../prompts/index.js";

export const createServer: () => ServerFactoryResponse = createServerFactory({
  name: "mcp-server-markdown-rag",
  title: "Markdown RAG MCP Server",
  version: "1.0.0",
  instructionsPath: resolveInstructionsPath(import.meta.url),
  fallbackInstructions:
    "Markdown RAG MCP Server - Semantic and hybrid search over the repo's markdown knowledge base via Qdrant.",
  registerTools,
  registerResources,
  registerPrompts,
});
