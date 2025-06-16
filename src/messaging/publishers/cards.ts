/**
 * Card Publisher - Publisher for card component data
 * 
 * This publisher accepts flexible card JSON structures and publishes them as card components.
 * The client renders these as card components with the provided data structure.
 */

import { BasePublisher, PublishOptions } from "./base";
import type { BaseMessage } from "../types";
import { Publisher } from "../Publisher";

export interface Card extends BaseMessage {
  __typename: "Cards";
  component: {
    type: "cards";
    props: any; // Accept any JSON structure for card data
  };
}

export class CardPublisher extends BasePublisher {
  /**
   * Publish card data with flexible JSON structure
   * @param cardData - Any JSON structure for card data
   * @param baseMessage - Base message properties
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishCard(
    cardData: any,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const message: Card = {
      ...this.createBaseMessage(baseMessage),
      __typename: "Cards",
      component: {
        type: "cards",
        props: cardData, // Pass through any JSON structure
      },
    };

    await this.publish(message as any, options);
  }

  /**
   * Publish multiple cards (for workflow service compatibility)
   * @param cardsData - Array of card data or single card data
   * @param baseMessage - Base message properties
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishCards(
    cardsData: any[] | any,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const cardsArray = Array.isArray(cardsData) ? cardsData : [cardsData];
    
    // Publish all cards as a single event with array data
    const message: Card = {
      ...this.createBaseMessage(baseMessage),
      __typename: "Cards",
      component: {
        type: "cards",
        props: cardsArray, // Pass the entire array
      },
    };

    await this.publish(message as any, options);
  }
}

// Singleton instance for performance
let cardPublisherInstance: CardPublisher | null = null;

/**
 * Get singleton CardPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param serverUrl - Server URL (required on first call)
 * @param apiKey - API key (required on first call) 
 * @param providerId - Provider ID (required on first call)
 * @returns Singleton CardPublisher instance
 */
export function getCardPublisher(serverUrl?: string, apiKey?: string, providerId?: string): CardPublisher {
  if (!cardPublisherInstance) {
    if (!serverUrl || !apiKey || !providerId) {
      throw new Error('CardPublisher requires serverUrl, apiKey, and providerId on first call');
    }
    
    const publisher = Publisher.fromCredentials(serverUrl, apiKey, providerId);
    cardPublisherInstance = new CardPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }
  
  return cardPublisherInstance;
}
