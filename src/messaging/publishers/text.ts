/**
 * Text message publisher
 *
 * @module messaging/publishers/text
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";
import { Publisher } from "../Publisher";

/**
 * Text message type
 */
export interface Text extends BaseMessage {
  __typename: "Text";
  text: string;
}

/**
 * TextPublisher - Handles text messages
 */
export class TextPublisher extends BasePublisher {
  /**
   * Publishes a text message
   *
   * @param text - The text content
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishText(
    text: string,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const textMessage: Text = {
      ...this.createBaseMessage(baseMessage),
      __typename: "Text",
      text,
    };

    await this.publish(textMessage, options);
  }
}

// Singleton instance for maximum performance
let textPublisherInstance: TextPublisher | null = null;

/**
 * Get singleton TextPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param serverUrl - Server URL (required on first call)
 * @param apiKey - API key (required on first call) 
 * @param providerId - Provider ID (required on first call)
 * @returns Singleton TextPublisher instance
 */
export function getTextPublisher(serverUrl?: string, apiKey?: string, providerId?: string): TextPublisher {
  if (!textPublisherInstance) {
    if (!serverUrl || !apiKey || !providerId) {
      throw new Error('TextPublisher requires serverUrl, apiKey, and providerId on first call');
    }
    
    const publisher = Publisher.fromCredentials(serverUrl, apiKey, providerId);
    textPublisherInstance = new TextPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }
  
  return textPublisherInstance;
}
