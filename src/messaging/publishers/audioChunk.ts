/**
 * Audio chunk message publisher
 *
 * @module messaging/publishers/audioChunk
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";

/**
 * Audio chunk message type
 */
export interface AudioChunk extends BaseMessage {
  __typename: "AudioChunk";
  audioData: string; // Base64 encoded audio data
  format: string; // Audio format (mp3, wav, etc)
  duration?: number; // Duration in seconds
  textReference: string; // The text this audio represents
  sourceType: string; // "MessageChunk" or "ProgressUpdate"
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
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishAudioChunk(
    audioData: string,
    format: string,
    textReference: string,
    sourceType: string,
    duration: number | undefined,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const audioChunk: AudioChunk = {
      ...this.createBaseMessage(baseMessage),
      __typename: "AudioChunk",
      audioData,
      format,
      textReference,
      sourceType,
      duration,
    };

    await this.publish(audioChunk, options);
  }
}
