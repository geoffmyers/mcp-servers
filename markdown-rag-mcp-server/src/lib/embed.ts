import { readFile } from "node:fs/promises";
import { getRagConfig } from "./config.js";

/**
 * Where a query gets embedded, chosen at first use and then remembered.
 *
 * A search embeds ONE short string, so this is not about throughput — it is
 * about not queueing behind Frigate on the TrueNAS 3060 while somebody waits
 * for an answer. Preference order lives in
 * `infrastructure/gaming-pc-gpu/gpu-endpoints.json`, shared with the indexer,
 * so the two never disagree about which GPU is in front.
 *
 * The 3070 host is a Windows desktop and is sometimes simply off — it was, the
 * day this was written — so a probe failure is expected and silent, and the
 * local 3060 takes over. Resolved once per process: an MCP server is long-lived
 * and probing on every keystroke would cost more than it saves.
 */
const CONFIG_URL = new URL(
  "../../../../infrastructure/gaming-pc-gpu/gpu-endpoints.json",
  import.meta.url,
);

let resolved: Promise<string> | null = null;

async function ollamaUrl(): Promise<string> {
  if (process.env.OLLAMA_URL) return process.env.OLLAMA_URL;
  if (resolved) return resolved;
  resolved = (async () => {
    let eps: Array<{ name: string; url: string; probe?: string }> = [];
    let timeoutMs = 3000;
    try {
      const cfg = JSON.parse(await readFile(CONFIG_URL, "utf8"));
      eps = cfg.services?.["ollama-embed"]?.endpoints ?? [];
      timeoutMs = (cfg.probe_timeout_seconds ?? 3) * 1000;
    } catch {
      return getRagConfig().ollamaUrl;
    }
    for (const ep of eps) {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), timeoutMs);
      try {
        const r = await fetch(`${ep.url}${ep.probe ?? "/"}`, { signal: ctl.signal });
        if (r.ok) return ep.url;
      } catch {
        /* the fallback working, not an error */
      } finally {
        clearTimeout(t);
      }
    }
    return eps[eps.length - 1]?.url ?? getRagConfig().ollamaUrl;
  })();
  return resolved;
}

export async function embed(text: string): Promise<number[]> {
  const cfg = getRagConfig();
  const base = await ollamaUrl();
  const res = await fetch(`${base}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: cfg.embedModel, prompt: text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Ollama embed failed at ${base}: ${res.status} ${res.statusText} ${body}`);
  }
  const data = (await res.json()) as { embedding?: number[] };
  if (!Array.isArray(data.embedding)) {
    throw new Error("Ollama embed response missing 'embedding' field");
  }
  return data.embedding;
}
