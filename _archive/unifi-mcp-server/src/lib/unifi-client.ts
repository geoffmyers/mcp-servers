import { UniFiError } from "./errors.js";

export interface UniFiClientConfig {
  host: string;
  username: string;
  password: string;
  site: string;
  isUniFiOS: boolean;
}

export class UniFiClient {
  private config: UniFiClientConfig;
  private baseUrl: string;
  private cookie: string | null = null;
  private csrfToken: string | null = null;

  constructor(config: UniFiClientConfig) {
    this.config = config;
    this.baseUrl = `https://${config.host.replace(/\/+$/, "")}`;
  }

  private get apiPrefix(): string {
    if (this.config.isUniFiOS) {
      return `${this.baseUrl}/proxy/network/api/s/${this.config.site}`;
    }
    return `${this.baseUrl}/api/s/${this.config.site}`;
  }

  private get loginUrl(): string {
    if (this.config.isUniFiOS) {
      return `${this.baseUrl}/api/auth/login`;
    }
    return `${this.baseUrl}/api/login`;
  }

  private async login(): Promise<void> {
    const res = await fetch(this.loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: this.config.username,
        password: this.config.password,
      }),
      redirect: "manual",
    });

    if (!res.ok && res.status !== 302) {
      throw new UniFiError(res.status, "Authentication failed");
    }

    // Extract cookies from set-cookie header
    const setCookieHeaders = res.headers.getSetCookie?.() ?? [];
    const cookies: string[] = [];
    for (const header of setCookieHeaders) {
      const cookiePart = header.split(";")[0];
      if (cookiePart) cookies.push(cookiePart);
    }
    if (cookies.length > 0) {
      this.cookie = cookies.join("; ");
    }

    // Extract CSRF token (UniFi OS)
    const csrf = res.headers.get("x-csrf-token");
    if (csrf) {
      this.csrfToken = csrf;
    }

    // Auto-detect site name if using "default" (legacy controllers use random site names)
    if (this.config.site === "default" && this.cookie) {
      await this.autoDetectSite();
    }
  }

  private async autoDetectSite(): Promise<void> {
    const prefix = this.config.isUniFiOS
      ? `${this.baseUrl}/proxy/network/api`
      : `${this.baseUrl}/api`;
    const res = await fetch(`${prefix}/self/sites`, {
      headers: { Cookie: this.cookie! },
    });
    if (res.ok) {
      const json = (await res.json()) as { data?: Array<{ name: string; attr_hidden_id?: string }> };
      const site = json.data?.find((s) => s.attr_hidden_id === "default") ?? json.data?.[0];
      if (site && site.name !== "default") {
        this.config.site = site.name;
      }
    }
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    if (!this.cookie) {
      await this.login();
    }

    const url = `${this.apiPrefix}${path}`;
    const headers: Record<string, string> = {
      ...(this.cookie ? { Cookie: this.cookie } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(this.csrfToken && method !== "GET" ? { "X-Csrf-Token": this.csrfToken } : {}),
    };

    let res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Re-auth on 401
    if (res.status === 401) {
      this.cookie = null;
      this.csrfToken = null;
      await this.login();
      headers.Cookie = this.cookie!;
      if (this.csrfToken && method !== "GET") {
        headers["X-Csrf-Token"] = this.csrfToken;
      }
      res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new UniFiError(res.status, res.statusText, text);
    }

    if (res.status === 204) return undefined as T;

    const json = (await res.json()) as { meta?: { rc: string; msg?: string }; data?: T };
    if (json.meta?.rc === "error") {
      throw new UniFiError(400, json.meta.msg || "API error");
    }
    return (json.data ?? json) as T;
  }

  async get<T = unknown>(path: string): Promise<T> {
    return this.request<T>("GET", path);
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

  /** Make a request outside the site-scoped API (e.g., /self/sites) */
  async requestGlobal<T = unknown>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    if (!this.cookie) {
      await this.login();
    }

    const prefix = this.config.isUniFiOS
      ? `${this.baseUrl}/proxy/network/api`
      : `${this.baseUrl}/api`;
    const url = `${prefix}${path}`;

    const headers: Record<string, string> = {
      ...(this.cookie ? { Cookie: this.cookie } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(this.csrfToken && method !== "GET" ? { "X-Csrf-Token": this.csrfToken } : {}),
    };

    let res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });

    if (res.status === 401) {
      this.cookie = null;
      this.csrfToken = null;
      await this.login();
      headers.Cookie = this.cookie!;
      if (this.csrfToken && method !== "GET") headers["X-Csrf-Token"] = this.csrfToken;
      res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new UniFiError(res.status, res.statusText, text);
    }

    if (res.status === 204) return undefined as T;
    const json = (await res.json()) as { meta?: { rc: string; msg?: string }; data?: T };
    if (json.meta?.rc === "error") throw new UniFiError(400, json.meta.msg || "API error");
    return (json.data ?? json) as T;
  }

  /** Request to the stat endpoint */
  async stat<T = unknown>(path: string): Promise<T> {
    return this.get<T>(`/stat${path}`);
  }

  /** Request to the rest endpoint */
  async rest<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
    return this.request<T>(method, `/rest${path}`, body);
  }

  /** Command endpoint (stamgr, devmgr, hotspot, etc.) */
  async cmd<T = unknown>(manager: string, body: unknown): Promise<T> {
    return this.post<T>(`/cmd/${manager}`, body);
  }
}

let client: UniFiClient | null = null;

export function getUniFiClient(): UniFiClient {
  if (!client) {
    const host = process.env.UNIFI_HOST;
    const username = process.env.UNIFI_USERNAME;
    const password = process.env.UNIFI_PASSWORD;
    if (!host) throw new Error("UNIFI_HOST environment variable is required");
    if (!username) throw new Error("UNIFI_USERNAME environment variable is required");
    if (!password) throw new Error("UNIFI_PASSWORD environment variable is required");
    const site = process.env.UNIFI_SITE || "default";
    const isUniFiOS = process.env.UNIFI_IS_UNIFI_OS !== "false";
    if (process.env.UNIFI_VERIFY_SSL !== "true") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    client = new UniFiClient({ host, username, password, site, isUniFiOS });
  }
  return client;
}
