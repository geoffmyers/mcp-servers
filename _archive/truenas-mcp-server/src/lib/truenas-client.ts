import WebSocket from "ws";
import { randomUUID } from "node:crypto";
import { TrueNASError } from "./errors.js";

interface PendingCall {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

interface JobUpdate {
  id: number;
  state: "RUNNING" | "SUCCESS" | "FAILED" | "ABORTED";
  progress: { percent: number; description: string };
  result?: unknown;
  error?: string;
  exception?: string;
}

export interface TrueNASClientConfig {
  host: string;
  apiKey: string;
  secure?: boolean;
  verifySsl?: boolean;
  timeout?: number;
}

export class TrueNASClient {
  private ws: WebSocket | null = null;
  private pendingCalls = new Map<string, PendingCall>();
  private jobCallbacks = new Map<number, (job: JobUpdate) => void>();
  private connected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private config: Required<TrueNASClientConfig>;

  constructor(config: TrueNASClientConfig) {
    this.config = {
      secure: true,
      verifySsl: false,
      timeout: 30000,
      ...config,
    };
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    const protocol = this.config.secure ? "wss" : "ws";
    const url = `${protocol}://${this.config.host}/api/current`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url, { rejectUnauthorized: this.config.verifySsl });

      const connectTimeout = setTimeout(() => {
        this.ws?.close();
        reject(new Error("Connection timeout"));
      }, this.config.timeout);

      this.ws.on("open", async () => {
        clearTimeout(connectTimeout);
        this.connected = true;
        this.reconnectDelay = 1000;

        try {
          await this.call("auth.login_with_api_key", [this.config.apiKey]);
          resolve();
        } catch (err) {
          this.ws?.close();
          reject(new Error(`Authentication failed: ${err instanceof Error ? err.message : String(err)}`));
        }
      });

      this.ws.on("message", (data) => {
        this.handleMessage(data.toString());
      });

      this.ws.on("close", () => {
        this.connected = false;
        this.rejectAllPending("Connection closed");
        this.scheduleReconnect();
      });

      this.ws.on("error", (err) => {
        clearTimeout(connectTimeout);
        if (!this.connected) {
          reject(err);
        }
      });
    });
  }

  private handleMessage(raw: string): void {
    let msg: { jsonrpc: string; id?: string; method?: string; result?: unknown; error?: unknown; params?: unknown };
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    // Response to a call
    if (msg.id && this.pendingCalls.has(msg.id)) {
      const pending = this.pendingCalls.get(msg.id)!;
      this.pendingCalls.delete(msg.id);
      clearTimeout(pending.timeout);

      if (msg.error) {
        pending.reject(TrueNASError.fromJsonRpc(msg.error as Parameters<typeof TrueNASError.fromJsonRpc>[0]));
      } else {
        pending.resolve(msg.result);
      }
      return;
    }

    // Job update notification
    if (msg.method === "collection_update" && msg.params) {
      const params = msg.params as { collection?: string; fields?: JobUpdate };
      if (params.collection === "core.get_jobs" && params.fields) {
        const job = params.fields;
        const cb = this.jobCallbacks.get(job.id);
        if (cb) cb(job);
      }
    }
  }

  async call(method: string, params: unknown[] = []): Promise<unknown> {
    if (!this.ws || !this.connected) {
      await this.connect();
    }

    const id = randomUUID();
    const message = JSON.stringify({ jsonrpc: "2.0", method, id, params });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingCalls.delete(id);
        reject(new Error(`Call to ${method} timed out`));
      }, this.config.timeout);

      this.pendingCalls.set(id, { resolve, reject, timeout });
      this.ws!.send(message);
    });
  }

  async callJob(method: string, params: unknown[] = [], jobTimeout = 120000): Promise<unknown> {
    const jobId = (await this.call(method, params)) as number;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.jobCallbacks.delete(jobId);
        reject(new Error(`Job ${jobId} timed out`));
      }, jobTimeout);

      this.jobCallbacks.set(jobId, (job) => {
        if (job.state === "SUCCESS") {
          clearTimeout(timeout);
          this.jobCallbacks.delete(jobId);
          resolve(job.result);
        } else if (job.state === "FAILED" || job.state === "ABORTED") {
          clearTimeout(timeout);
          this.jobCallbacks.delete(jobId);
          reject(new TrueNASError(-1, job.error || `Job ${job.state}`, undefined, job.exception));
        }
      });
    });
  }

  private rejectAllPending(reason: string): void {
    for (const [id, pending] of this.pendingCalls) {
      clearTimeout(pending.timeout);
      pending.reject(new Error(reason));
    }
    this.pendingCalls.clear();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.connect();
      } catch {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
        this.scheduleReconnect();
      }
    }, this.reconnectDelay);
  }

  async close(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.rejectAllPending("Client closing");
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

let client: TrueNASClient | null = null;

export function getTrueNASClient(): TrueNASClient {
  if (!client) {
    const host = process.env.TRUENAS_HOST;
    const apiKey = process.env.TRUENAS_API_KEY;
    if (!host || !apiKey) {
      throw new Error("TRUENAS_HOST and TRUENAS_API_KEY environment variables are required");
    }
    const verifySsl = process.env.TRUENAS_VERIFY_SSL === "true";
    client = new TrueNASClient({
      host,
      apiKey,
      secure: process.env.TRUENAS_SECURE !== "false",
      verifySsl,
    });
  }
  return client;
}
