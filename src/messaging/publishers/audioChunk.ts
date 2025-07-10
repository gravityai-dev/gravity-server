/**
 * Audio chunk message publisher
 *
 * @module messaging/publishers/audioChunk
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";
import { Publisher } from "../Publisher";

/**
 * Audio chunk message type
 */
export interface AudioChunk extends BaseMessage {
  __typename: "AudioChunk";
  component: {
    type: "AudioChunk";
    props: {
      audioData: string; // Base64 encoded audio data
      format: string; // Audio format (mp3, wav, etc)
      duration?: number; // Duration in seconds
      textReference: string; // The text this audio represents
      sourceType: string; // "MessageChunk" or "ProgressUpdate"
      index?: number; // Optional index for ordering
    };
  };
}

/**
 * Helper function to create an AudioChunk object without publishing it
 */
export function createAudioChunk(
  base: BaseMessage,
  audioData: string,
  format: string,
  textReference: string,
  sourceType: string,
  duration?: number,
  index?: number
): AudioChunk {
  return {
    ...base,
    __typename: "AudioChunk",
    component: {
      type: "AudioChunk",
      props: {
        audioData,
        format,
        textReference,
        sourceType,
        duration,
        index,
      },
    },
  };
}

/**
 * AudioChunkPublisher - Handles audio chunk messages
 */
export class AudioChunkPublisher extends BasePublisher {
  /**
   * Publishes an audio chunk message
   *
   * @param audioData - Base64 encoded audio data
   * @param format - Audio format (e.g., 'mp3', 'wav')
   * @param textReference - The text this audio represents
   * @param sourceType - Source type ("MessageChunk" or "ProgressUpdate")
   * @param duration - Optional duration in seconds
   * @param index - Optional index for ordering
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishAudioChunk(
    audioData: string,
    format: string,
    textReference: string,
    sourceType: string,
    duration: number | undefined,
    index: number | undefined,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const audioChunk: AudioChunk = {
      ...this.createBaseMessage(baseMessage),
      __typename: "AudioChunk",
      component: {
        type: "AudioChunk",
        props: {
          audioData,
          format,
          textReference,
          sourceType,
          duration,
          index,
        },
      },
    };

    await this.publish(audioChunk as any, options);
  }
}

// Singleton instance for maximum performance
let audioChunkPublisherInstance: AudioChunkPublisher | null = null;

/**
 * Get singleton AudioChunkPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param host - Redis host (required on first call)
 * @param port - Redis port (required on first call)
 * @param password - Redis password (required on first call)
 * @param providerId - Provider ID (required on first call)
 * @param username - Redis username (optional)
 * @param db - Redis database number (optional)
 * @returns Singleton AudioChunkPublisher instance
 */
export function getAudioChunkPublisher(
  host?: string, 
  port?: number, 
  password?: string, 
  providerId?: string, 
  username?: string, 
  db?: number
): AudioChunkPublisher {
  if (!audioChunkPublisherInstance) {
    if (!host || !port || password === undefined || !providerId) {
      throw new Error('AudioChunkPublisher requires host, port, password, and providerId on first call');
    }
    
    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db);
    audioChunkPublisherInstance = new AudioChunkPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }

  return audioChunkPublisherInstance;
}
