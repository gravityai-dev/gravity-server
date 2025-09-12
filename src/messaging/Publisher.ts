/**
 * Publisher for Gravity AI
 *
 * Handles publishing messages to Redis channels.
 * This is the client-facing publisher that external services use.
 *
 * Key features:
 * - Simple API for publishing to channels
 * - Automatic connection management
 * - Support for Redis credentials-based initialization
 *
 * Usage:
 * ```typescript
 * const publisher = Publisher.fromRedisCredentials({
 *   host: 'localhost',
 *   port: 6379,
 *   password: 'your-password'
 * }, 'my-service');
 * await publisher.publishEvent('channel', { data: 'hello' });
 * ```
 */

import Redis from "ioredis";
import { RedisOptions, getStandardConnection, getOptionsFromConfig } from "../RedisManager";
import { SYSTEM_CHANNEL } from "../types";

export class Publisher {
  private redis: Redis;
  private providerId: string;

  constructor(options: RedisOptions, providerId: string) {
    // Use connection pooling from RedisManager
    this.redis = getStandardConnection(options);
    this.providerId = providerId;
  }

  static fromRedisCredentials(redisOptions: RedisOptions, providerId: string): Publisher {
    return new Publisher(redisOptions, providerId);
  }

  static fromConfig(
    host: string,
    port: number,
    password: string | undefined,
    providerId: string,
    username?: string,
    db?: number,
    token?: string,
    tls?: boolean
  ): Publisher {
    const redisOptions = getOptionsFromConfig(host, port, username, password, token);
    if (tls !== undefined) {
      (redisOptions as any).tls = tls;
    }

    return new Publisher(redisOptions, providerId);
  }

  getProviderId(): string {
    return this.providerId;
  }

  getRedisConnection(): Redis {
    return this.redis;
  }

  /**
   * Publish system-level events
   * Used by EventBus and system services
   */
  async publishSystem(message: any): Promise<void> {
    await this.redis.publish(SYSTEM_CHANNEL, JSON.stringify(message));
  }

  /**
   * Publish to arbitrary event channels
   * Used by EventBus, n8n resolver, and health monitor
   */
  async publishEvent(eventType: string, payload: any): Promise<void> {
    await this.redis.publish(eventType, JSON.stringify(payload));
  }

  async disconnect(): Promise<void> {
    // Don't close shared connections - they're managed by RedisManager
    // Just clear our reference
    this.redis = null as any;
  }
}
