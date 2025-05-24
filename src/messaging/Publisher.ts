/**
 * Publisher - Simplified message publisher for Gravity AI
 */

import Redis from "ioredis";
import { RedisOptions, getOptionsFromCredentials } from "../RedisManager";
import { 
  BaseMessage,
  MessageChunk,
  Text,
  ProgressUpdate,
  JsonData,
  ActionSuggestion,
  Metadata,
  MdxComponent,
  ImageResponse,
  ToolOutput,
  ChatState,
  GravityMessage,
  SYSTEM_CHANNEL,
  AI_RESULT_CHANNEL,
  EVENT_CHANNEL_PREFIX
} from "../shared/types";

// Channel prefix for conversations
const CONVERSATION_CHANNEL_PREFIX = "conversation:";

// Options for publishing
export interface PublishOptions {
  channel?: string;
}

export class Publisher {
  private redis: Redis;
  private providerId: string;

  constructor(options: RedisOptions, providerId: string) {
    this.redis = new Redis({
      host: options.host,
      port: options.port,
      password: options.password,
      username: options.username,
      db: options.db || 0,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
    });
    
    this.redis.on('error', (err: Error) => {
      console.error(`[Publisher] Redis error for ${providerId}: ${err.message}`);
    });
    
    this.providerId = providerId;
  }

  static fromCredentials(serverUrl: string, apiKey: string, providerId: string): Publisher {
    const options = getOptionsFromCredentials(serverUrl, apiKey);
    return new Publisher(options, providerId);
  }

  getProviderId(): string {
    return this.providerId;
  }

  getRedisConnection(): Redis {
    return this.redis;
  }

  private createBaseMessage(partial: Partial<BaseMessage>): BaseMessage {
    if (!partial.chatId || !partial.conversationId || !partial.userId) {
      throw new Error('chatId, conversationId, and userId are required');
    }
    return {
      chatId: partial.chatId,
      conversationId: partial.conversationId,
      userId: partial.userId,
      providerId: partial.providerId || this.providerId,
      timestamp: partial.timestamp || new Date().toISOString(),
      state: partial.state || ChatState.ACTIVE
    };
  }

  private async publish(conversationId: string, message: GravityMessage, options?: PublishOptions): Promise<void> {
    const channel = options?.channel || `${CONVERSATION_CHANNEL_PREFIX}${conversationId}`;
    await this.redis.publish(channel, JSON.stringify(message));
  }

  async publishSystem(message: any): Promise<void> {
    await this.redis.publish(SYSTEM_CHANNEL, JSON.stringify(message));
  }

  async publishEvent(eventType: string, payload: any): Promise<void> {
    await this.redis.publish(`${EVENT_CHANNEL_PREFIX}${eventType}`, JSON.stringify(payload));
  }

  async publishMessageChunk(conversationId: string, text: string, base?: Partial<BaseMessage>): Promise<void> {
    const message: MessageChunk = {
      ...this.createBaseMessage(base || {}),
      __typename: 'MessageChunk',
      text
    };
    await this.publish(conversationId, message);
  }

  async publishText(conversationId: string, text: string, base?: Partial<BaseMessage>): Promise<void> {
    const message: Text = {
      ...this.createBaseMessage(base || {}),
      __typename: 'Text',
      text
    };
    await this.publish(conversationId, message);
  }

  async publishProgressUpdate(conversationId: string, message: string, base?: Partial<BaseMessage>): Promise<void> {
    const msg: ProgressUpdate = {
      ...this.createBaseMessage(base || {}),
      __typename: 'ProgressUpdate',
      message
    };
    await this.publish(conversationId, msg);
  }

  async publishJsonData(conversationId: string, data: any, base?: Partial<BaseMessage>): Promise<void> {
    const message: JsonData = {
      ...this.createBaseMessage(base || {}),
      __typename: 'JsonData',
      data
    };
    await this.publish(conversationId, message);
  }

  async publishActionSuggestion(conversationId: string, actionType: string, payload: any, base?: Partial<BaseMessage>): Promise<void> {
    const message: ActionSuggestion = {
      ...this.createBaseMessage(base || {}),
      __typename: 'ActionSuggestion',
      actionType,
      payload
    };
    await this.publish(conversationId, message);
  }

  async publishMetadata(conversationId: string, message: string, base?: Partial<BaseMessage>): Promise<void> {
    const msg: Metadata = {
      ...this.createBaseMessage(base || {}),
      __typename: 'Metadata',
      message
    };
    await this.publish(conversationId, msg);
  }

  async publishMdxComponent(conversationId: string, code: string, base?: Partial<BaseMessage>): Promise<void> {
    const message: MdxComponent = {
      ...this.createBaseMessage(base || {}),
      __typename: 'MdxComponent',
      code
    };
    await this.publish(conversationId, message);
  }

  async publishImageResponse(conversationId: string, url: string, alt?: string, base?: Partial<BaseMessage>): Promise<void> {
    const message: ImageResponse = {
      ...this.createBaseMessage(base || {}),
      __typename: 'ImageResponse',
      url,
      alt
    };
    await this.publish(conversationId, message);
  }

  async publishToolOutput(conversationId: string, tool: string, result: any, base?: Partial<BaseMessage>): Promise<void> {
    const message: ToolOutput = {
      ...this.createBaseMessage(base || {}),
      __typename: 'ToolOutput',
      tool,
      result
    };
    await this.publish(conversationId, message);
  }

  async completeSession(conversationId: string, base: Partial<BaseMessage>): Promise<void> {
    const channel = `${CONVERSATION_CHANNEL_PREFIX}${conversationId}`;
    const message = {
      ...this.createBaseMessage({
        ...base,
        state: ChatState.COMPLETE
      }),
      type: 'session_complete'
    };
    await this.redis.publish(channel, JSON.stringify(message));
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
