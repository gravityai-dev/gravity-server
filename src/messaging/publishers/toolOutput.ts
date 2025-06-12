/**
 * Tool output message publisher
 *
 * @module messaging/publishers/toolOutput
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";

/**
 * Tool output message type
 */
export interface ToolOutput extends BaseMessage {
  __typename: "ToolOutput";
  tool: string;
  result: any;
}

/**
 * ToolOutputPublisher - Handles tool output messages
 */
export class ToolOutputPublisher extends BasePublisher {
  /**
   * Publishes a tool output message
   *
   * @param tool - The name of the tool that generated the output
   * @param result - The tool's execution result
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishToolOutput(
    tool: string,
    result: any,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const toolOutput: ToolOutput = {
      ...this.createBaseMessage(baseMessage),
      __typename: "ToolOutput",
      tool,
      result,
    };

    await this.publish(toolOutput, options);
  }
}
