/**
 * MessageChunk publisher
 *
 * Handles publishing of message chunk updates to Redis channels
 */

import { BasePublisher, PublishOptions } from "./base";
import { BaseMessage } from "../types";
import { Publisher } from "../Publisher";

/**
 * MessageChunk message type
 */
export interface MessageChunk extends BaseMessage {
  __typename: "MessageChunk";
  component: {
    type: "MessageChunk";
    props: {
      text: string;
      index?: number;
    };
  };
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
   * @param index - Optional sequence index for ordering
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishMessageChunk(
    text: string,
    baseMessage: Partial<BaseMessage>,
    index?: number,
    options?: PublishOptions
  ): Promise<void> {
    // No text validation - allow all characters including spaces, newlines, and markdown formatting
    // Only skip if text is null or undefined (TypeScript should prevent this anyway)

    const messageChunk: MessageChunk = {
      ...this.createBaseMessage(baseMessage),
      __typename: "MessageChunk",
      component: {
        type: "MessageChunk",
        props: {
          text,
          index,
        },
      },
    };

    await this.publish(messageChunk as any, options);
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
  db?: number,
  token?: string,
  tls?: boolean
): MessageChunkPublisher {
  if (!messageChunkPublisherInstance) {
    if (!host || !port || (password === undefined && !token) || !providerId) {
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

    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db, token, tls);
    messageChunkPublisherInstance = new MessageChunkPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  } else {
    console.log("[DEBUG] Returning existing MessageChunkPublisher instance");
  }

  return messageChunkPublisherInstance;
}
