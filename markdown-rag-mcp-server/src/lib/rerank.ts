import { getRagConfig } from "./config.js";
import type { SearchHit } from "./qdrant.js";

/**
 * Cross-encoder reranking of search candidates.
 *
 * Both search tools rank without ever reading the query against the chunk.
 * `semantic_search` compares two embeddings; `hybrid_search` fuses two rankings
 * with RRF, which sees only each hit's POSITION in each list. A cross-encoder
 * scores the (query, chunk) pair directly, which is what catches the chunk that
 * uses none of the query's words and is still the answer — and demotes the one
 * that repeats them and is not.
 *
 * The reranker is an OPTIONAL stage and its absence is never an error: the
 * scoring service (text-embeddings-inference) runs beside the vector store,
 * and this server also runs from machines that cannot reach it. When it cannot
 * be used the RRF/vector order is returned untouched.
 *
 * What it must never do is fall back SILENTLY. Every result says which ranking
 * produced it, because a search that quietly stopped reranking looks exactly like
 * a search that reranked and found nothing better — and this repo has been bitten
 * by a collector that reported its own failure to nobody.
 */

export interface RerankOutcome {
  hits: SearchHit[];
  /** True only if the returned order came from the cross-encoder. */
  reranked: boolean;
  /** One line for the response footer, stating which ranking the caller is reading. */
  note: string;
}

interface TeiRank {
  index: number;
  score: number;
}

/**
 * Reorder `candidates` by cross-encoder relevance and return the best `limit`.
 *
 * Truncation is deliberate: ms-marco-MiniLM-L6-v2 accepts 512 tokens, so text
 * beyond roughly 1,800 characters is discarded by the model anyway. Sending it
 * would only risk the 422 that TEI returns when a batch exceeds
 * `max_batch_tokens` — which is how an over-long chunk silently costs you the
 * whole reranking pass rather than its own tail.
 */
export async function rerankHits(
  query: string,
  candidates: SearchHit[],
  limit: number,
): Promise<RerankOutcome> {
  const cfg = getRagConfig();
  const passthrough = (note: string): RerankOutcome => ({
    hits: candidates.slice(0, limit),
    reranked: false,
    note,
  });

  if (!cfg.rerankUrl) return passthrough("ranking: RRF/vector (reranker not configured)");
  if (candidates.length <= 1) return passthrough("ranking: RRF/vector (nothing to rerank)");

  const pool = candidates.slice(0, cfg.rerankCandidates);
  const texts = pool.map((h) => {
    const p = h.payload;
    // Give the model the heading path too: a chunk's own words often omit the
    // subject that its heading names.
    const head = p.heading_path?.length ? p.heading_path.join(" > ") : p.heading ?? "";
    const body = (p.text ?? "").slice(0, cfg.rerankMaxChars);
    return head ? `${head}\n${body}` : body;
  });

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), cfg.rerankTimeoutMs);
  let ranks: TeiRank[];
  try {
    const resp = await fetch(`${cfg.rerankUrl.replace(/\/$/, "")}/rerank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, texts }),
      signal: ctl.signal,
    });
    if (!resp.ok) {
      const detail = (await resp.text()).slice(0, 160);
      return passthrough(`ranking: RRF/vector (reranker HTTP ${resp.status}: ${detail})`);
    }
    ranks = (await resp.json()) as TeiRank[];
  } catch (error) {
    const why = error instanceof Error ? error.message : String(error);
    const reason = ctl.signal.aborted ? `timed out after ${cfg.rerankTimeoutMs} ms` : why;
    return passthrough(`ranking: RRF/vector (reranker unreachable: ${reason})`);
  } finally {
    clearTimeout(timer);
  }

  if (!Array.isArray(ranks) || ranks.length === 0) {
    return passthrough("ranking: RRF/vector (reranker returned no ranking)");
  }

  const reordered: SearchHit[] = [];
  for (const r of [...ranks].sort((a, b) => b.score - a.score)) {
    const hit = pool[r.index];
    if (!hit) continue; // an index outside the pool is the service's bug, not a crash here
    // Carry the cross-encoder score, so the printed score means what the order means.
    reordered.push({ ...hit, score: r.score });
  }
  if (reordered.length === 0) {
    return passthrough("ranking: RRF/vector (reranker returned no usable indices)");
  }

  // Anything the reranker was not shown keeps its original relative position
  // behind what it was, so a large `limit` with a smaller candidate pool still
  // returns a full page.
  const tail = candidates.slice(cfg.rerankCandidates);
  return {
    hits: [...reordered, ...tail].slice(0, limit),
    reranked: true,
    note: `ranking: cross-encoder ${cfg.rerankModel} over ${pool.length} candidates`,
  };
}
