"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeInputType = exports.NodeExecutionState = exports.TYPE_TO_TYPENAME = exports.MessageType = exports.NODE_TYPE = exports.TIMEOUTS = exports.WORKFLOW_EXECUTION_CHANNEL = exports.INTERNAL_REQUEST_CHANNEL = exports.QUERY_MESSAGE_CHANNEL = exports.AI_RESULT_CHANNEL = exports.SYSTEM_CHANNEL = exports.ChatState = void 0;
exports.createBaseMessage = createBaseMessage;
exports.createBaseEvent = createBaseEvent;
exports.createMessageChunk = createMessageChunk;
exports.createText = createText;
exports.createProgressUpdate = createProgressUpdate;
exports.createJsonData = createJsonData;
exports.createActionSuggestion = createActionSuggestion;
exports.createMetadata = createMetadata;
exports.createImageResponse = createImageResponse;
exports.createToolOutput = createToolOutput;
exports.createAudioChunk = createAudioChunk;
exports.createNodeExecutionEvent = createNodeExecutionEvent;
const uuid_1 = require("uuid");
var ChatState;
(function (ChatState) {
    ChatState["IDLE"] = "IDLE";
    ChatState["ACTIVE"] = "ACTIVE";
    ChatState["COMPLETE"] = "COMPLETE";
    ChatState["THINKING"] = "THINKING";
    ChatState["RESPONDING"] = "RESPONDING";
    ChatState["WAITING"] = "WAITING";
    ChatState["ERROR"] = "ERROR";
    ChatState["CANCELLED"] = "CANCELLED";
})(ChatState || (exports.ChatState = ChatState = {}));
exports.SYSTEM_CHANNEL = "gravity:system";
exports.AI_RESULT_CHANNEL = "gravity:output";
exports.QUERY_MESSAGE_CHANNEL = "gravity:query";
exports.INTERNAL_REQUEST_CHANNEL = "gravity:internal";
exports.WORKFLOW_EXECUTION_CHANNEL = "workflow:execution";
exports.TIMEOUTS = {
    DEFAULT: 5000,
    REQUEST: 10000,
};
exports.NODE_TYPE = {
    INPUT: "gravityInput",
    UPDATE: "gravityUpdate",
    OUTPUT: "gravityOutput",
    CLAUDE: "gravityClaude",
    EMBED: "gravityEmbed",
};
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["JSON_DATA"] = "json_data";
    MessageType["IMAGE_RESPONSE"] = "image_response";
    MessageType["TOOL_OUTPUT"] = "tool_output";
    MessageType["ACTION_SUGGESTION"] = "action_suggestion";
    MessageType["MESSAGE_CHUNK"] = "message_chunk";
    MessageType["PROGRESS_UPDATE"] = "progress_update";
    MessageType["METADATA"] = "metadata";
    MessageType["AUDIO_CHUNK"] = "audio_chunk";
})(MessageType || (exports.MessageType = MessageType = {}));
exports.TYPE_TO_TYPENAME = {
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
function createBaseMessage(overrides = {}) {
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
function createBaseEvent(overrides = {}) {
    return {
        id: overrides.id || (0, uuid_1.v4)(),
        chatId: overrides.chatId || "",
        conversationId: overrides.conversationId || "",
        userId: overrides.userId || "",
        providerId: overrides.providerId || "",
        timestamp: overrides.timestamp || Date.now(),
        state: overrides.state || ChatState.IDLE,
    };
}
function createMessageChunk(base, text) {
    return {
        ...base,
        __typename: "MessageChunk",
        text,
    };
}
function createText(base, text) {
    return {
        ...base,
        __typename: "Text",
        text,
    };
}
function createProgressUpdate(base, message) {
    return {
        ...base,
        __typename: "ProgressUpdate",
        message,
    };
}
function createJsonData(base, data) {
    return {
        ...base,
        __typename: "JsonData",
        data,
    };
}
function createActionSuggestion(base, actionType, payload) {
    return {
        ...base,
        __typename: "ActionSuggestion",
        actionType,
        payload,
    };
}
function createMetadata(base, message) {
    return {
        ...base,
        __typename: "Metadata",
        message,
    };
}
function createImageResponse(base, url, alt) {
    return {
        ...base,
        __typename: "ImageResponse",
        url,
        alt,
    };
}
function createToolOutput(base, tool, result) {
    return {
        ...base,
        __typename: "ToolOutput",
        tool,
        result,
    };
}
function createAudioChunk(base, audioData, format, textReference, sourceType, duration) {
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
var NodeExecutionState;
(function (NodeExecutionState) {
    NodeExecutionState["STARTED"] = "STARTED";
    NodeExecutionState["COMPLETED"] = "COMPLETED";
    NodeExecutionState["ERROR"] = "ERROR";
})(NodeExecutionState || (exports.NodeExecutionState = NodeExecutionState = {}));
function createNodeExecutionEvent(executionId, workflowId, nodeId, nodeType, state, options) {
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
var NodeInputType;
(function (NodeInputType) {
    NodeInputType["STRING"] = "string";
    NodeInputType["NUMBER"] = "number";
    NodeInputType["BOOLEAN"] = "boolean";
    NodeInputType["OBJECT"] = "object";
    NodeInputType["ARRAY"] = "array";
    NodeInputType["ANY"] = "any";
})(NodeInputType || (exports.NodeInputType = NodeInputType = {}));
//# sourceMappingURL=types.js.map