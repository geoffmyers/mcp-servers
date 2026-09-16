import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSystemTools } from "./system.js";
import { registerPoolTools } from "./pool.js";
import { registerDatasetTools } from "./dataset.js";
import { registerSnapshotTools } from "./snapshot.js";
import { registerSmbTools } from "./sharing-smb.js";
import { registerNfsTools } from "./sharing-nfs.js";
import { registerServiceTools } from "./service.js";
import { registerIscsiTools } from "./sharing-iscsi.js";
import { registerAppTools } from "./app.js";
import { registerVmTools } from "./vm.js";
import { registerUserTools } from "./user.js";
import { registerReplicationTools } from "./replication.js";
import { registerSnapshotTaskTools } from "./snapshot-task.js";

export function registerTools(server: McpServer): void {
  registerSystemTools(server);
  registerPoolTools(server);
  registerDatasetTools(server);
  registerSnapshotTools(server);
  registerSmbTools(server);
  registerNfsTools(server);
  registerServiceTools(server);
  registerIscsiTools(server);
  registerAppTools(server);
  registerVmTools(server);
  registerUserTools(server);
  registerReplicationTools(server);
  registerSnapshotTaskTools(server);
}
