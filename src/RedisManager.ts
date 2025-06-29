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
  // Create a unique key for the connection pool based on connection parameters
  const connectionKey = `${options.host}:${options.port}:${options.db || 0}:${options.username || 'default'}`;
  
  if (standardConnections.has(connectionKey)) {
    return standardConnections.get(connectionKey)!;
  }

  // Create config object for ioredis
  const config = {
    host: options.host,
    port: options.port,
    username: options.username,
    password: options.password,
    db: options.db || 0,
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
    enableOfflineQueue: true,
  };

  const client = new Redis(config);
  standardConnections.set(connectionKey, client);
  
  return client;
}

/**
 * Get a dedicated Redis connection for pub/sub operations
 * Always creates a new connection for pub/sub to avoid conflicts
 */
export function getPubSubConnection(options: RedisOptions): Redis {
  const connectionKey = `${options.host}:${options.port}:${options.db || 0}:${options.username || 'default'}`;
  
  if (pubsubConnections.has(connectionKey)) {
    return pubsubConnections.get(connectionKey)!;
  }

  const config = createConfig(options);
  const client = new Redis(config);
  pubsubConnections.set(connectionKey, client);
  
  return client;
}

/**
 * Get Redis options from environment variables
 */
export function getRedisOptions(): RedisOptions {
  return {
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!, 10),
    username: process.env.REDIS_USERNAME!,
    password: process.env.REDIS_PASSWORD!,
  };
}

/**
 * Create RedisOptions from server config values
 * Preferred method for proper Redis configuration
 */
export function getOptionsFromConfig(
  host: string,
  port: number,
  username?: string | null,
  password?: string | null
): RedisOptions {
  return {
    host,
    port,
    username: username || undefined,
    password: password || undefined,
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
