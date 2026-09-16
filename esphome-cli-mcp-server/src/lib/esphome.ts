import { executeAuto } from "@geoffmyers/mcp-server-shared";
import type { ServerConfig, ExecutorOptions, ExecutorResult } from "@geoffmyers/mcp-server-shared";

const container = process.env.ESPHOME_CONTAINER || "esphome";

/**
 * Execute an esphome CLI command inside the ESPHome container via docker exec.
 * Targets a standalone docker-compose deployment by default (container name
 * `esphome`). Override with ESPHOME_CONTAINER for HAOS add-on installs
 * (typically `addon_5c53de3b_esphome`).
 */
export function executeEsphome(
  config: ServerConfig,
  args: string[],
  options?: ExecutorOptions
): Promise<ExecutorResult> {
  return executeAuto(config, "docker", ["exec", container, "esphome", ...args], options);
}

/**
 * Execute an arbitrary command inside the ESPHome container. Used by
 * list_devices / the devices resource to run `ls` against the container's
 * view of ESPHOME_CONFIG_DIR — running it on the host is only correct when
 * the host and container share a path, which is not guaranteed.
 */
export function executeInContainer(
  config: ServerConfig,
  args: string[],
  options?: ExecutorOptions
): Promise<ExecutorResult> {
  return executeAuto(config, "docker", ["exec", container, ...args], options);
}
