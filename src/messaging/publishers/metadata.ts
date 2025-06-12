/**
 * Metadata message publisher
 *
 * @module messaging/publishers/metadata
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";

/**
 * Metadata message type
 */
export interface Metadata extends BaseMessage {
  __typename: "Metadata";
  message: string;
}

/**
 * MetadataPublisher - Handles metadata messages
 */
export class MetadataPublisher extends BasePublisher {
  /**
   * Publishes a metadata message
   *
   * @param message - The metadata message text
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishMetadata(
    message: string,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const metadata: Metadata = {
      ...this.createBaseMessage(baseMessage),
      __typename: "Metadata",
      message,
    };

    await this.publish(metadata, options);
  }
}
