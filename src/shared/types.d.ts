export declare enum ChatState {
    IDLE = "IDLE",
    ACTIVE = "ACTIVE",
    COMPLETE = "COMPLETE",
    THINKING = "THINKING",
    RESPONDING = "RESPONDING",
    WAITING = "WAITING",
    ERROR = "ERROR",
    CANCELLED = "CANCELLED"
}
export interface InputMessage {
    chatId: string;
    conversationId: string;
    userId: string;
    providerId: string;
    timestamp: string | number;
    message: string;
}
export interface BaseMessage {
    chatId: string;
    conversationId: string;
    userId: string;
    providerId: string;
    timestamp: string | number;
    state: ChatState;
    type: MessageType;
    metadata?: Record<string, any>;
}
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
    actionType: string;
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
    audioData: string;
    format: string;
    duration?: number;
    textReference: string;
    sourceType: string;
}
export type GravityMessage = Text | JsonData | ImageResponse | ToolOutput | ActionSuggestion | MessageChunk | ProgressUpdate | Metadata | AudioChunk;
export interface ServerMessage extends BaseMessage {
    id: string;
    providerId: string;
    timestamp: number;
    type: MessageType;
    __typename: string;
}
export declare const SYSTEM_CHANNEL = "gravity:system";
export declare const AI_RESULT_CHANNEL = "gravity:output";
export declare const QUERY_MESSAGE_CHANNEL = "gravity:query";
export declare const INTERNAL_REQUEST_CHANNEL = "gravity:internal";
export declare const WORKFLOW_EXECUTION_CHANNEL = "workflow:execution";
export declare const TIMEOUTS: {
    readonly DEFAULT: 5000;
    readonly REQUEST: 10000;
};
export declare const NODE_TYPE: {
    readonly INPUT: "gravityInput";
    readonly UPDATE: "gravityUpdate";
    readonly OUTPUT: "gravityOutput";
    readonly CLAUDE: "gravityClaude";
    readonly EMBED: "gravityEmbed";
};
export declare enum MessageType {
    TEXT = "text",
    JSON_DATA = "json_data",
    IMAGE_RESPONSE = "image_response",
    TOOL_OUTPUT = "tool_output",
    ACTION_SUGGESTION = "action_suggestion",
    MESSAGE_CHUNK = "message_chunk",
    PROGRESS_UPDATE = "progress_update",
    METADATA = "metadata",
    AUDIO_CHUNK = "audio_chunk"
}
export declare const TYPE_TO_TYPENAME: Record<MessageType, string>;
export declare function createBaseMessage(overrides?: Partial<BaseMessage>): BaseMessage;
export declare function createBaseEvent(overrides?: Partial<ServerMessage>): Omit<ServerMessage, "type" | "__typename">;
export declare function createMessageChunk(base: BaseMessage, text: string): MessageChunk;
export declare function createText(base: BaseMessage, text: string): Text;
export declare function createProgressUpdate(base: BaseMessage, message: string): ProgressUpdate;
export declare function createJsonData(base: BaseMessage, data: Record<string, any>): JsonData;
export declare function createActionSuggestion(base: BaseMessage, actionType: string, payload: Record<string, any>): ActionSuggestion;
export declare function createMetadata(base: BaseMessage, message: string): Metadata;
export declare function createImageResponse(base: BaseMessage, url: string, alt?: string): ImageResponse;
export declare function createToolOutput(base: BaseMessage, tool: string, result: Record<string, any>): ToolOutput;
export declare function createAudioChunk(base: BaseMessage, audioData: string, format: string, textReference: string, sourceType: string, duration?: number): AudioChunk;
export declare enum NodeExecutionState {
    STARTED = "STARTED",
    COMPLETED = "COMPLETED",
    ERROR = "ERROR"
}
export interface NodeExecutionEvent {
    __typename: "NodeExecutionEvent";
    executionId: string;
    workflowId: string;
    nodeId: string;
    nodeType: string;
    state: NodeExecutionState;
    timestamp: string;
    duration?: number;
    outputs?: any;
    error?: string;
}
export declare function createNodeExecutionEvent(executionId: string, workflowId: string, nodeId: string, nodeType: string, state: NodeExecutionState, options?: {
    duration?: number;
    outputs?: any;
    error?: string;
}): NodeExecutionEvent;
export declare enum NodeInputType {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    OBJECT = "object",
    ARRAY = "array",
    ANY = "any"
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
export interface NodeDefinition {
    name: string;
    description: string;
    category: string;
    color: string;
    icon?: string;
    inputs: NodeInput[];
    outputs: NodeOutput[];
    executor: NodeExecutor;
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
