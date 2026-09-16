import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSystemTools } from "./system.js";
import { registerPoolTools } from "./pool.js";
import { registerDatasetTools } from "./dataset.js";
import { registerSnapshotTools } from "./snapshot.js";
import { registerSmbTools } from "./sharing-smb.js";
import { registerNfsTools } from "./sharing-nfs.js";
import { registerServiceTools } from "./service.js";
import { registerAppTools } from "./app.js";
import { registerAlertTools } from "./alert.js";
import { registerDiskTools } from "./disk.js";
import { registerUserTools } from "./user.js";
import { registerCronTools } from "./cron.js";
import { registerBootTools } from "./boot.js";

export function registerTools(server: McpServer): void {
  registerSystemTools(server);
  registerPoolTools(server);
  registerDatasetTools(server);
  registerSnapshotTools(server);
  registerSmbTools(server);
  registerNfsTools(server);
  registerServiceTools(server);
  registerAppTools(server);
  registerAlertTools(server);
  registerDiskTools(server);
  registerUserTools(server);
  registerCronTools(server);
  registerBootTools(server);
}
