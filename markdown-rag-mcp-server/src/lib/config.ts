export interface RagConfig {
  qdrantUrl: string;
  qdrantApiKey: string | undefined;
  collection: string;
  ollamaUrl: string;
  embedModel: string;
  embedDim: number;
  /** Base URL of the TEI cross-encoder, or "" to skip reranking entirely. */
  rerankUrl: string;
  /** Named only so a result can say which model ordered it. */
  rerankModel: string;
  /** How many fused candidates to score. 24 costs ~1.2 s on 4 CPU cores. */
  rerankCandidates: number;
  /** Per-candidate truncation; the model's own limit is 512 tokens. */
  rerankMaxChars: number;
  rerankTimeoutMs: number;
}

export function getRagConfig(): RagConfig {
  return {
    qdrantUrl: process.env.QDRANT_URL ?? "http://localhost:6333",
    qdrantApiKey: process.env.QDRANT_API_KEY,
    collection: process.env.QDRANT_COLLECTION ?? "markdown_kb",
    ollamaUrl: process.env.OLLAMA_URL ?? "http://localhost:11434",
    embedModel: process.env.EMBED_MODEL ?? "nomic-embed-text",
    embedDim: Number(process.env.EMBED_DIM ?? 768),
    rerankUrl: process.env.RERANK_URL ?? "",
    rerankModel: process.env.RERANK_MODEL ?? "cross-encoder/ms-marco-MiniLM-L6-v2",
    rerankCandidates: Number(process.env.RERANK_CANDIDATES ?? 24),
    rerankMaxChars: Number(process.env.RERANK_MAX_CHARS ?? 1800),
    rerankTimeoutMs: Number(process.env.RERANK_TIMEOUT_MS ?? 4000),
  };
}
