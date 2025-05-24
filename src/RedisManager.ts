/**
 * Redis Connection Manager
 * 
 * Centralizes Redis connection management to avoid redundant connections.
 * Maintains separate pools for standard and pub/sub connections.
 */

import Redis from "ioredis";

// Connection pools
const standardConnections = new Map<string, Redis>();
const pubsubConnections = new Map<string, Redis>();

/**
 * Redis connection options with standardized fields
 */
export interface RedisOptions {
  host: string;
  port: number;
  password?: string;
  username?: string;
  db?: number;
  // Add any other common Redis options here
}

/**
 * Get a unique key based on connection options
 */
function getConnectionKey(options: RedisOptions): string {
  return `${options.host}:${options.port}:${options.db || 0}:${options.username || ""}`;
}

/**
 * Create a Redis configuration with sensible defaults
 */
function createConfig(options: RedisOptions): any {
  return {
    host: options.host,
    port: options.port,
    password: options.password,
    username: options.username,
    db: options.db || 0,
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
    enableOfflineQueue: true,
    // Add other common options here
  };
}

/**
 * Get a Redis connection for standard commands
 * Reuses existing connections when possible
 */
export function getStandardConnection(options: RedisOptions): Redis {
  const key = getConnectionKey(options);
  
  if (!standardConnections.has(key)) {
    const config = createConfig(options);
    const client = new Redis(config);
    
    client.on('error', (err) => {
      console.error(`[Redis] Error on ${options.host}:${options.port}: ${err.message}`);
    });
    
    standardConnections.set(key, client);
  }
  
  return standardConnections.get(key)!;
}

/**
 * Get a dedicated Redis connection for pub/sub operations
 * Always creates a new connection for pub/sub to avoid conflicts
 */
export function getPubSubConnection(options: RedisOptions): Redis {
  const key = getConnectionKey(options);
  
  if (!pubsubConnections.has(key)) {
    const config = createConfig(options);
    const client = new Redis(config);
    
    client.on('error', (err) => {
      console.error(`[Redis] PubSub Error on ${options.host}:${options.port}: ${err.message}`);
    });
    
    pubsubConnections.set(key, client);
  }
  
  return pubsubConnections.get(key)!;
}

/**
 * Parse connection details from a URL and API key
 */
export function getOptionsFromCredentials(serverUrl: string, apiKey: string): RedisOptions {
  // Extract hostname from URL
  let host = "localhost";
  try {
    const url = new URL(serverUrl);
    
    // Redis is always at the same host as the server
    host = url.hostname;
  } catch (error) {
    console.warn(`[Redis] Invalid server URL: ${serverUrl}`);
  }

  return {
    host,
    port: 6379,
    password: apiKey,
  };
}

/**
 * Close all connections in the pool
 * Useful for cleanup or tests
 */
export async function closeAllConnections(): Promise<void> {
  const closePromises: Promise<string>[] = [];
  
  standardConnections.forEach((client, key) => {
    closePromises.push(
      client.quit().then(() => {
        standardConnections.delete(key);
        return `Standard connection ${key}`;
      })
    );
  });
  
  pubsubConnections.forEach((client, key) => {
    closePromises.push(
      client.quit().then(() => {
        pubsubConnections.delete(key);
        return `PubSub connection ${key}`;
      })
    );
  });
  
  await Promise.all(closePromises);
}

// Re-export Redis class for convenience 
export { Redis };
