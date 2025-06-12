/**
 * Batch Publisher - Maximum Performance
 * 
 * Batches multiple messages into single Redis pipeline for ultra-fast publishing
 * Use when you need to send multiple messages at once with minimal latency
 */

import Redis from "ioredis";
import { BasePublisher, PublishOptions } from "./base";
import { GravityMessage } from "../../types";
import { Publisher } from "../Publisher";

export interface BatchMessage {
  message: GravityMessage;
  channel?: string;
}

/**
 * High-performance batch publisher
 * Sends multiple messages in a single Redis pipeline operation
 */
export class BatchPublisher extends BasePublisher {
  /**
   * Publish multiple messages in a single batch operation
   * Maximum performance - single Redis roundtrip for all messages
   * 
   * @param messages - Array of messages to publish
   * @param defaultChannel - Default channel if message doesn't specify one
   */
  async publishBatch(messages: BatchMessage[], defaultChannel?: string): Promise<void> {
    if (messages.length === 0) return;

    // Use Redis pipeline for maximum performance
    const pipeline = this.redis.pipeline();
    
    for (const { message, channel } of messages) {
      const targetChannel = channel || defaultChannel || message.conversationId || 'gravity:output';
      pipeline.publish(targetChannel, JSON.stringify(message));
    }
    
    // Execute all publishes in single operation
    await pipeline.exec();
  }

  /**
   * Publish multiple messages to same channel
   * Even faster when all messages go to same destination
   */
  async publishBatchToChannel(messages: GravityMessage[], channel: string): Promise<void> {
    if (messages.length === 0) return;

    const pipeline = this.redis.pipeline();
    
    for (const message of messages) {
      pipeline.publish(channel, JSON.stringify(message));
    }
    
    await pipeline.exec();
  }

  /**
   * Publish streaming chunks in batch
   * Optimized for high-frequency message chunks
   */
  async publishStreamingBatch(chunks: string[], baseMessage: any, channel?: string): Promise<void> {
    if (chunks.length === 0) return;

    const pipeline = this.redis.pipeline();
    const targetChannel = channel || baseMessage.conversationId || 'gravity:output';
    
    for (const chunk of chunks) {
      const message = {
        ...this.createBaseMessage(baseMessage),
        __typename: "MessageChunk",
        text: chunk,
      };
      pipeline.publish(targetChannel, JSON.stringify(message));
    }
    
    await pipeline.exec();
  }
}

// Singleton instance for maximum performance
let batchPublisherInstance: BatchPublisher | null = null;

/**
 * Get singleton BatchPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param serverUrl - Server URL (required on first call)
 * @param apiKey - API key (required on first call) 
 * @param providerId - Provider ID (required on first call)
 * @returns Singleton BatchPublisher instance
 */
export function getBatchPublisher(serverUrl?: string, apiKey?: string, providerId?: string): BatchPublisher {
  if (!batchPublisherInstance) {
    if (!serverUrl || !apiKey || !providerId) {
      throw new Error('BatchPublisher requires serverUrl, apiKey, and providerId on first call');
    }
    
    const publisher = Publisher.fromCredentials(serverUrl, apiKey, providerId);
    batchPublisherInstance = new BatchPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }
  
  return batchPublisherInstance;
}
