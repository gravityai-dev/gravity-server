/**
 * Metadata message publisher
 *
 * @module messaging/publishers/metadata
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";
import { Publisher } from "../Publisher";

/**
 * Metadata message type
 */
export interface Metadata extends BaseMessage {
  __typename: "Metadata";
  component: {
    type: "Metadata";
    props: {
      message: string;
    };
  };
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
      component: {
        type: "Metadata",
        props: {
          message,
        },
      },
    };

    await this.publish(metadata as any, options);
  }
}

// Singleton instance for maximum performance
let metadataPublisherInstance: MetadataPublisher | null = null;

/**
 * Get singleton MetadataPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param host - Redis host (required on first call)
 * @param port - Redis port (required on first call)
 * @param password - Redis password (required on first call)
 * @param providerId - Provider ID (required on first call)
 * @param username - Redis username (optional)
 * @param db - Redis database number (optional)
 * @returns Singleton MetadataPublisher instance
 */
export function getMetadataPublisher(
  host?: string, 
  port?: number, 
  password?: string, 
  providerId?: string, 
  username?: string, 
  db?: number
): MetadataPublisher {
  if (!metadataPublisherInstance) {
    if (!host || !port || password === undefined || !providerId) {
      throw new Error('MetadataPublisher requires host, port, password, and providerId on first call');
    }
    
    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db);
    metadataPublisherInstance = new MetadataPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }

  return metadataPublisherInstance;
}
