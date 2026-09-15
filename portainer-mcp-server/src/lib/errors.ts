export class PortainerError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = "PortainerError";
  }
}

export function formatErrorForMcp(error: unknown): { isError: true; content: Array<{ type: "text"; text: string }> } {
  if (error instanceof PortainerError) {
    return {
      isError: true,
      content: [{ type: "text", text: `Portainer API Error (${error.statusCode}): ${error.message}${error.details ? ` - ${error.details}` : ""}` }],
    };
  }
  return {
    isError: true,
    content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
  };
}
