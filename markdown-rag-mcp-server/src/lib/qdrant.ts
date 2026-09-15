import { getRagConfig } from "./config.js";

export interface ChunkPayload {
  path: string;
  heading: string | null;
  heading_path: string[];
  text: string;
  start_line: number;
  end_line: number;
  frontmatter: Record<string, unknown> | null;
  tags: string[];
  modified: string | null;
  bm25_text: string;
}

export interface SearchHit {
  id: string | number;
  score: number;
  payload: ChunkPayload;
}

interface QdrantFilter {
  must?: Array<Record<string, unknown>>;
  should?: Array<Record<string, unknown>>;
  must_not?: Array<Record<string, unknown>>;
}

async function qdrant<T>(path: string, init?: RequestInit): Promise<T> {
  const cfg = getRagConfig();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (cfg.qdrantApiKey) headers["api-key"] = cfg.qdrantApiKey;
  const res = await fetch(`${cfg.qdrantUrl}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Qdrant ${init?.method ?? "GET"} ${path} failed: ${res.status} ${res.statusText} ${body}`);
  }
  return (await res.json()) as T;
}

export function buildPathFilter(pathPrefix?: string, tags?: string[]): QdrantFilter | undefined {
  const must: Array<Record<string, unknown>> = [];
  if (pathPrefix) {
    // A CHEAP PRE-FILTER ONLY -- narrow it again with matchesPath().
    //
    // `path` is indexed as text, so Qdrant matches on TOKENS, not substrings:
    // a scope of "family/docs" also matches "family/family-book/docs", because
    // both contain the tokens `family` and `docs`. Every caller asking for a
    // subtree gets neighbouring subtrees mixed in, quietly.
    //
    // Dropping the Qdrant side entirely would mean filtering the whole
    // collection in process, so it stays as a recall-preserving narrowing and
    // the exact test is applied to the hits.
    must.push({ key: "path", match: { text: pathPrefix } });
  }
  if (tags && tags.length > 0) {
    for (const tag of tags) must.push({ key: "tags", match: { value: tag } });
  }
  return must.length > 0 ? { must } : undefined;
}

/** The exact scope test the caller asked for: a case-insensitive substring. */
export function matchesPath(path: string, pathPrefix?: string): boolean {
  if (!pathPrefix) return true;
  return path.toLowerCase().includes(pathPrefix.toLowerCase());
}

export async function searchVector(
  vector: number[],
  limit: number,
  filter?: QdrantFilter,
): Promise<SearchHit[]> {
  const cfg = getRagConfig();
  const result = await qdrant<{ result: SearchHit[] }>(`/collections/${cfg.collection}/points/search`, {
    method: "POST",
    body: JSON.stringify({ vector, limit, with_payload: true, filter }),
  });
  return result.result;
}

export async function searchKeyword(
  query: string,
  limit: number,
  filter?: QdrantFilter,
): Promise<SearchHit[]> {
  const cfg = getRagConfig();
  const matchFilter: QdrantFilter = {
    must: [{ key: "bm25_text", match: { text: query } }, ...(filter?.must ?? [])],
  };
  const result = await qdrant<{ result: { points: SearchHit[] } }>(
    `/collections/${cfg.collection}/points/scroll`,
    {
      method: "POST",
      body: JSON.stringify({ filter: matchFilter, limit, with_payload: true }),
    },
  );
  return result.result.points ?? [];
}

export async function getPointById(id: string | number): Promise<SearchHit | null> {
  const cfg = getRagConfig();
  const result = await qdrant<{ result: SearchHit | null }>(
    `/collections/${cfg.collection}/points/${encodeURIComponent(String(id))}`,
    { method: "GET" },
  );
  return result.result ?? null;
}

export interface CollectionInfo {
  status: string;
  points_count: number;
  vectors_count: number;
  indexed_vectors_count: number;
  segments_count: number;
}

export async function getCollectionInfo(): Promise<CollectionInfo | null> {
  const cfg = getRagConfig();
  try {
    const result = await qdrant<{ result: CollectionInfo }>(`/collections/${cfg.collection}`, {
      method: "GET",
    });
    return result.result;
  } catch (err) {
    if (String(err).includes("404")) return null;
    throw err;
  }
}

export async function listDistinctPaths(
  limit: number,
  pathPrefix?: string,
): Promise<{ paths: string[]; exhaustive: boolean; scanned: number }> {
  const cfg = getRagConfig();
  // Qdrant has no DISTINCT, so scroll and dedupe in process.
  //
  // TWO THINGS THIS GETS RIGHT THAT THE FIRST VERSION DID NOT.
  //
  // It accepts a path filter at all. The tool advertised none, so a caller
  // passing `path_prefix` -- which the search tools DO accept, and which this
  // repo's CLAUDE.md documents -- had it silently dropped and got an unrelated
  // answer that looked authoritative.
  //
  // And it scrolls the WHOLE collection. The old loop stopped after 20 pages of
  // 256, which is 5,120 of 49,486 points: it reported roughly a tenth of the
  // index, in whatever order Qdrant returned, as though it were the index. A
  // tool whose stated purpose is "verifying coverage" cannot answer from a
  // sample it never mentions, so the caller is now told whether the scan was
  // exhaustive.
  //
  // The filter is a true SUBSTRING test done here rather than a Qdrant `text`
  // match, because `path` is indexed as text and matches on TOKENS: a query of
  // "family/docs" happily matches "family/family-book/docs". For picking a
  // subtree that is the wrong answer.
  const needle = pathPrefix?.toLowerCase();
  const seen = new Set<string>();
  let offset: string | number | undefined = undefined;
  let scanned = 0;
  let exhaustive = true;
  const pageSize = 1024;
  const maxScan = 500_000;

  for (;;) {
    const body: Record<string, unknown> = {
      limit: pageSize,
      with_payload: { include: ["path"] },
      with_vector: false,
    };
    if (offset !== undefined) body.offset = offset;
    const page = await qdrant<{
      result: {
        points: Array<{ id: string | number; payload: { path: string } }>;
        next_page_offset?: string | number;
      };
    }>(`/collections/${cfg.collection}/points/scroll`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    for (const pt of page.result.points) {
      scanned++;
      const path = pt.payload?.path;
      if (!path) continue;
      if (needle && !path.toLowerCase().includes(needle)) continue;
      seen.add(path);
    }
    if (seen.size >= limit) {
      exhaustive = false;
      break;
    }
    if (!page.result.next_page_offset) break;
    if (scanned >= maxScan) {
      exhaustive = false;
      break;
    }
    offset = page.result.next_page_offset;
  }
  return { paths: Array.from(seen).sort().slice(0, limit), exhaustive, scanned };
}

export function rrfMerge(
  lists: SearchHit[][],
  k = 60,
  limit = 20,
): SearchHit[] {
  const scores = new Map<string | number, { hit: SearchHit; score: number }>();
  for (const list of lists) {
    list.forEach((hit, rank) => {
      const inc = 1 / (k + rank + 1);
      const existing = scores.get(hit.id);
      if (existing) existing.score += inc;
      else scores.set(hit.id, { hit, score: inc });
    });
  }
  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ hit, score }) => ({ ...hit, score }));
}
