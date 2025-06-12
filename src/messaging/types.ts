/**
 * Messaging Types
 *
 * Exports all messaging-related type definitions
 */

import { MessageType } from "../types";

// Base message interface - all messages must have these fields
export interface BaseMessage {
  id: string;
  timestamp: string;
  type: MessageType;
  chatId?: string;
  conversationId?: string;
  userId?: string;
  agentId?: string;
  providerId?: string;
  metadata?: Record<string, any>;
}

// Import message types from publishers
import type { Text } from "./publishers/text";
import type { JsonData } from "./publishers/jsonData";
import type { ActionSuggestion } from "./publishers/actionSuggestion";
import type { Metadata } from "./publishers/metadata";
import type { ImageResponse } from "./publishers/imageResponse";
import type { ToolOutput } from "./publishers/toolOutput";
import type { AudioChunk } from "./publishers/audioChunk";
import type { MessageChunk } from "./publishers/messageChunk";
import type { ProgressUpdate } from "./publishers/progressUpdate";
import type { SystemMessage } from "./publishers/system";
import type { StateMessage } from "./publishers/state";

// Re-export message types
export type {
  Text,
  JsonData,
  ActionSuggestion,
  Metadata,
  ImageResponse,
  ToolOutput,
  AudioChunk,
  MessageChunk,
  ProgressUpdate,
  SystemMessage,
  StateMessage,
};

// State type - doesn't have a dedicated publisher yet
export interface State extends BaseMessage {
  __typename: "State";
  stateData: Record<string, any>;
  variables?: Record<string, any>;
}

// Union type for all message types
export type GravityMessage =
  | Text
  | JsonData
  | ActionSuggestion
  | Metadata
  | ImageResponse
  | ToolOutput
  | AudioChunk
  | State
  | StateMessage
  | SystemMessage
  | ProgressUpdate
  | MessageChunk;
