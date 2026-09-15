import mqtt from "mqtt";
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
  let client: mqtt.MqttClient | undefined;
  try {
    client = await mqtt.connectAsync(brokerUrl(config), connectOptions(config));
    await client.subscribeAsync(topic);

    return new Promise<ExecutorResult>((resolve) => {
      const timer = setTimeout(() => {
        client?.end(true);
        resolve({ stdout: "", stderr: "MQTT subscribe timed out", exitCode: 1 });
      }, timeoutSeconds * 1000);

      client!.on("message", (_topic, message) => {
        clearTimeout(timer);
        client?.end(true);
        resolve({ stdout: message.toString(), stderr: "", exitCode: 0 });
      });
    });
  } catch (error) {
    if (client) try { client.end(true); } catch {}
    return { stdout: "", stderr: String(error), exitCode: 1 };
  }
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
