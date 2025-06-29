/**
 * Progress update publisher
 *
 * Simple, focused publisher for progress update messages.
 *
 * @module messaging/publishers/progress
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";
import { Publisher } from "../Publisher";

/**
 * Progress update message type
 */
export interface ProgressUpdate extends BaseMessage {
  __typename: "ProgressUpdate";
  component: {
    type: "ProgressUpdate";
    props: {
      message: string;
      progress?: number;
    };
  };
}

/**
 * ProgressPublisher - Handles progress update messages
 */
export class ProgressPublisher extends BasePublisher {
  /**
   * Publishes a progress update
   *
   * @param message - The progress message text
   * @param progress - Optional progress percentage (0-100)
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishProgressUpdate(
    message: string,
    progress: number | undefined,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const progressUpdate: ProgressUpdate = {
      ...this.createBaseMessage(baseMessage),
      __typename: "ProgressUpdate",
      component: {
        type: "ProgressUpdate",
        props: {
          message,
          progress,
        },
      },
    };

    await this.publish(progressUpdate as any, options);
  }
}

// Singleton instance for maximum performance
let progressPublisherInstance: ProgressPublisher | null = null;

/**
 * Get singleton ProgressPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param host - Redis host (required on first call)
 * @param port - Redis port (required on first call)
 * @param password - Redis password (required on first call)
 * @param providerId - Provider ID (required on first call)
 * @param username - Redis username (optional)
 * @param db - Redis database number (optional)
 * @returns Singleton ProgressPublisher instance
 */
export function getProgressPublisher(
  host?: string, 
  port?: number, 
  password?: string, 
  providerId?: string, 
  username?: string, 
  db?: number
): ProgressPublisher {
  if (!progressPublisherInstance) {
    if (!host || !port || password === undefined || !providerId) {
      throw new Error('ProgressPublisher requires host, port, password, and providerId on first call');
    }
    
    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db);
    progressPublisherInstance = new ProgressPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }

  return progressPublisherInstance;
}
