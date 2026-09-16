# Markdown RAG MCP Server

Semantic and hybrid (vector + keyword) search over every markdown file in this repo. The index is built by `scripts/markdown-rag/index-markdown.ts` and stored in a self-hosted Qdrant instance; embeddings come from a local Ollama model (default `nomic-embed-text`, 768d).

## When to use this vs grep

| Need | Use |
|------|-----|
| Fuzzy / conceptual query ("how did I solve the Z-Wave thing") | `semantic_search` |
| Mixed query with exact tokens ("error 0xC10A in BMW bridge") | `hybrid_search` |
| Exact substring or regex | grep (faster, no embedding cost) |
| List which files are indexed | `list_indexed_paths` |

The RAG layer is for the *long tail* — when you can't remember the exact words but you remember the shape of the problem.

## Available Tools

- **semantic_search** — Vector search via Ollama-embedded query against Qdrant.
- **hybrid_search** — Vector + Qdrant full-text match, fused with Reciprocal Rank Fusion (k=60).
- **get_chunk_by_id** — Fetch one chunk by Qdrant point ID (returned by search tools).
- **list_indexed_paths** — Distinct file paths in the index. Use to verify coverage or scope a `path_prefix` filter.

## Filters

Both search tools accept:
- `path_prefix` — substring match on the file path. Examples: `infrastructure/bmw-mqtt-bridge`, `docs/security`, `mcp-servers/`.
- `tags` — array; chunk's frontmatter must include all listed tags.

## Resource

- `markdown-rag://stats` — JSON blob with collection size, indexer config, and Qdrant status. Useful for diagnosing "no results found" (the index might be empty or stale).

## Usage Tips

- Cite results by `path:start_line-end_line — heading_path` from the result header so the human can jump straight there.
- If hybrid returns much better results than semantic for the same query, your query was probably exact-token-heavy — note that for next time.
- `include_body: false` returns just headers; useful when you only want to know *which files* are relevant before drilling in.
- Re-indexing happens on push to main via GitHub Actions, but you can run `scripts/markdown-rag/index-markdown.ts` locally for ad-hoc refresh.
