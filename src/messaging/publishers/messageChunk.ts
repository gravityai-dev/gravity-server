/**
 * MessageChunk publisher
 *
 * Handles publishing of message chunk updates to Redis channels
 */

import { BasePublisher, PublishOptions } from "./base";
import { BaseMessage } from "../types";
import { Publisher } from "../Publisher";

/**
 * MessageChunk message structure
 */
export interface MessageChunk extends BaseMessage {
  __typename: "MessageChunk";
  text: string;
}

/**
 * Publisher for message chunks
 */
export class MessageChunkPublisher extends BasePublisher {
  /**
   * Publishes a message chunk
   *
   * @param text - The text content of the chunk
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishMessageChunk(text: string, baseMessage: Partial<BaseMessage>, options?: PublishOptions): Promise<void> {
    // Validate text is not null/empty since GraphQL schema requires non-nullable text
    if (!text || text.trim() === "") {
      console.warn("[MessageChunkPublisher] Skipping publish - text is null or empty:", { text, baseMessage });
      return;
    }

    const messageChunk: MessageChunk = {
      ...this.createBaseMessage(baseMessage),
      __typename: "MessageChunk",
      text,
    };

    await this.publish(messageChunk, options);
  }
}

// Singleton instance for maximum performance
let messageChunkPublisherInstance: MessageChunkPublisher | null = null;

/**
 * Get singleton MessageChunkPublisher instance
 * Maximum performance - no new objects created after first call
 *
 * @param host - Redis host (required on first call)
 * @param port - Redis port (required on first call)
 * @param password - Redis password (required on first call)
 * @param providerId - Provider ID (required on first call)
 * @param username - Redis username (optional)
 * @param db - Redis database number (optional)
 * @returns Singleton MessageChunkPublisher instance
 */
export function getMessageChunkPublisher(
  host?: string,
  port?: number,
  password?: string,
  providerId?: string,
  username?: string,
  db?: number
): MessageChunkPublisher {
  if (!messageChunkPublisherInstance) {
    if (!host || !port || password === undefined || !providerId) {
      console.error("[ERROR] MessageChunkPublisher missing required parameters:", {
        hasHost: !!host,
        hasPort: !!port,
        hasPassword: password !== undefined,
        hasProviderId: !!providerId,
      });
      throw new Error("MessageChunkPublisher requires host, port, password, and providerId on first call");
    }

    console.log("[DEBUG] Creating new MessageChunkPublisher instance with Redis config:", {
      host,
      port,
      providerId,
    });

    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db);
    messageChunkPublisherInstance = new MessageChunkPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  } else {
    console.log("[DEBUG] Returning existing MessageChunkPublisher instance");
  }

  return messageChunkPublisherInstance;
}
