# CLAUDE.md - Markdown RAG MCP Server

## Project Overview

MCP server that exposes semantic and hybrid search over every markdown file in this repository. Embeddings come from a locally hosted Ollama model (`nomic-embed-text` by default, 768-dim); the vector store is a self-hosted Qdrant container on TrueNAS. The indexer lives at `scripts/markdown-rag/index-markdown.ts` and runs on push to `main` via `.github/workflows/index-markdown.yml`.

## Architecture / Key Files

- `src/index.ts` — Entry point, `runCli()` wrapper (5 lines).
- `src/server/index.ts` — Server factory via `createServerFactory`.
- `src/tools/search.ts` — `semantic_search`, `hybrid_search`, `get_chunk_by_id`, `list_indexed_paths`.
- `src/lib/qdrant.ts` — Thin Qdrant REST client (search, scroll, RRF merge).
- `src/lib/embed.ts` — Ollama `/api/embeddings` client.
- `src/lib/config.ts` — Env-driven config: `QDRANT_URL`, `QDRANT_API_KEY`, `QDRANT_COLLECTION`, `OLLAMA_URL`, `EMBED_MODEL`, `EMBED_DIM`.
- `src/resources/index.ts` — `markdown-rag://stats` resource (collection status + config).
- `src/prompts/search-help.ts` — Single prompt guiding which search tool to use.

## Development Commands

- `npm install` (from `mcp-servers/` workspace root) — installs/hoists deps.
- `npm run build --workspace=markdown-rag-mcp-server` — TS compile + copy docs.
- `npm run start:stdio` — Run via stdio transport for Claude Code.
- `npm run start:streamableHttp` — Run HTTP on port 3028.

## Tool Definitions

| Tool | Description |
|------|-------------|
| `semantic_search` | Vector-only search via Ollama-embedded query. |
| `hybrid_search` | RRF fusion of vector + Qdrant full-text-on-`bm25_text` payload field. |
| `get_chunk_by_id` | Fetch one chunk by Qdrant point ID. |
| `list_indexed_paths` | Distinct paths in the collection (deduped via scroll). |

## Indexer

The indexer is **NOT** part of this server's runtime — it's a separate script in `scripts/markdown-rag/`. The server is read-only; it never writes to Qdrant. This keeps the runtime image small and avoids mixing concerns.

## Gotchas

- Default HTTP port is 3028 (next free slot after the CLI-based infra block ending at 3027).
- Qdrant must be reachable from wherever Claude Code runs the server (i.e., this Mac). The default `QDRANT_URL=http://localhost:6333` assumes Tailscale is up and you've configured your Qdrant host to resolve.
- Ollama must have `nomic-embed-text` pulled. Run `ollama pull nomic-embed-text` on the Ollama host once.
- `EMBED_DIM` must match the model — 768 for nomic-embed-text, 384 for all-minilm. Mismatch breaks the collection.
- Qdrant collection is created by the indexer on first run; this server expects it to exist and returns a friendly error from `markdown-rag://stats` if it doesn't.
- Hybrid search uses Qdrant's `match: { text }` filter on the `bm25_text` payload field; the indexer must have created a `text` index on that field (`payload_schema: { bm25_text: text }`).
- `list_indexed_paths` scrolls and dedupes in-process — it's O(n) over points but capped at 20 pages × 256 points to avoid blowing up on huge collections.
