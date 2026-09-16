import { startStdio } from "./transports/stdio.js";
import { startStreamableHttp } from "./transports/streamableHttp.js";
import type { ServerFactoryResponse } from "./server.js";

export interface RunCliOptions {
  name: string;
  createServer: () => ServerFactoryResponse;
  defaultPort: number;
}

export async function runCli(options: RunCliOptions): Promise<void> {
  const transport = process.argv[2] || "stdio";

  switch (transport) {
    case "stdio":
      await startStdio(options.createServer);
      return;
    case "streamableHttp":
      await startStreamableHttp(options.createServer, options.defaultPort, options.name);
      return;
    default:
      console.error(`Usage: ${options.name} [stdio|streamableHttp]`);
      console.error(`Unknown transport: ${transport}`);
      process.exit(1);
  }
}
