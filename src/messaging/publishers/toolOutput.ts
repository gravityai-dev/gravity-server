/**
 * Tool output message publisher
 *
 * @module messaging/publishers/toolOutput
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";
import { Publisher } from "../Publisher";

/**
 * Tool output message type
 */
export interface ToolOutput extends BaseMessage {
  __typename: "ToolOutput";
  component: {
    type: "ToolOutput";
    props: {
      tool: string;
      result: any;
    };
  };
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
      component: {
        type: "ToolOutput",
        props: {
          tool,
          result,
        },
      },
    };

    await this.publish(toolOutput as any, options);
  }
}

// Singleton instance for maximum performance
let toolOutputPublisherInstance: ToolOutputPublisher | null = null;

/**
 * Get singleton ToolOutputPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param host - Redis host (required on first call)
 * @param port - Redis port (required on first call)
 * @param password - Redis password (required on first call)
 * @param providerId - Provider ID (required on first call)
 * @param username - Redis username (optional)
 * @param db - Redis database number (optional)
 * @returns Singleton ToolOutputPublisher instance
 */
export function getToolOutputPublisher(
  host?: string, 
  port?: number, 
  password?: string, 
  providerId?: string, 
  username?: string, 
  db?: number
): ToolOutputPublisher {
  if (!toolOutputPublisherInstance) {
    if (!host || !port || password === undefined || !providerId) {
      throw new Error('ToolOutputPublisher requires host, port, password, and providerId on first call');
    }
    
    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db);
    toolOutputPublisherInstance = new ToolOutputPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }

  return toolOutputPublisherInstance;
}
