import { PortainerError } from "./errors.js";

export interface PortainerClientConfig {
  host: string;
  secure: boolean;
  apiKey?: string;
  username?: string;
  password?: string;
}

export class PortainerClient {
  private config: PortainerClientConfig;
  private jwtToken: string | null = null;
  private baseUrl: string;

  constructor(config: PortainerClientConfig) {
    this.config = config;
    const protocol = config.secure ? "https" : "http";
    this.baseUrl = `${protocol}://${config.host.replace(/\/+$/, "")}`;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (this.config.apiKey) {
      return { "X-API-KEY": this.config.apiKey };
    }

    if (!this.jwtToken) {
      await this.authenticate();
    }

    return { Authorization: `Bearer ${this.jwtToken}` };
  }

  private async authenticate(): Promise<void> {
    if (!this.config.username || !this.config.password) {
      throw new Error("Either PORTAINER_API_KEY or PORTAINER_USERNAME + PORTAINER_PASSWORD are required");
    }

    const res = await fetch(`${this.baseUrl}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: this.config.username, password: this.config.password }),
    });

    if (!res.ok) {
      throw new PortainerError(res.status, "Authentication failed");
    }

    const data = (await res.json()) as { jwt: string };
    this.jwtToken = data.jwt;
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/api${path}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        url.searchParams.set(k, v);
      }
    }

    const authHeaders = await this.getAuthHeaders();
    const headers: Record<string, string> = {
      ...authHeaders,
      ...(body ? { "Content-Type": "application/json" } : {}),
    };

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && !this.config.apiKey) {
      // Token expired, re-authenticate and retry once
      this.jwtToken = null;
      const retryHeaders = await this.getAuthHeaders();
      const retryRes = await fetch(url.toString(), {
        method,
        headers: { ...retryHeaders, ...(body ? { "Content-Type": "application/json" } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!retryRes.ok) {
        const text = await retryRes.text().catch(() => "");
        throw new PortainerError(retryRes.status, retryRes.statusText, text);
      }
      if (retryRes.status === 204) return undefined as T;
      return (await retryRes.json()) as T;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new PortainerError(res.status, res.statusText, text);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
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

  async delete<T = unknown>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  async getText(path: string): Promise<string> {
    const url = new URL(`${this.baseUrl}/api${path}`);
    const authHeaders = await this.getAuthHeaders();
    const res = await fetch(url.toString(), { method: "GET", headers: authHeaders });
    if (res.status === 401 && !this.config.apiKey) {
      this.jwtToken = null;
      const retryHeaders = await this.getAuthHeaders();
      const retryRes = await fetch(url.toString(), { method: "GET", headers: retryHeaders });
      if (!retryRes.ok) {
        const text = await retryRes.text().catch(() => "");
        throw new PortainerError(retryRes.status, retryRes.statusText, text);
      }
      return retryRes.text();
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new PortainerError(res.status, res.statusText, text);
    }
    return res.text();
  }
}

let client: PortainerClient | null = null;

export function getPortainerClient(): PortainerClient {
  if (!client) {
    const host = process.env.PORTAINER_HOST;
    if (!host) {
      throw new Error("PORTAINER_HOST environment variable is required");
    }
    const secure = process.env.PORTAINER_SECURE !== "false";
    if (process.env.PORTAINER_VERIFY_SSL !== "true") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    client = new PortainerClient({
      host,
      secure,
      apiKey: process.env.PORTAINER_API_KEY,
      username: process.env.PORTAINER_USERNAME,
      password: process.env.PORTAINER_PASSWORD,
    });
  }
  return client;
}
