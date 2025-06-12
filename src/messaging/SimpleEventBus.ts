/**
 * Simple Event Bus for Gravity AI
 */

import { v4 as uuid } from "uuid";
import Redis from "ioredis";
import { RedisOptions, getOptionsFromCredentials, getPubSubConnection } from "../RedisManager";
import { GravityMessage } from "../types";
import { Publisher } from "./Publisher";

export type EventHandler<T = any> = (event: T) => void | Promise<void>;

export class EventBus {
  private publisher: Publisher;
  private subscriber: Redis;
  private handlers = new Map<string, Set<EventHandler>>();

  constructor(private options: RedisOptions, private serviceId: string) {
    this.publisher = new Publisher(options, serviceId);
    this.subscriber = getPubSubConnection(options);
    this.setupSubscriber();
  }

  static fromCredentials(serverUrl: string, apiKey: string, serviceId: string): EventBus {
    const options = getOptionsFromCredentials(serverUrl, apiKey);
    return new EventBus(options, serviceId);
  }

  static fromPublisher(publisher: Publisher): EventBus {
    console.log(`[EventBus DEBUG] Creating EventBus from publisher...`);

    // Extract providerId from the publisher
    const serviceId = publisher.getProviderId();
    console.log(`[EventBus DEBUG] Using serviceId: ${serviceId} from publisher`);

    // IMPORTANT: Don't reuse the publisher's Redis connection
    // This causes "Connection in subscriber mode" errors
    // Instead, extract connection options and create new connections
    const redisConnection = publisher.getRedisConnection();
    console.log(`[EventBus DEBUG] Got Redis connection from publisher: ${redisConnection ? "success" : "failed"}`);

    if (!redisConnection) {
      throw new Error("Cannot create EventBus: Publisher does not expose Redis connection");
    }

    // Construct options from Redis connection
    const options = {
      host: redisConnection.options.host || "localhost",
      port: redisConnection.options.port || 6379,
      password: redisConnection.options.password || "",
    };
    console.log(
      `[EventBus DEBUG] Created connection options for new EventBus: ${JSON.stringify({
        host: options.host,
        port: options.port,
        passwordProvided: !!options.password,
      })}`
    );

    console.log(`[EventBus DEBUG] Creating new EventBus with fresh connections...`);
    return new EventBus(options, serviceId);
  }

  private setupSubscriber(): void {
    this.subscriber.on("message", (channel: string, message: string) => {
      const handlers = this.handlers.get(channel);
      if (!handlers || handlers.size === 0) return;

      try {
        const event = JSON.parse(message);
        handlers.forEach(handler => {
          try {
            handler(event);
          } catch (error) {
            console.error(`[EventBus] Handler error on channel ${channel}:`, error);
          }
        });
      } catch (error) {
        console.error(`[EventBus] Failed to parse message on channel ${channel}:`, error);
      }
    });
  }

  async publish(channel: string, payload: any): Promise<void> {
    // Use the event channel pattern from Publisher
    await this.publisher.publishEvent(channel, payload);
  }

  async subscribe<T = any>(channel: string, handler: EventHandler<T>): Promise<() => Promise<void>> {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
      await this.subscriber.subscribe(channel);
    }

    this.handlers.get(channel)!.add(handler);

    return async () => {
      const handlers = this.handlers.get(channel);
      if (!handlers) return;

      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(channel);
        await this.subscriber.unsubscribe(channel);
      }
    };
  }

  async disconnect(): Promise<void> {
    await Promise.all([
      this.publisher.disconnect(),
      this.subscriber.quit()
    ]);
  }
}
