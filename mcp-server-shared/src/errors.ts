export class McpToolError extends Error {
  constructor(
    message: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = "McpToolError";
  }
}

export function formatErrorForMcp(
  error: unknown
): { isError: true; content: Array<{ type: "text"; text: string }> } {
  if (error instanceof McpToolError) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error: ${error.message}${error.details ? ` - ${error.details}` : ""}`,
        },
      ],
    };
  }
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
      },
    ],
  };
}
