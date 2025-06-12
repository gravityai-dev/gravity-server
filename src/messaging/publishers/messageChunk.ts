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
  async publishMessageChunk(
    text: string,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    // Validate text is not null/empty since GraphQL schema requires non-nullable text
    if (!text || text.trim() === '') {
      console.warn('[MessageChunkPublisher] Skipping publish - text is null or empty:', { text, baseMessage });
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
 * @param serverUrl - Server URL (required on first call)
 * @param apiKey - API key (required on first call) 
 * @param providerId - Provider ID (required on first call)
 * @returns Singleton MessageChunkPublisher instance
 */
export function getMessageChunkPublisher(serverUrl?: string, apiKey?: string, providerId?: string): MessageChunkPublisher {
  if (!messageChunkPublisherInstance) {
    if (!serverUrl || !apiKey || !providerId) {
      throw new Error('MessageChunkPublisher requires serverUrl, apiKey, and providerId on first call');
    }
    
    const publisher = Publisher.fromCredentials(serverUrl, apiKey, providerId);
    messageChunkPublisherInstance = new MessageChunkPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }
  
  return messageChunkPublisherInstance;
}
