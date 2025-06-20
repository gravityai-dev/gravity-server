/**
 * Node execution publisher
 *
 * Publisher for workflow node execution updates.
 *
 * @module messaging/publishers/nodeExecution
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";
import { Publisher } from "../Publisher";

/**
 * Node execution update message type
 */
export interface NodeExecution extends BaseMessage {
  __typename: "NodeExecution";
  workflowId: string;
  workflowRunId: string;
  nodeId: string;
  nodeType: string;
  status: "running" | "completed" | "failed" | "skipped";
  output?: any;
  error?: string;
  executionTime?: number;
  timestamp: string;
}

/**
 * NodeExecutionPublisher - Handles node execution update messages
 */
export class NodeExecutionPublisher extends BasePublisher {
  /**
   * Publishes a node execution update
   *
   * @param nodeData - Node execution data
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishNodeExecution(
    nodeData: {
      workflowId: string;
      workflowRunId: string;
      nodeId: string;
      nodeType: string;
      status: "running" | "completed" | "failed" | "skipped";
      output?: any;
      error?: string;
      executionTime?: number;
    },
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const nodeExecution: NodeExecution = {
      ...this.createBaseMessage(baseMessage),
      __typename: "NodeExecution",
      ...nodeData,
      timestamp: new Date().toISOString(),
    };

    await this.publish(nodeExecution as any, options);
  }
}

// Singleton instance for maximum performance
let nodeExecutionPublisherInstance: NodeExecutionPublisher | null = null;

/**
 * Get singleton NodeExecutionPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param serverUrl - Server URL (required on first call)
 * @param apiKey - API key (required on first call) 
 * @param providerId - Provider ID (required on first call)
 * @returns Singleton NodeExecutionPublisher instance
 */
export function getNodeExecutionPublisher(serverUrl?: string, apiKey?: string, providerId?: string): NodeExecutionPublisher {
  if (!nodeExecutionPublisherInstance) {
    if (!serverUrl || !apiKey || !providerId) {
      throw new Error('NodeExecutionPublisher requires serverUrl, apiKey, and providerId on first call');
    }
    
    const publisher = Publisher.fromCredentials(serverUrl, apiKey, providerId);
    nodeExecutionPublisherInstance = new NodeExecutionPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }
  
  return nodeExecutionPublisherInstance;
}
