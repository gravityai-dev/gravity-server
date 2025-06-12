/**
 * Base publisher functionality and types
 * 
 * This module provides the foundation for all publisher classes in the messaging system.
 * It includes the BasePublisher abstract class which handles core Redis connection
 * management and message publishing functionality.
 * 
 * @module messaging/publishers/base
 */

import Redis from "ioredis";
import { v4 as uuid } from "uuid";
import { BaseMessage } from "../types";
import { GravityMessage, MessageType, AI_RESULT_CHANNEL } from "../../types";

/**
 * Options for publishing messages
 * 
 * @interface PublishOptions
 * @property {string} [channel] - Optional Redis channel to publish to. If not provided,
 *                                the publisher will use a default channel based on context.
 * 
 * @example
 * ```typescript
 * // Publish to a specific channel
 * const options: PublishOptions = {
 *   channel: "gravity:output"
 * };
 * ```
 */
export interface PublishOptions {
  channel?: string;
}

/**
 * Base publisher class with core functionality
 * 
 * This abstract class provides the foundation for all specialized publishers.
 * It manages the Redis connection, provider ID, and core publishing logic.
 * 
 * Key responsibilities:
 * - Maintain Redis connection for publishing
 * - Store and provide access to provider ID
 * - Create base messages with required fields
 * - Publish messages to Redis channels
 * 
 * @abstract
 * @class BasePublisher
 * 
 * @example
 * ```typescript
 * // Extend BasePublisher to create a specialized publisher
 * class MyPublisher extends BasePublisher {
 *   async publishCustomMessage(data: any): Promise<void> {
 *     const message = {
 *       ...this.createBaseMessage({ 
 *         chatId: "chat123",
 *         conversationId: "conv456",
 *         userId: "user789"
 *       }),
 *       data
 *     };
 *     await this.publish(message, "my:channel");
 *   }
 * }
 * 
 * // Use the publisher
 * const redis = new Redis();
 * const publisher = new MyPublisher(redis, "my-service");
 * await publisher.publishCustomMessage({ foo: "bar" });
 * ```
 */
export abstract class BasePublisher {
  /**
   * Redis connection used for publishing messages
   * @protected
   */
  protected redis: Redis;

  /**
   * Provider ID identifying the service using this publisher
   * @protected
   */
  protected providerId: string;

  /**
   * Creates a new BasePublisher instance
   * 
   * @param {Redis} redis - Redis connection instance for publishing
   * @param {string} providerId - Unique identifier for the service/provider
   * 
   * @example
   * ```typescript
   * const redis = new Redis({
   *   host: "localhost",
   *   port: 6379
   * });
   * const publisher = new MyPublisher(redis, "my-service");
   * ```
   */
  constructor(redis: Redis, providerId: string) {
    this.redis = redis;
    this.providerId = providerId;
  }

  /**
   * Gets the provider ID for the publisher
   * 
   * This method is used by other components (like EventBus) to access
   * the provider ID when creating related instances.
   * 
   * @returns {string} The provider ID
   * 
   * @example
   * ```typescript
   * const providerId = publisher.getProviderId();
   * console.log(`Publisher provider: ${providerId}`);
   * ```
   */
  getProviderId(): string {
    return this.providerId;
  }

  /**
   * Gets the Redis connection for the publisher
   * 
   * This method exposes the Redis connection for use by other components
   * that need to create their own connections with the same configuration.
   * 
   * @returns {Redis} The Redis connection instance
   * 
   * @example
   * ```typescript
   * const redis = publisher.getRedisConnection();
   * const options = {
   *   host: redis.options.host,
   *   port: redis.options.port
   * };
   * ```
   */
  getRedisConnection(): Redis {
    return this.redis;
  }

  /**
   * Creates a base message with the given partial data
   * 
   * This method constructs a complete BaseMessage by merging provided fields
   * with defaults. It ensures all required fields are present and validates
   * that chatId, conversationId, and userId are provided.
   * 
   * @protected
   * @param {Partial<BaseMessage>} partial - Partial message data to merge with defaults
   * @returns {BaseMessage} Complete base message with all required fields
   * @throws {Error} If chatId, conversationId, or userId are missing
   * 
   * @example
   * ```typescript
   * const baseMessage = this.createBaseMessage({
   *   chatId: "chat123",
   *   conversationId: "conv456",
   *   userId: "user789",
   *   type: MessageType.TEXT
   * });
   * // Result: {
   * //   id: "generated-uuid",
   * //   chatId: "chat123",
   * //   conversationId: "conv456", 
   * //   userId: "user789",
   * //   providerId: "my-service",
   * //   timestamp: "2023-12-08T10:30:00.000Z",
   * //   type: MessageType.TEXT
   * // }
   * ```
   */
  protected createBaseMessage(partial: Partial<BaseMessage>): BaseMessage {
    if (!partial.chatId || !partial.conversationId || !partial.userId) {
      throw new Error("chatId, conversationId, and userId are required");
    }
    return {
      id: partial.id || uuid(),
      chatId: partial.chatId,
      conversationId: partial.conversationId,
      userId: partial.userId,
      providerId: partial.providerId || this.providerId,
      timestamp: partial.timestamp || new Date().toISOString(),
      type: partial.type || MessageType.TEXT,
    };
  }

  /**
   * Publishes a message to the given channel
   * 
   * This method serializes the message to JSON and publishes it to the
   * specified Redis channel. This is the core publishing mechanism used
   * by all specialized publishers.
   * 
   * @protected
   * @param {GravityMessage} message - The message object to publish
   * @param {PublishOptions} [options] - Optional publishing options
   * @returns {Promise<void>} Promise that resolves when message is published
   * 
   * @example
   * ```typescript
   * const message = {
   *   __typename: "Text",
   *   text: "Hello, world!",
   *   ...baseMessage
   * };
   * await this.publish(message, { channel: "custom:channel" });
   * ```
   */
  protected async publish(
    message: GravityMessage,
    options?: PublishOptions
  ): Promise<void> {
    const channel = options?.channel || AI_RESULT_CHANNEL;
    await this.redis.publish(channel, JSON.stringify(message));
  }
}
