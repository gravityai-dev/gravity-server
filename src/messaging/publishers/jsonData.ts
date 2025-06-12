/**
 * JSON data message publisher
 *
 * @module messaging/publishers/jsonData
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";

/**
 * JSON data message type
 */
export interface JsonData extends BaseMessage {
  __typename: "JsonData";
  data: any;
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
      data,
    };

    await this.publish(jsonMessage, options);
  }
}
