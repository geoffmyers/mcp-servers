export interface RagConfig {
  qdrantUrl: string;
  qdrantApiKey: string | undefined;
  collection: string;
  ollamaUrl: string;
  embedModel: string;
  embedDim: number;
}

export function getRagConfig(): RagConfig {
  return {
    qdrantUrl: process.env.QDRANT_URL ?? "http://localhost:6333",
    qdrantApiKey: process.env.QDRANT_API_KEY,
    collection: process.env.QDRANT_COLLECTION ?? "markdown_kb",
    ollamaUrl: process.env.OLLAMA_URL ?? "http://localhost:11434",
    embedModel: process.env.EMBED_MODEL ?? "nomic-embed-text",
    embedDim: Number(process.env.EMBED_DIM ?? 768),
  };
}
