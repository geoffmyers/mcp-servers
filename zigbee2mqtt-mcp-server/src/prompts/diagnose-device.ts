import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDiagnoseDevicePrompt(server: McpServer): void {
  server.prompt(
    "diagnose-device",
    "Diagnose issues with a specific Zigbee device",
    { friendly_name: z.string().describe("The friendly name of the Zigbee device to diagnose") },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Diagnose the Zigbee device "${args.friendly_name}". Follow these steps:

1. Use list_devices to find the device and check its availability status
2. Use device_info to get detailed device configuration and options
3. Use get_device_state to check the current reported state
4. Use bridge_info to verify the Zigbee coordinator is healthy
5. Check if the device appears in the network_map and has a good link quality
6. If the device is offline, check container_logs for any related error messages
7. Summarize findings: Is the device reachable? Last seen time? Link quality?
8. If there are issues, suggest remediation steps (re-interview, move closer to coordinator, check batteries, etc.)`,
          },
        },
      ],
    })
  );
}
