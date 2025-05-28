/**
 * Shared types for Gravity AI - Single source of truth
 */

import { v4 as uuid } from 'uuid';

// Chat states
export enum ChatState {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE', 
  COMPLETE = 'COMPLETE',
  THINKING = 'THINKING',
  RESPONDING = 'RESPONDING',
  WAITING = 'WAITING',
  ERROR = 'ERROR',
  CANCELLED = 'CANCELLED'
}

// Base message interface
export interface BaseMessage {
  chatId: string;
  conversationId: string;
  userId: string;
  providerId?: string;
  timestamp: string | number; // Allow both string and number
  state?: ChatState;
  type?: MessageType;
}

// Message types with __typename for GraphQL
export interface MessageChunk extends BaseMessage {
  __typename: 'MessageChunk';
  text: string;
}

export interface Text extends BaseMessage {
  __typename: 'Text';
  text: string;
}

export interface ProgressUpdate extends BaseMessage {
  __typename: 'ProgressUpdate';
  message: string;
}

export interface JsonData extends BaseMessage {
  __typename: 'JsonData';
  data: any;
}

export interface ActionSuggestion extends BaseMessage {
  __typename: 'ActionSuggestion';
  actionType: string; // Changed from 'type' to 'actionType'
  payload: any;
}

export interface Metadata extends BaseMessage {
  __typename: 'Metadata';
  message: string;
}

export interface ImageResponse extends BaseMessage {
  __typename: 'ImageResponse';
  url: string;
  alt?: string;
}

export interface ToolOutput extends BaseMessage {
  __typename: 'ToolOutput';
  tool: string;
  result: any;
}

export interface AudioChunk extends BaseMessage {
  __typename: 'AudioChunk';
  audioData: string;     // Base64 encoded audio data
  format: string;        // Audio format (mp3, wav, etc)
  duration?: number;     // Duration in seconds
  textReference: string; // The text this audio represents
  sourceType: string;    // "MessageChunk" or "ProgressUpdate"
}

// Union type
export type GravityMessage = 
  | Text 
  | JsonData 
  | ImageResponse 
  | ToolOutput 
  | ActionSuggestion 
  | MessageChunk 
  | ProgressUpdate 
  | Metadata
  | AudioChunk;

// Server-side message format (includes both type and __typename)
export interface ServerMessage extends BaseMessage {
  id: string;
  providerId: string;
  timestamp: number; // Server uses number timestamp
  type: MessageType;
  __typename: string;
}

// Channel constants
export const SYSTEM_CHANNEL = "gravity:system";
export const AI_RESULT_CHANNEL = "gravity:output";
export const QUERY_MESSAGE_CHANNEL = "gravity:query";
export const INTERNAL_REQUEST_CHANNEL = "gravity:internal"; // For internal service-to-service requests

// Timeout constants
export const TIMEOUTS = {
  DEFAULT: 5000,
  REQUEST: 10000
} as const;

// Node type identifiers
export const NODE_TYPE = {
  INPUT: "gravityInput",
  UPDATE: "gravityUpdate",
  OUTPUT: "gravityOutput",
  CLAUDE: "gravityClaude",
  EMBED: "gravityEmbed"
} as const;

// Message type enum for consistency
export enum MessageType {
  TEXT = 'text',
  JSON_DATA = 'json_data',
  IMAGE_RESPONSE = 'image_response',
  TOOL_OUTPUT = 'tool_output',
  ACTION_SUGGESTION = 'action_suggestion',
  MESSAGE_CHUNK = 'message_chunk',
  PROGRESS_UPDATE = 'progress_update',
  METADATA = 'metadata',
  AUDIO_CHUNK = 'audio_chunk'
}

// Mapping from MessageType to GraphQL __typename
export const TYPE_TO_TYPENAME: Record<MessageType, string> = {
  [MessageType.TEXT]: 'Text',
  [MessageType.JSON_DATA]: 'JsonData',
  [MessageType.IMAGE_RESPONSE]: 'ImageResponse',
  [MessageType.TOOL_OUTPUT]: 'ToolOutput',
  [MessageType.ACTION_SUGGESTION]: 'ActionSuggestion',
  [MessageType.MESSAGE_CHUNK]: 'MessageChunk',
  [MessageType.PROGRESS_UPDATE]: 'ProgressUpdate',
  [MessageType.METADATA]: 'Metadata',
  [MessageType.AUDIO_CHUNK]: 'AudioChunk'
};

// Helper functions for creating messages
export function createBaseMessage(overrides: Partial<BaseMessage> = {}): BaseMessage {
  return {
    chatId: overrides.chatId || '',
    conversationId: overrides.conversationId || '',
    userId: overrides.userId || '',
    providerId: overrides.providerId || '',
    timestamp: overrides.timestamp || new Date().toISOString(),
    state: overrides.state || ChatState.IDLE
  };
}

// Server-specific base event creator (uses number timestamp)
export function createBaseEvent(overrides: Partial<ServerMessage> = {}): Omit<ServerMessage, 'type' | '__typename'> {
  return {
    id: overrides.id || uuid(),
    chatId: overrides.chatId || '',
    conversationId: overrides.conversationId || '',
    userId: overrides.userId || '',
    providerId: overrides.providerId || '',
    timestamp: overrides.timestamp || Date.now(),
    state: overrides.state || ChatState.IDLE
  };
}

export function createMessageChunk(base: BaseMessage, text: string): MessageChunk {
  return {
    ...base,
    __typename: 'MessageChunk',
    text
  };
}

export function createText(base: BaseMessage, text: string): Text {
  return {
    ...base,
    __typename: 'Text',
    text
  };
}

export function createProgressUpdate(base: BaseMessage, message: string): ProgressUpdate {
  return {
    ...base,
    __typename: 'ProgressUpdate',
    message
  };
}

export function createJsonData(base: BaseMessage, data: Record<string, any>): JsonData {
  return {
    ...base,
    __typename: 'JsonData',
    data
  };
}

export function createActionSuggestion(base: BaseMessage, actionType: string, payload: Record<string, any>): ActionSuggestion {
  return {
    ...base,
    __typename: 'ActionSuggestion',
    actionType,
    payload
  };
}

export function createMetadata(base: BaseMessage, message: string): Metadata {
  return {
    ...base,
    __typename: 'Metadata',
    message
  };
}

export function createImageResponse(base: BaseMessage, url: string, alt?: string): ImageResponse {
  return {
    ...base,
    __typename: 'ImageResponse',
    url,
    alt
  };
}

export function createToolOutput(base: BaseMessage, tool: string, result: Record<string, any>): ToolOutput {
  return {
    ...base,
    __typename: 'ToolOutput',
    tool,
    result
  };
}

export function createAudioChunk(
  base: BaseMessage, 
  audioData: string, 
  format: string, 
  textReference: string,
  sourceType: string,
  duration?: number
): AudioChunk {
  return {
    ...base,
    __typename: 'AudioChunk',
    audioData,
    format,
    duration,
    textReference,
    sourceType
  };
}
