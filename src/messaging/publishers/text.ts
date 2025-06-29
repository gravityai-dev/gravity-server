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
 * @param host - Redis host (required on first call)
 * @param port - Redis port (required on first call)
 * @param password - Redis password (required on first call)
 * @param providerId - Provider ID (required on first call)
 * @param username - Redis username (optional)
 * @param db - Redis database number (optional)
 * @returns Singleton TextPublisher instance
 */
export function getTextPublisher(
  host?: string, 
  port?: number, 
  password?: string, 
  providerId?: string, 
  username?: string, 
  db?: number
): TextPublisher {
  if (!textPublisherInstance) {
    if (!host || !port || password === undefined || !providerId) {
      throw new Error('TextPublisher requires host, port, password, and providerId on first call');
    }
    
    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db);
    textPublisherInstance = new TextPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }

  return textPublisherInstance;
}
