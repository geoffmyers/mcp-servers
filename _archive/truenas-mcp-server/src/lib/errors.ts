export class TrueNASError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly reason?: string,
    public readonly trace?: unknown,
    public readonly extra?: unknown
  ) {
    super(message);
    this.name = "TrueNASError";
  }

  static fromJsonRpc(error: {
    code: number;
    message: string;
    data?: { reason?: string; error?: string; trace?: unknown; extra?: unknown };
  }): TrueNASError {
    return new TrueNASError(
      error.code,
      error.data?.error || error.message,
      error.data?.reason,
      error.data?.trace,
      error.data?.extra
    );
  }
}

export function formatErrorForMcp(error: unknown): { isError: true; content: Array<{ type: "text"; text: string }> } {
  if (error instanceof TrueNASError) {
    return {
      isError: true,
      content: [{ type: "text", text: `TrueNAS API Error (${error.code}): ${error.message}${error.reason ? ` - ${error.reason}` : ""}` }],
    };
  }
  return {
    isError: true,
    content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
  };
}
