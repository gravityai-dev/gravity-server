/**
 * Action suggestion message publisher
 *
 * @module messaging/publishers/actionSuggestion
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";
import { Publisher } from "../Publisher";

/**
 * Action suggestion message type
 */
export interface ActionSuggestion extends BaseMessage {
  __typename: "ActionSuggestion";
  component: {
    type: "ActionSuggestion";
    props: {
      actionType: string;
      payload: any;
    };
  };
}

/**
 * ActionSuggestionPublisher - Handles action suggestion messages
 */
export class ActionSuggestionPublisher extends BasePublisher {
  /**
   * Publishes an action suggestion message
   *
   * @param actionType - The type of action being suggested
   * @param payload - The action payload data
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishActionSuggestion(
    actionType: string,
    payload: any,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const suggestion: ActionSuggestion = {
      ...this.createBaseMessage(baseMessage),
      __typename: "ActionSuggestion",
      component: {
        type: "ActionSuggestion",
        props: {
          actionType,
          payload,
        },
      },
    };

    await this.publish(suggestion as any, options);
  }
}

// Singleton instance for maximum performance
let actionSuggestionPublisherInstance: ActionSuggestionPublisher | null = null;

/**
 * Get singleton ActionSuggestionPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param host - Redis host (required on first call)
 * @param port - Redis port (required on first call)
 * @param password - Redis password (required on first call)
 * @param providerId - Provider ID (required on first call)
 * @param username - Redis username (optional)
 * @param db - Redis database number (optional)
 * @returns Singleton ActionSuggestionPublisher instance
 */
export function getActionSuggestionPublisher(
  host?: string, 
  port?: number, 
  password?: string, 
  providerId?: string, 
  username?: string, 
  db?: number,
  token?: string,
  tls?: boolean
): ActionSuggestionPublisher {
  if (!actionSuggestionPublisherInstance) {
    if (!host || !port || (password === undefined && !token) || !providerId) {
      throw new Error('ActionSuggestionPublisher requires host, port, password/token, and providerId on first call');
    }
    
    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db, token, tls);
    actionSuggestionPublisherInstance = new ActionSuggestionPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }

  return actionSuggestionPublisherInstance;
}
