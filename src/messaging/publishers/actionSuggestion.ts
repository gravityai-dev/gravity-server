/**
 * Action suggestion message publisher
 *
 * @module messaging/publishers/actionSuggestion
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";

/**
 * Action suggestion message type
 */
export interface ActionSuggestion extends BaseMessage {
  __typename: "ActionSuggestion";
  actionType: string;
  payload: any;
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
      actionType,
      payload,
    };

    await this.publish(suggestion, options);
  }
}
