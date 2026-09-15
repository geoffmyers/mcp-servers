import { PfSenseError } from "./errors.js";

export interface PfSenseClientConfig {
  host: string;
  apiKey: string;
  secure: boolean;
}

export class PfSenseClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: PfSenseClientConfig) {
    const protocol = config.secure ? "https" : "http";
    this.baseUrl = `${protocol}://${config.host.replace(/\/+$/, "")}/api/v2`;
    this.apiKey = config.apiKey;
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        url.searchParams.set(k, v);
      }
    }

    const headers: Record<string, string> = {
      "X-API-Key": this.apiKey,
      ...(body ? { "Content-Type": "application/json" } : {}),
    };

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let message = res.statusText;
      try {
        const parsed = JSON.parse(text);
        if (parsed.message) message = parsed.message;
      } catch {
        // use statusText
      }
      throw new PfSenseError(res.status, message, text);
    }

    if (res.status === 204) return undefined as T;

    const json = (await res.json()) as { code: number; status: string; response_id: string; message: string; data: T };
    return json.data;
  }

  async get<T = unknown>(path: string, query?: Record<string, string>): Promise<T> {
    return this.request<T>("GET", path, undefined, query);
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async put<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  async patch<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  async delete<T = unknown>(path: string, query?: Record<string, string>): Promise<T> {
    return this.request<T>("DELETE", path, undefined, query);
  }
}

let client: PfSenseClient | null = null;

export function getPfSenseClient(): PfSenseClient {
  if (!client) {
    const host = process.env.PFSENSE_HOST;
    const apiKey = process.env.PFSENSE_API_KEY;
    if (!host) throw new Error("PFSENSE_HOST environment variable is required");
    if (!apiKey) throw new Error("PFSENSE_API_KEY environment variable is required");
    const secure = process.env.PFSENSE_SECURE !== "false";
    if (process.env.PFSENSE_VERIFY_SSL !== "true") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    client = new PfSenseClient({ host, apiKey, secure });
  }
  return client;
}
