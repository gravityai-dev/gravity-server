/**
 * Image response message publisher
 *
 * @module messaging/publishers/imageResponse
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";
import { Publisher } from "../Publisher";

/**
 * Image response message type
 */
export interface ImageResponse extends BaseMessage {
  __typename: "ImageResponse";
  component: {
    type: "ImageResponse";
    props: {
      url: string;
      alt?: string;
    };
  };
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
      component: {
        type: "ImageResponse",
        props: {
          url,
          alt,
        },
      },
    };

    await this.publish(imageResponse as any, options);
  }
}

// Singleton instance for maximum performance
let imageResponsePublisherInstance: ImageResponsePublisher | null = null;

/**
 * Get singleton ImageResponsePublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param host - Redis host (required on first call)
 * @param port - Redis port (required on first call)
 * @param password - Redis password (required on first call)
 * @param providerId - Provider ID (required on first call)
 * @param username - Redis username (optional)
 * @param db - Redis database number (optional)
 * @returns Singleton ImageResponsePublisher instance
 */
export function getImageResponsePublisher(
  host?: string, 
  port?: number, 
  password?: string, 
  providerId?: string, 
  username?: string, 
  db?: number
): ImageResponsePublisher {
  if (!imageResponsePublisherInstance) {
    if (!host || !port || password === undefined || !providerId) {
      throw new Error('ImageResponsePublisher requires host, port, password, and providerId on first call');
    }
    
    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db);
    imageResponsePublisherInstance = new ImageResponsePublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }

  return imageResponsePublisherInstance;
}
