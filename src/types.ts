/**
 * Shared Types
 *
 * Core types shared between client and server
 *
 * @module shared/types
 */

import { v4 as uuid } from "uuid";

// Re-export message types from messaging module
export type {
  BaseMessage,
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
  State,
  GravityMessage,
  Card,
  Questions,
} from "./messaging/types";

// Import BaseMessage for ServerMessage interface
import type { BaseMessage } from "./messaging/types";

// Message type enum
export enum MessageType {
  TEXT = "TEXT",
  JSON_DATA = "JSON_DATA",
  IMAGE_RESPONSE = "IMAGE_RESPONSE",
  TOOL_OUTPUT = "TOOL_OUTPUT",
  ACTION_SUGGESTION = "ACTION_SUGGESTION",
  METADATA = "METADATA",
  AUDIO_CHUNK = "AUDIO_CHUNK",
  SYSTEM_MESSAGE = "SYSTEM_MESSAGE",
  PROGRESS_UPDATE = "PROGRESS_UPDATE",
  MESSAGE_CHUNK = "MESSAGE_CHUNK",
  STATE = "STATE",
  CARD = "CARD",
  QUESTIONS = "QUESTIONS",
  NODE_EXECUTION_EVENT = "NODE_EXECUTION_EVENT",
}

// Chat state enum
export enum ChatState {
  IDLE = "IDLE",
  ACTIVE = "ACTIVE",
  COMPLETE = "COMPLETE",
  THINKING = "THINKING",
  RESPONDING = "RESPONDING",
  WAITING = "WAITING",
  ERROR = "ERROR",
  CANCELLED = "CANCELLED",
}

// Server-side message format (includes both type and __typename)
export interface ServerMessage extends Omit<BaseMessage, "timestamp"> {
  id: string;
  providerId: string;
  timestamp: number; // Server uses number timestamps
  type: MessageType;
  __typename: string;
}

// Channel constants
export const SYSTEM_CHANNEL = "gravity:system";
export const AI_RESULT_CHANNEL = "gravity:output";
export const QUERY_MESSAGE_CHANNEL = "gravity:query";
export const INTERNAL_REQUEST_CHANNEL = "gravity:internal"; // For internal service-to-service requests
export const WORKFLOW_EXECUTION_CHANNEL = "workflow:execution"; // For workflow execution events
// WORKFLOW_NODE_COMPLETION_CHANNEL removed - now using unified AI_RESULT_CHANNEL
export const WORKFLOW_STATE_CHANNEL = "gravity:workflow:state"; // For workflow state debug updates

// Timeout constants
export const TIMEOUTS = {
  DEFAULT: 5000,
  REQUEST: 10000,
} as const;

// Mapping from MessageType to GraphQL __typename
export const TYPE_TO_TYPENAME: Record<MessageType, string> = {
  [MessageType.TEXT]: "Text",
  [MessageType.MESSAGE_CHUNK]: "MessageChunk",
  [MessageType.JSON_DATA]: "JsonData",
  [MessageType.ACTION_SUGGESTION]: "ActionSuggestion",
  [MessageType.METADATA]: "Metadata",
  [MessageType.IMAGE_RESPONSE]: "ImageResponse",
  [MessageType.TOOL_OUTPUT]: "ToolOutput",
  [MessageType.AUDIO_CHUNK]: "AudioChunk",
  [MessageType.STATE]: "State",
  [MessageType.SYSTEM_MESSAGE]: "SystemMessage",
  [MessageType.PROGRESS_UPDATE]: "ProgressUpdate",
  [MessageType.CARD]: "Card",
  [MessageType.QUESTIONS]: "Questions",
  [MessageType.NODE_EXECUTION_EVENT]: "NodeExecutionEvent",
};
