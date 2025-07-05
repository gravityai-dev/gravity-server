/**
 * Questions Publisher - Publisher for follow-up questions data
 * 
 * This publisher accepts an array of question strings and publishes them as follow-up questions.
 * The client renders these as interactive question buttons or suggestions.
 */

import { BasePublisher, PublishOptions } from "./base";
import type { BaseMessage } from "../types";
import { Publisher } from "../Publisher";

export interface Questions extends BaseMessage {
  __typename: "Questions";
  component: {
    type: "questions";
    props: string[]; // Array of question strings
  };
}

export class QuestionsPublisher extends BasePublisher {
  /**
   * Publish follow-up questions
   * @param questions - Array of question strings
   * @param baseMessage - Base message properties
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishQuestions(
    questions: string[],
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const message: Questions = {
      ...this.createBaseMessage(baseMessage),
      __typename: "Questions",
      component: {
        type: "questions",
        props: questions, // Pass the array of question strings
      },
    };

    await this.publish(message as any, options);
  }
}

// Singleton instance for performance
let questionsPublisherInstance: QuestionsPublisher | null = null;

/**
 * Get singleton QuestionsPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param host - Redis host (required on first call)
 * @param port - Redis port (required on first call)
 * @param password - Redis password (required on first call)
 * @param providerId - Provider ID (required on first call)
 * @param username - Redis username (optional)
 * @param db - Redis database number (optional)
 * @returns Singleton QuestionsPublisher instance
 */
export function getQuestionsPublisher(
  host?: string, 
  port?: number, 
  password?: string, 
  providerId?: string, 
  username?: string, 
  db?: number
): QuestionsPublisher {
  if (!questionsPublisherInstance) {
    if (!host || !port || password === undefined || !providerId) {
      throw new Error('QuestionsPublisher requires host, port, password, and providerId on first call');
    }
    
    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db);
    questionsPublisherInstance = new QuestionsPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }

  return questionsPublisherInstance;
}
