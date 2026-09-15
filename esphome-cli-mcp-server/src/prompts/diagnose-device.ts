import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDiagnoseDevicePrompt(server: McpServer): void {
  server.prompt(
    "diagnose-device",
    "Diagnose issues with an ESPHome device",
    { device: z.string().describe("Device name (without .yaml extension)") },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Diagnose issues with ESPHome device "${args.device}". Follow these steps:

1. Use validate_config to check if the device configuration is valid
2. Use compile_device to attempt a firmware compilation and check for errors
3. Use device_logs to check recent device logs for errors or warnings
4. Summarize findings: Is the configuration valid? Does it compile? Any runtime errors?
5. If there are issues, suggest specific remediation steps`,
          },
        },
      ],
    })
  );
}
