/**
 * Input Message Types
 * 
 * Defines input message structures for workflow triggers and user input
 */

import { BaseMessage } from "../../types";

/**
 * Raw input message structure (from GraphQL AgentInput)
 */
export interface InputMessage {
  chatId: string;
  conversationId: string;
  userId: string;
  providerId: string;
  timestamp: string | number; // Allow both string and number
  message: string;
  metadata?: any; // Can include: enableAudio, workflowId, targetAgent
}

/**
 * Typed input message for GraphQL/messaging system
 */
export interface TypedInputMessage extends BaseMessage {
  __typename: "InputMessage";
  message: string;
  metadata?: any; // Can include: enableAudio, workflowId, targetAgent
}

/**
 * Helper function to create a typed input message
 */
export function createInputMessage(base: BaseMessage, message: string, metadata?: any): TypedInputMessage {
  return {
    ...base,
    __typename: "InputMessage",
    message,
    metadata,
  };
}
