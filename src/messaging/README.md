# Gravity AI Messaging Architecture

## Overview

The Gravity AI messaging system uses a three-tier message architecture where the server publishes structured messages to clients via Redis channels. Messages can be either raw data, conversation state, or direct UI render instructions.

## Three-Tier JSON Architecture

### Tier 1: Raw Data

```json
{ "__typename": "JsonData", "data": {...} }
```

Client decides how to display raw JSON data.

### Tier 2: Conversation State

```json
{ "__typename": "ProgressUpdate", "message": "Processing...", "progress": 75 }
```

Powers AI conversation flow - goes into state slots (progressUpdate, messageChunks, etc.).

### Tier 3: Direct UI Render

```json
{ "__typename": "MovieCard", "components": [...] }
```

AI sends complete UI components - renders directly without conversation state.

## State Management

### activeResponseSlice.ts

Manages **conversation responses** tied to specific chatId:

- messageChunks: streaming text from AI
- progressUpdate: latest progress state
- jsonData: raw data from AI response
- actionSuggestion: AI-suggested actions

### appStateSlice.ts

Manages **global application state**:

- UI state (drawers, themes, navigation)
- Independent of conversation content

## Client Integration Rules

### Smart Components

Smart components read from state slots and render JSON data directly:

```typescript
// For conversation state messages - render JSON directly
export const Progress = () => {
  const { progressUpdate } = useActiveResponse();
  return progressUpdate ? (
    <ProgressBar 
      message={progressUpdate.message} 
      value={progressUpdate.progress} 
    />
  ) : null;
};

// For data messages - client decides presentation
export const JsonDisplay = () => {
  const { jsonData } = useActiveResponse();
  return jsonData.map((item, idx) => (
    <div key={idx}>
      <pre>{JSON.stringify(item.data, null, 2)}</pre>
    </div>
  ));
};

// For direct UI render - bypass conversation state
export const DirectRender = () => {
  // Tier 3 messages render immediately without state slots
  // Implementation depends on specific UI framework
};
```

### Flexible JSON Handling

Client uses flexible typing to handle any server JSON shape:

```typescript
// State stores any JSON shape from server
interface ActiveResponse {
  progressUpdate: any | null;    // Latest progress from server
  messageChunks: any[];          // Streaming text chunks
  jsonData: any[];               // Raw data arrays
  actionSuggestion: any | null;  // Latest action suggestions
}

// Components handle whatever JSON structure server sends
const Progress = () => {
  const { progressUpdate } = useActiveResponse();
  
  // Server can evolve data shape without breaking client
  return progressUpdate ? (
    <div>
      <span>{progressUpdate.message}</span>
      {progressUpdate.progress && <ProgressBar value={progressUpdate.progress} />}
      {progressUpdate.estimatedTime && <span>{progressUpdate.estimatedTime}</span>}
    </div>
  ) : null;
};
```

## Key Principles

1. **Server Controls Data Structure**: Server defines JSON shape for each message type
2. **Client Stores Flexibly**: Client accepts any JSON shape in semantic slots
3. **Components Render Directly**: Smart components read JSON and render however they want
4. **Semantic Slots**: Client state uses meaningful slots (progressUpdate, messageChunks) not generic arrays
5. **JSON-First Evolution**: Server can evolve data shapes without breaking client builds

## For LLM Instructions

When modifying the client:

- **Server is source of truth** for all message structure and data
- **Client stores any JSON shape** in appropriate semantic slots
- **Components handle JSON directly** - no mapping layer needed
- **Keep state slots aligned** with server message types (__typename)
- **Never create client-only message types** - they must exist on server first
- **Use flexible typing** (any) to allow server data evolution

The **3-tier architecture is preserved** but client implementation is simplified for maximum flexibility.

## Usage Example

**User**: "Recommend a movie"

**Tier 2 Response** (activeResponseSlice):

- MessageChunk: "I'd recommend..."
- JsonData: { movies: [...] }
- ActionSuggestion: "Watch Trailer"

**Tier 3 Injection** (direct render):

- MovieCard component with poster, rating, watch button

**App State** (appStateSlice):

- drawerOpen: true, theme: "dark"

## Implementation

```jsx
<GravityContainer>
  {(gravity) => (
    <>
      {/* Tier 1/2: State-driven */}
      <Progress /> {/* gravity.progressUpdate */}
      <Messages /> {/* gravity.messageChunks */}
      {/* Tier 3: Direct render */}
      <DirectRender />
    </>
  )}
</GravityContainer>
```
