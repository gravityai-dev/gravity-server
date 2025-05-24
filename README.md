# @gravityai-dev/gravity-server

Integration SDK for the Gravity AI orchestration platform. Connect any AI platform to Gravity in minutes.

## Features

- 🚀 **Simple Integration** - Connect to Gravity with just a few lines of code
- 🔌 **Platform Agnostic** - Works with n8n, LangChain, and any Node.js application
- 📡 **Real-time Communication** - Built on Redis pub/sub for instant message delivery
- 🎯 **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 🔧 **Minimal Dependencies** - Only requires Redis and a few core libraries

## Installation

```bash
npm install @gravityai-dev/gravity-server
```

## Quick Start

### Basic Publisher

```typescript
import { Publisher } from '@gravityai-dev/gravity-server';

// Initialize publisher
const publisher = Publisher.fromCredentials(
  'https://api.gravityai.dev',  // Your Gravity server URL
  'your-api-key',                 // Your API key
  'my-service'                    // Your service identifier
);

// Send a message
await publisher.publish('gravity:query', {
  chatId: 'chat-123',
  conversationId: 'conv-456',
  message: 'Hello from my service!',
  userId: 'user-456'
});
```

### Event Subscription

```typescript
import { EventBus } from '@gravityai-dev/gravity-server';

// Create event bus
const eventBus = EventBus.fromCredentials(
  'https://api.gravityai.dev',  // Your Gravity server URL
  'your-api-key',                 // Your API key
  'my-service'                    // Your service identifier
);

// Subscribe to messages
const unsubscribe = await eventBus.subscribe('gravity:query', async (message) => {
  console.log('Received message:', message);
  
  // Process the message
  // ...
});

// Later: cleanup
await unsubscribe();
```

## API Reference

### Publisher

The `Publisher` class handles sending messages to Gravity.

#### Methods

- `Publisher.fromCredentials(serverUrl, apiKey, providerId)` - Create a publisher instance
- `publish(channel, message)` - Send a message to a specific channel
- `publishQueryMessage(message)` - Send a query message
- `publishResponseMessage(message)` - Send a response message
- `publishStreamMessage(message)` - Send a stream message
- `publishUpdateMessage(message)` - Send an update message

### EventBus

The `EventBus` class handles bidirectional communication with Gravity.

#### Methods

- `EventBus.fromCredentials(serverUrl, apiKey, providerId)` - Create an event bus instance
- `subscribe(channel, handler)` - Subscribe to messages on a channel
- `publish(channel, message)` - Send a message to a channel

### Message Types

All messages must include:
- `chatId` - Unique chat identifier
- `conversationId` - Conversation thread identifier
- `userId` - User identifier

## n8n Integration

This SDK is designed to work seamlessly with n8n workflows. See the [n8n-nodes-gravity](https://github.com/gravityai-dev/n8n-nodes-gravity) package for pre-built n8n nodes.

## License

MIT
