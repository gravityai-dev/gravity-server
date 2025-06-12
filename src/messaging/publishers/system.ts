/**
 * System message publisher
 *
 * @module messaging/publishers/system
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";
import { Publisher } from "../Publisher";

/**
 * System message interface
 */
export interface SystemMessage extends BaseMessage {
  __typename: "SystemMessage";
  message: string;
  level: "info" | "warning" | "error";
}

/**
 * SystemPublisher - Handles system messages
 * 
 * System messages are used for service-level notifications, errors, and warnings
 * that need to be communicated to users or other services.
 * 
 * @example
 * ```typescript
 * const publisher = new SystemPublisher(redis);
 * 
 * // Publish a system message
 * await publisher.publishSystemMessage("Service started", "info", {
 *   chatId: "chat123",
 *   conversationId: "conv123",
 *   userId: "user456"
 * });
 * ```
 */
export class SystemPublisher extends BasePublisher {
  /**
   * Publishes a system message
   * 
   * System messages are used for service notifications, errors, and warnings.
   * 
   * @param message - The system message text
   * @param level - The message level (info, warning, or error)
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param options - Optional publishing options (e.g., custom channel)
   * @returns Promise that resolves when message is published
   * 
   * @example
   * ```typescript
   * // Service startup notification
   * await publisher.publishSystemMessage("Service started", "info", {
   *   chatId: "chat123",
   *   conversationId: "conv123",
   *   userId: "user456"
   * });
   * 
   * // Error notification
   * await publisher.publishSystemMessage("Database connection failed", "error", {
   *   chatId: "chat123",
   *   conversationId: "conv123",
   *   userId: "user456"
   * });
   * ```
   */
  async publishSystemMessage(
    message: string,
    level: "info" | "warning" | "error",
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const systemMessage: SystemMessage = {
      ...this.createBaseMessage(baseMessage),
      __typename: "SystemMessage",
      message,
      level,
    };

    await this.publish(systemMessage, options);
  }
}

// Singleton instance for maximum performance
let systemPublisherInstance: SystemPublisher | null = null;

/**
 * Get singleton SystemPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param serverUrl - Server URL (required on first call)
 * @param apiKey - API key (required on first call) 
 * @param providerId - Provider ID (required on first call)
 * @returns Singleton SystemPublisher instance
 */
export function getSystemPublisher(serverUrl?: string, apiKey?: string, providerId?: string): SystemPublisher {
  if (!systemPublisherInstance) {
    if (!serverUrl || !apiKey || !providerId) {
      throw new Error('SystemPublisher requires serverUrl, apiKey, and providerId on first call');
    }
    
    const publisher = Publisher.fromCredentials(serverUrl, apiKey, providerId);
    systemPublisherInstance = new SystemPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }
  
  return systemPublisherInstance;
}
