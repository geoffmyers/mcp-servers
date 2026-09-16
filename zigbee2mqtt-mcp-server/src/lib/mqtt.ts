import mqtt from "mqtt";
import { execFile } from "node:child_process";
import type { ExecutorResult } from "@geoffmyers/mcp-server-shared";

export interface MqttConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

export function getMqttConfig(): MqttConfig {
  return {
    host: process.env.MQTT_HOST || "localhost",
    port: parseInt(process.env.MQTT_PORT || "1883", 10),
    user: process.env.MQTT_USER || "",
    password: process.env.MQTT_PASSWORD || "",
  };
}

function brokerUrl(config: MqttConfig): string {
  return `mqtt://${config.host}:${config.port}`;
}

function connectOptions(config: MqttConfig): mqtt.IClientOptions {
  return {
    username: config.user,
    password: config.password,
    connectTimeout: 10_000,
  };
}

export async function mqttPublish(
  config: MqttConfig,
  topic: string,
  payload: string
): Promise<ExecutorResult> {
  let client: mqtt.MqttClient | undefined;
  try {
    client = await mqtt.connectAsync(brokerUrl(config), connectOptions(config));
    await client.publishAsync(topic, payload);
    await client.endAsync();
    return { stdout: "", stderr: "", exitCode: 0 };
  } catch (error) {
    if (client) try { await client.endAsync(true); } catch {}
    return { stdout: "", stderr: String(error), exitCode: 1 };
  }
}

export async function mqttSubscribeOne(
  config: MqttConfig,
  topic: string,
  timeoutSeconds: number = 10
): Promise<ExecutorResult> {
  // The npm `mqtt` client does not reliably deliver retained messages against
  // Mosquitto 2.0.20 in this environment — subscribes hang past the timeout
  // even though `mosquitto_sub` receives the retained payload in under a
  // second. Shell out to `mosquitto_sub -C 1` so retain delivery is handled
  // by the upstream C client.
  return new Promise<ExecutorResult>((resolve) => {
    execFile(
      "mosquitto_sub",
      [
        "-h", config.host,
        "-p", String(config.port),
        "-u", config.user,
        "-P", config.password,
        "-t", topic,
        "-W", String(timeoutSeconds),
        "-C", "1",
      ],
      { timeout: (timeoutSeconds + 2) * 1000, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error && stdout.length === 0) {
          const stderrText = stderr?.toString() || "";
          resolve({
            stdout: "",
            stderr: stderrText || "MQTT subscribe timed out",
            exitCode: 1,
          });
          return;
        }
        resolve({ stdout: stdout.toString(), stderr: stderr.toString(), exitCode: 0 });
      }
    );
  });
}

export async function mqttRequestResponse(
  config: MqttConfig,
  requestTopic: string,
  responseTopic: string,
  payload: string,
  timeoutSeconds: number = 10
): Promise<ExecutorResult> {
  let client: mqtt.MqttClient | undefined;
  try {
    client = await mqtt.connectAsync(brokerUrl(config), connectOptions(config));
    await client.subscribeAsync(responseTopic);

    return new Promise<ExecutorResult>((resolve) => {
      const timer = setTimeout(() => {
        client?.end(true);
        resolve({ stdout: "", stderr: "MQTT request timed out", exitCode: 1 });
      }, timeoutSeconds * 1000);

      client!.on("message", (_topic, message) => {
        clearTimeout(timer);
        client?.end(true);
        resolve({ stdout: message.toString(), stderr: "", exitCode: 0 });
      });

      // Small delay before publishing to ensure subscription is active
      setTimeout(() => {
        client?.publish(requestTopic, payload);
      }, 200);
    });
  } catch (error) {
    if (client) try { client.end(true); } catch {}
    return { stdout: "", stderr: String(error), exitCode: 1 };
  }
}
