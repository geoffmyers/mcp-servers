#!/usr/bin/env node
import { runCli } from "@geoffmyers/mcp-server-shared";
import { createServer } from "./server/index.js";

await runCli({ name: "mcp-server-homeassistant-cli", createServer, defaultPort: 3021 });
