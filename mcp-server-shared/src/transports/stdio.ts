import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { ServerFactoryResponse } from "../server.js";

export async function startStdio(
  createServer: () => ServerFactoryResponse
): Promise<void> {
  const transport = new StdioServerTransport();
  const { server, cleanup } = createServer();

  await server.connect(transport);

  process.on("SIGINT", async () => {
    await server.close();
    cleanup();
    process.exit(0);
  });
}
