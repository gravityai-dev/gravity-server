/**
 * Shared types for Gravity AI - Single source of truth
 */

import { v4 as uuid } from "uuid";

// Chat states
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

// Base message interface
export interface InputMessage {
  chatId: string;
  conversationId: string;
  userId: string;
  providerId: string;
  timestamp: string | number; // Allow both string and number
  message: string;
}

// Base message interface
export interface BaseMessage {
  chatId: string;
  conversationId: string;
  userId: string;
  providerId: string;
  timestamp: string | number; // Allow both string and number
  state: ChatState;
  type: MessageType;
  metadata?: Record<string, any>; // Optional metadata for carrying additional data
}

// Message types with __typename for GraphQL
export interface MessageChunk extends BaseMessage {
  __typename: "MessageChunk";
  text: string;
  voiceConfig?: {
    enabled: boolean;
    textField: "text";
  };
}

export interface Text extends BaseMessage {
  __typename: "Text";
  text: string;
  voiceConfig?: {
    //is voice enabled for this message
    enabled: boolean;
    textField: "text";
  };
}

export interface ProgressUpdate extends BaseMessage {
  __typename: "ProgressUpdate";
  message: string;
  progress?: number;
  voiceConfig?: {
    enabled: boolean;
    textField: "message";
  };
}

export interface JsonData extends BaseMessage {
  __typename: "JsonData";
  data: any;
}

export interface ActionSuggestion extends BaseMessage {
  __typename: "ActionSuggestion";
  actionType: string; // Changed from 'type' to 'actionType'
  payload: any;
}

export interface Metadata extends BaseMessage {
  __typename: "Metadata";
  message: string;
}

export interface ImageResponse extends BaseMessage {
  __typename: "ImageResponse";
  url: string;
  alt?: string;
}

export interface ToolOutput extends BaseMessage {
  __typename: "ToolOutput";
  tool: string;
  result: any;
}

export interface AudioChunk extends BaseMessage {
  __typename: "AudioChunk";
  audioData: string; // Base64 encoded audio data
  format: string; // Audio format (mp3, wav, etc)
  duration?: number; // Duration in seconds
  textReference: string; // The text this audio represents
  sourceType: string; // "MessageChunk" or "ProgressUpdate"
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
export const WORKFLOW_EXECUTION_CHANNEL = "workflow:execution"; // For workflow execution events

// Timeout constants
export const TIMEOUTS = {
  DEFAULT: 5000,
  REQUEST: 10000,
} as const;

// Node type identifiers
export const NODE_TYPE = {
  INPUT: "gravityInput",
  UPDATE: "gravityUpdate",
  OUTPUT: "gravityOutput",
  CLAUDE: "gravityClaude",
  EMBED: "gravityEmbed",
} as const;

// Message type enum for consistency
export enum MessageType {
  TEXT = "text",
  JSON_DATA = "json_data",
  IMAGE_RESPONSE = "image_response",
  TOOL_OUTPUT = "tool_output",
  ACTION_SUGGESTION = "action_suggestion",
  MESSAGE_CHUNK = "message_chunk",
  PROGRESS_UPDATE = "progress_update",
  METADATA = "metadata",
  AUDIO_CHUNK = "audio_chunk",
}

// Mapping from MessageType to GraphQL __typename
export const TYPE_TO_TYPENAME: Record<MessageType, string> = {
  [MessageType.TEXT]: "Text",
  [MessageType.JSON_DATA]: "JsonData",
  [MessageType.IMAGE_RESPONSE]: "ImageResponse",
  [MessageType.TOOL_OUTPUT]: "ToolOutput",
  [MessageType.ACTION_SUGGESTION]: "ActionSuggestion",
  [MessageType.MESSAGE_CHUNK]: "MessageChunk",
  [MessageType.PROGRESS_UPDATE]: "ProgressUpdate",
  [MessageType.METADATA]: "Metadata",
  [MessageType.AUDIO_CHUNK]: "AudioChunk",
};

// Helper functions for creating messages
export function createBaseMessage(overrides: Partial<BaseMessage> = {}): BaseMessage {
  return {
    chatId: overrides.chatId || "",
    conversationId: overrides.conversationId || "",
    userId: overrides.userId || "",
    providerId: overrides.providerId || "",
    timestamp: overrides.timestamp || new Date().toISOString(),
    state: overrides.state || ChatState.IDLE,
    type: overrides.type || MessageType.TEXT,
  };
}

// Server-specific base event creator (uses number timestamp)
export function createBaseEvent(overrides: Partial<ServerMessage> = {}): Omit<ServerMessage, "type" | "__typename"> {
  return {
    id: overrides.id || uuid(),
    chatId: overrides.chatId || "",
    conversationId: overrides.conversationId || "",
    userId: overrides.userId || "",
    providerId: overrides.providerId || "",
    timestamp: overrides.timestamp || Date.now(),
    state: overrides.state || ChatState.IDLE,
  };
}

export function createMessageChunk(base: BaseMessage, text: string): MessageChunk {
  return {
    ...base,
    __typename: "MessageChunk",
    text,
  };
}

export function createText(base: BaseMessage, text: string): Text {
  return {
    ...base,
    __typename: "Text",
    text,
  };
}

export function createProgressUpdate(base: BaseMessage, message: string): ProgressUpdate {
  return {
    ...base,
    __typename: "ProgressUpdate",
    message,
  };
}

export function createJsonData(base: BaseMessage, data: Record<string, any>): JsonData {
  return {
    ...base,
    __typename: "JsonData",
    data,
  };
}

export function createActionSuggestion(
  base: BaseMessage,
  actionType: string,
  payload: Record<string, any>
): ActionSuggestion {
  return {
    ...base,
    __typename: "ActionSuggestion",
    actionType,
    payload,
  };
}

export function createMetadata(base: BaseMessage, message: string): Metadata {
  return {
    ...base,
    __typename: "Metadata",
    message,
  };
}

export function createImageResponse(base: BaseMessage, url: string, alt?: string): ImageResponse {
  return {
    ...base,
    __typename: "ImageResponse",
    url,
    alt,
  };
}

export function createToolOutput(base: BaseMessage, tool: string, result: Record<string, any>): ToolOutput {
  return {
    ...base,
    __typename: "ToolOutput",
    tool,
    result,
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
    __typename: "AudioChunk",
    audioData,
    format,
    duration,
    textReference,
    sourceType,
  };
}

// ===== Workflow Execution Event Types =====

// Node execution states
export enum NodeExecutionState {
  STARTED = "STARTED",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

// Single node execution event that handles all states
export interface NodeExecutionEvent {
  __typename: "NodeExecutionEvent";
  executionId: string;
  workflowId: string;
  nodeId: string;
  nodeType: string;
  state: NodeExecutionState;
  timestamp: string;
  duration?: number; // milliseconds (only for COMPLETED/ERROR states)
  outputs?: any; // only for COMPLETED state
  error?: string; // only for ERROR state
}

// Helper function for creating node execution events
export function createNodeExecutionEvent(
  executionId: string,
  workflowId: string,
  nodeId: string,
  nodeType: string,
  state: NodeExecutionState,
  options?: {
    duration?: number;
    outputs?: any;
    error?: string;
  }
): NodeExecutionEvent {
  return {
    __typename: "NodeExecutionEvent",
    executionId,
    workflowId,
    nodeId,
    nodeType,
    state,
    timestamp: new Date().toISOString(),
    ...options,
  };
}

// ===== Workflow Node Definition Types =====

export enum NodeInputType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  ANY = 'any'
}

export interface NodeInput {
  name: string;
  type: NodeInputType;
  description?: string;
  required?: boolean;
  default?: any;
}

export interface NodeOutput {
  name: string;
  type: NodeInputType;
  description?: string;
}

// Node definition without executor
export interface NodeDefinition {
  name: string;
  description: string;
  category: string;
  color: string;
  icon?: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
}

export type NodeExecutor = (inputs: any, context: NodeExecutionContext) => Promise<any>;

export interface NodeExecutionContext {
  nodeId: string;
  executionId: string;
  credentials?: any;
  logger?: {
    info: (message: string) => void;
    error: (message: string) => void;
    debug: (message: string) => void;
  };
}

// Node lifecycle hooks
export interface NodeLifecycle {
  onAdd?: (context: { nodeId: string; workflowId: string; config?: Record<string, any> }) => Promise<void>;
  onRemove?: (context: { nodeId: string; workflowId: string; config?: Record<string, any> }) => Promise<void>;
  onBeforeExecute?: (context: { nodeId: string; workflowId: string; config?: Record<string, any> }) => Promise<void>;
  onAfterExecute?: (context: { nodeId: string; workflowId: string; config?: Record<string, any> }) => Promise<void>;
}

// Enhanced node with lifecycle support
export interface WorkflowNode {
  definition: NodeDefinition;
  executor: NodeExecutor;
  lifecycle?: NodeLifecycle;
}

// ===== BullMQ Queue Types =====

export interface WorkflowQueueConfig {
  redis: {
    host: string;
    port: number;
  };
  defaultConcurrency?: number;
  defaultRetries?: number;
}

export interface NodeJobData {
  workflowId: string;
  executionId: string;
  nodeId: string;
  nodeType: string;
  config?: any;
  dependencies?: string[];
  initialInputs?: any;
}

export interface WorkflowJobData {
  workflowId: string;
  executionId: string;
  flowJobId: string;
}

export interface QueueExecutionStatus {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  outputs: Record<string, any>;
  error?: string;
  // BullMQ specific fields
  jobId?: string;
  progress?: number;
  attempts?: number;
}

export interface NodeTrace {
  traceId: string;
  executionId: string;
  nodeId: string;
  nodeType: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "running" | "completed" | "failed";
  inputs?: any;
  outputs?: any;
  error?: string;
}

// Node credential requirement definition
export interface NodeCredential {
  name: string;
  required: boolean;
  displayName?: string;
  description?: string;
}

// Enhanced node definition that includes full configuration schema
export interface EnhancedNodeDefinition extends NodeDefinition {
  type: string;
  logoUrl?: string;
  configSchema?: any;
  credentials?: NodeCredential[];
  capabilities?: {
    isTrigger?: boolean;
    requiresConnection?: boolean;
    parallelizable?: boolean;
  };
  testData?: any;
  lifecycle?: NodeLifecycle;
}
