/**
 * Shared code between server and client
 */

export * from './types';
export * from './templateHelpers';

// Utility function to transform server messages to client format
export function transformServerMessage(message: any) {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    metadata: message.metadata
  };
}
