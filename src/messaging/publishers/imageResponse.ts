/**
 * Image response message publisher
 *
 * @module messaging/publishers/imageResponse
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";

/**
 * Image response message type
 */
export interface ImageResponse extends BaseMessage {
  __typename: "ImageResponse";
  url: string;
  alt?: string;
}

/**
 * ImageResponsePublisher - Handles image response messages
 */
export class ImageResponsePublisher extends BasePublisher {
  /**
   * Publishes an image response message
   *
   * @param url - The image URL
   * @param alt - Optional alt text for the image
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishImageResponse(
    url: string,
    alt: string | undefined,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const imageResponse: ImageResponse = {
      ...this.createBaseMessage(baseMessage),
      __typename: "ImageResponse",
      url,
      alt,
    };

    await this.publish(imageResponse, options);
  }
}
