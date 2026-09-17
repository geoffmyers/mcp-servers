# Markdown RAG MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for
semantic and hybrid (vector + keyword) search over a collection of Markdown
files, indexed into [Qdrant](https://qdrant.tech/) with embeddings from a
local [Ollama](https://ollama.com/) model (default `nomic-embed-text`, 768
dimensions). This server only *queries* the index — building and refreshing
it is a separate indexing job (not included here) that reads your Markdown
tree, chunks it, embeds each chunk, and upserts into the same Qdrant
collection this server reads from.

## Requirements
- Node.js 20.6+
- TypeScript
- A reachable Qdrant instance with an existing collection of embedded
  Markdown chunks
- A reachable Ollama instance serving the same embedding model the
  collection was built with (query-time and index-time embeddings must
  match, or search quality degrades silently)

## Installation
From the repository root (the servers are one npm workspace):

```bash
npm ci
npm run build
```

## Configuration

### Claude Desktop / Claude Code
```json
{
  "mcpServers": {
    "markdown-rag": {
      "command": "node",
      "args": ["/path/to/mcp-servers/markdown-rag-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

### Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `QDRANT_URL` | Yes | — | Base URL of the Qdrant instance (e.g. `http://localhost:6333`) |
| `QDRANT_API_KEY` | No | — | API key, if the Qdrant instance requires one |
| `QDRANT_COLLECTION` | No | `markdown_kb` | Name of the Qdrant collection to search |
| `OLLAMA_URL` | Yes | — | Base URL of the Ollama instance (e.g. `http://localhost:11434`) |
| `EMBED_MODEL` | No | `nomic-embed-text` | Ollama embedding model name; must match what the index was built with |
| `EMBED_DIM` | No | `768` | Embedding vector dimension; must match the Qdrant collection's configured size |
| `PORT` | No | `3028` | HTTP transport port |

See `.env.example` for a filled-in template.

## Tools

4 tools, all read-only.

| Tool | Description |
|------|-------------|
| `semantic_search` | Semantic (vector) search over the markdown knowledge base. Best for fuzzy / conceptual queries |
| `hybrid_search` | Hybrid search: combines vector (semantic) and keyword (BM25-style) matches via Reciprocal Rank Fusion. Best when the query mixes exact identifiers (error codes, command names, versions) with conceptual terms |
| `get_chunk_by_id` | Fetch a single chunk by its Qdrant point ID. Use after a search to get the full chunk if `include_body` was false, or to retrieve neighbors |
| `list_indexed_paths` | List distinct file paths present in the index. Useful for verifying coverage or scoping a `path_prefix` filter; reports whether the scan was exhaustive, so a truncated answer is never mistaken for the whole index |

## Resources
| Resource | Description |
|----------|-------------|
| `index_stats` | Qdrant collection size, status, and indexer config |

## Prompts
| Prompt | Description |
|--------|-------------|
| `search-knowledge-base` | Search the markdown knowledge base for a topic |

## Safety
- Entirely read-only: no tool modifies the Qdrant collection, so there is no `confirm: true` gate to speak of.
- Results are only as good as the index behind them; `index_stats` and `list_indexed_paths` are there to sanity-check coverage before trusting a "no results found".

## Author
Geoff Myers
