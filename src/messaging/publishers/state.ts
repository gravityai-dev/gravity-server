/**
 * State publisher for chat state updates
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";
import { Publisher } from "../Publisher";

/**
 * State message type for chat state updates
 */
export interface StateMessage extends BaseMessage {
  __typename: "State";
  component?: {
    type: string;
    props: {
      state: string;
      label?: string;
      [key: string]: any;
    };
  };
  data?: any;
  label?: string;
  variables?: any;
}

/**
 * StatePublisher - Handles chat state update messages
 */
export class StatePublisher extends BasePublisher {
  /**
   * Publishes a chat state update
   *
   * @param state - The chat state (e.g., THINKING, RESPONDING, etc.)
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param label - Optional human-readable label for the state
   * @param data - Optional additional data for the state
   * @param variables - Optional variables associated with the state
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishState(
    state: string,
    baseMessage: Partial<BaseMessage>,
    label?: string,
    data?: any,
    variables?: any,
    options?: PublishOptions
  ): Promise<void> {
    const stateMessage: StateMessage = {
      ...this.createBaseMessage(baseMessage),
      __typename: "State",
      component: {
        type: "State",
        props: {
          state,
          ...(label && { label }),
        },
      },
      ...(data && { data }),
      ...(label && { label }),
      ...(variables && { variables }),
    };

    if (!stateMessage.conversationId) {
      throw new Error("conversationId is required for publishing state messages");
    }

    await this.publish(stateMessage, options);
  }

  /**
   * Convenience method to publish common state transitions
   */
  async publishThinking(baseMessage: Partial<BaseMessage>, options?: PublishOptions): Promise<void> {
    await this.publishState("THINKING", baseMessage, "Thinking...", undefined, undefined, options);
  }

  async publishResponding(baseMessage: Partial<BaseMessage>, options?: PublishOptions): Promise<void> {
    await this.publishState("RESPONDING", baseMessage, "Responding...", undefined, undefined, options);
  }

  async publishWaiting(baseMessage: Partial<BaseMessage>, options?: PublishOptions): Promise<void> {
    await this.publishState("WAITING", baseMessage, "Waiting for input...", undefined, undefined, options);
  }

  async publishComplete(baseMessage: Partial<BaseMessage>, options?: PublishOptions): Promise<void> {
    await this.publishState("COMPLETE", baseMessage, "Complete", undefined, undefined, options);
  }

  async publishError(error: string, baseMessage: Partial<BaseMessage>, options?: PublishOptions): Promise<void> {
    await this.publishState("ERROR", baseMessage, "Error occurred", { error }, undefined, options);
  }
}

// Singleton instance
let statePublisherInstance: StatePublisher | null = null;

/**
 * Get singleton StatePublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param host - Redis host (required on first call)
 * @param port - Redis port (required on first call)
 * @param password - Redis password (required on first call)
 * @param providerId - Provider ID (required on first call)
 * @param username - Redis username (optional)
 * @param db - Redis database number (optional)
 * @returns Singleton StatePublisher instance
 */
export function getStatePublisher(
  host?: string, 
  port?: number, 
  password?: string, 
  providerId?: string, 
  username?: string, 
  db?: number
): StatePublisher {
  if (!statePublisherInstance) {
    if (!host || !port || password === undefined || !providerId) {
      throw new Error('StatePublisher requires host, port, password, and providerId on first call');
    }
    
    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db);
    statePublisherInstance = new StatePublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }

  return statePublisherInstance;
}
