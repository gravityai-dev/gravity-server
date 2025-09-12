/**
 * JSON data message publisher
 *
 * @module messaging/publishers/jsonData
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";
import { Publisher } from "../Publisher";

/**
 * JSON data message type
 */
export interface JsonData extends BaseMessage {
  __typename: "JsonData";
  component: {
    type: "jsonData";
    props: any; // Accept any JSON structure
  };
}

/**
 * JsonDataPublisher - Handles JSON data messages
 */
export class JsonDataPublisher extends BasePublisher {
  /**
   * Publishes a JSON data message
   *
   * @param data - The JSON data to publish
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishJsonData(
    data: any,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const jsonMessage: JsonData = {
      ...this.createBaseMessage(baseMessage),
      __typename: "JsonData",
      component: {
        type: "jsonData",
        props: data, // Pass through any JSON structure directly
      },
    };

    await this.publish(jsonMessage as any, options);
  }
}

// Singleton instance for maximum performance
let jsonDataPublisherInstance: JsonDataPublisher | null = null;

/**
 * Get singleton JsonDataPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param host - Redis host (required on first call)
 * @param port - Redis port (required on first call)
 * @param password - Redis password (required on first call)
 * @param providerId - Provider ID (required on first call)
 * @param username - Redis username (optional)
 * @param db - Redis database number (optional)
 * @returns Singleton JsonDataPublisher instance
 */
export function getJsonDataPublisher(
  host?: string, 
  port?: number, 
  password?: string, 
  providerId?: string, 
  username?: string, 
  db?: number,
  token?: string,
  tls?: boolean
): JsonDataPublisher {
  if (!jsonDataPublisherInstance) {
    if (!host || !port || (password === undefined && !token) || !providerId) {
      throw new Error('JsonDataPublisher requires host, port, password/token, and providerId on first call');
    }
    
    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db, token, tls);
    jsonDataPublisherInstance = new JsonDataPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }

  return jsonDataPublisherInstance;
}
