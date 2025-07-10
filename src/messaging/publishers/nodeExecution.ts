/**
 * Node execution event publisher
 *
 * Publishes node execution events to the unified AI channel for debugging and monitoring.
 *
 * @module messaging/publishers/nodeExecution
 */

import { BaseMessage } from "../types";
import { BasePublisher, PublishOptions } from "./base";
import { Publisher } from "../Publisher";
import { AI_RESULT_CHANNEL } from "../../types";

/**
 * Node execution event message type
 */
export interface NodeExecutionEvent extends BaseMessage {
  __typename: "NodeExecutionEvent";
  component: {
    type: "NodeExecutionEvent";
    props: {
      workflowId: string;
      executionId: string;
      nodeId: string;
      nodeType: string;
      status: "completed" | "failed" | "running";
      result?: any;
      error?: string;
      duration?: number | null;
      triggeredSignals: Array<{
        targetNode: string;
        signal: string;
        inputs?: any;
      }>;
    };
  };
}

/**
 * NodeExecutionPublisher - Handles node execution events in unified AI channel
 */
export class NodeExecutionPublisher extends BasePublisher {
  /**
   * Publishes a workflow node completion event
   *
   * @param workflowId - Workflow ID
   * @param executionId - Execution ID
   * @param nodeId - Node ID that completed
   * @param nodeType - Type of node
   * @param status - Completion status
   * @param result - Node execution result
   * @param error - Error message if failed
   * @param duration - Execution duration in milliseconds
   * @param triggeredSignals - Signals triggered by this completion
   * @param baseMessage - Base message with required fields (chatId, conversationId, userId)
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishNodeCompletion(
    workflowId: string,
    executionId: string,
    nodeId: string,
    nodeType: string,
    status: "completed" | "failed" | "running",
    result: any,
    error: string | undefined,
    duration: number | null,
    triggeredSignals: Array<{ targetNode: string; signal: string; inputs?: any }>,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    // Helper function to sanitize outputs for subscription publishing
    const sanitizeOutputsForSubscription = (outputs: any) => {
      if (!outputs || typeof outputs !== 'object') return outputs;
      
      const sanitized = { ...outputs };
      
      // Remove or truncate large content fields that can break subscriptions
      if (sanitized.content && typeof sanitized.content === 'string') {
        const contentSize = Buffer.byteLength(sanitized.content, 'utf8');
        if (contentSize > 50000) { // 50KB limit
          sanitized.content = `[CONTENT_TRUNCATED: ${contentSize} bytes - use downloadUrl]`;
        }
      }
      
      return sanitized;
    };

    // Publish in GraphQL NodeExecutionEvent format for direct subscription consumption
    const nodeExecutionEvent = {
      ...baseMessage,  // Include conversationId, chatId, userId, providerId
      __typename: "NodeExecutionEvent",
      executionId,
      workflowId,
      nodeId,
      nodeType,
      state: status === "completed" ? "COMPLETED" : status === "running" ? "STARTED" : "ERROR",
      timestamp: new Date().toISOString(),
      duration,
      outputs: status === "completed" ? sanitizeOutputsForSubscription(result) : null,
      error: status === "failed" ? error : null,
      triggeredSignals: triggeredSignals.map(signal => ({
        __typename: "TriggeredSignal",
        targetNode: signal.targetNode,
        signal: signal.signal,
        inputs: signal.inputs
      }))
    };

    // Use AI channel for unified event publishing
    const customOptions: PublishOptions = {
      ...options,
      channel: options?.channel || AI_RESULT_CHANNEL
    };

    await this.publish(nodeExecutionEvent as any, customOptions);
  }
}

// Singleton instance for maximum performance
let nodeExecutionPublisherInstance: NodeExecutionPublisher | null = null;

/**
 * Get singleton NodeExecutionPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param host - Redis host (required on first call)
 * @param port - Redis port (required on first call)
 * @param password - Redis password (required on first call)
 * @param providerId - Provider ID (required on first call)
 * @param username - Redis username (optional)
 * @param db - Redis database number (optional)
 * @returns Singleton NodeExecutionPublisher instance
 */
export function getNodeExecutionPublisher(
  host?: string, 
  port?: number, 
  password?: string, 
  providerId?: string, 
  username?: string, 
  db?: number
): NodeExecutionPublisher {
  if (!nodeExecutionPublisherInstance) {
    if (!host || !port || password === undefined || !providerId) {
      throw new Error('NodeExecutionPublisher requires host, port, password, and providerId on first call');
    }
    
    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db);
    nodeExecutionPublisherInstance = new NodeExecutionPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }

  return nodeExecutionPublisherInstance;
}
