import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getCollectionInfo } from "../lib/qdrant.js";
import { getRagConfig } from "../lib/config.js";

export function registerResources(server: McpServer): void {
  server.resource(
    "index_stats",
    "markdown-rag://stats",
    {
      title: "Index Stats",
      description: "Qdrant collection size, status, and indexer config",
      mimeType: "application/json",
    },
    async (uri) => {
      const cfg = getRagConfig();
      const info = await getCollectionInfo();
      const body = {
        collection: cfg.collection,
        qdrant_url: cfg.qdrantUrl,
        ollama_url: cfg.ollamaUrl,
        embed_model: cfg.embedModel,
        embed_dim: cfg.embedDim,
        info,
      };
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(body, null, 2),
          },
        ],
      };
    },
  );
}
