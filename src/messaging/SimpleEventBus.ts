/**
 * Simple Event Bus for Gravity AI
 */

import { v4 as uuid } from "uuid";
import Redis from "ioredis";
import { RedisOptions, getPubSubConnection } from "../RedisManager";
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

  static fromRedisConfig(host: string, port: number, password: string | undefined, serviceId: string, username?: string, db?: number): EventBus {
    const options = {
      host,
      port,
      password,
      username,
      db: db || 0,
    };
    return new EventBus(options, serviceId);
  }

  static fromCredentials(host: string, port: number, password: string | undefined, serviceId: string): EventBus {
    return EventBus.fromRedisConfig(host, port, password, serviceId);
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
