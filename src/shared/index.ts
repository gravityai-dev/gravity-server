/**
 * Shared exports for both server and client
 */

export * from './types';

// Utility function to transform server messages to client format
export function transformServerToClientMessage(serverMessage: any): any {
  const { type, ...rest } = serverMessage;
  
  // Map type to __typename if not already present
  const __typename = serverMessage.__typename || 
    (type ? type.split('_').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('') : undefined);
  
  return {
    __typename,
    ...rest,
    // Ensure state is lowercase
    state: rest.state?.toLowerCase() || 'idle'
  };
}
