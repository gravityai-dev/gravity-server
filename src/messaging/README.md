# Gravity AI Messaging Architecture

## Overview

The Gravity AI messaging system uses a **component-first architecture** where the server publishes **Shadcn-style JSON component specifications** to clients via Redis channels. The client receives these JSON specs and hydrates them with actual UI components.

## 🎯 Core Concept: JSON Component Specifications

**The server sends JSON that describes UI components, not raw data.** Think of it like Shadcn components but as JSON specifications that the client can hydrate.

### Example: Card Component
**Server sends this JSON:**
```json
{
  "__typename": "Card",
  "component": {
    "type": "Card",
    "props": {
      "title": "Awesome Movie",
      "description": "A great film you should watch",
      "image": {
        "src": "https://example.com/poster.jpg",
        "alt": "Movie poster",
        "className": "rounded-lg"
      },
      "button": {
        "variant": "primary",
        "size": "lg",
        "children": "Watch Now",
        "href": "/watch/movie-123",
        "icon": "play"
      }
    }
  }
}
```

**Client hydrates with actual components:**
```jsx
<Card className={props.className}>
  <CardTitle>{props.title}</CardTitle>
  <CardDescription>{props.description}</CardDescription>
  {props.image && <img src={props.image.src} alt={props.image.alt} />}
  {props.button && (
    <Button 
      variant={props.button.variant} 
      size={props.button.size}
      href={props.button.href}
    >
      {props.button.icon && <Icon name={props.button.icon} />}
      {props.button.children}
    </Button>
  )}
</Card>
```

## Three-Tier Message Architecture

### Tier 1: Raw Data
```json
{ "__typename": "JsonData", "data": {...} }
```
Client decides how to display raw JSON data.

### Tier 2: Conversation State (Component Specs)
```json
{ 
  "__typename": "ProgressUpdate", 
  "component": {
    "type": "ProgressUpdate",
    "props": { "message": "Processing...", "progress": 75 }
  }
}
```
Powers AI conversation flow with **component specifications**.

### Tier 3: Direct UI Render (Component Arrays)
```json
{ 
  "__typename": "MovieCards", 
  "components": [
    { "type": "Card", "props": {...} },
    { "type": "Card", "props": {...} },
    { "type": "Card", "props": {...} }
  ]
}
```
AI sends complete UI component arrays - renders directly without conversation state.

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

## 🤖 For LLMs: How to Send Component Specifications

### Key Principle: Send JSON Component Specs, Not Raw Data

**❌ Don't send raw data:**
```json
{ "title": "Movie", "image": "poster.jpg", "link": "/watch" }
```

**✅ Send component specifications:**
```json
{
  "__typename": "Card",
  "component": {
    "type": "Card",
    "props": {
      "title": "Movie Title",
      "image": { "src": "poster.jpg", "alt": "Movie poster" },
      "button": { "variant": "primary", "children": "Watch Now", "href": "/watch" }
    }
  }
}
```

### Available Component Types

#### 1. Card Components
```typescript
// Single card
await cardPublisher.publishCard({
  title: "Product Name",
  description: "Product description",
  image: { src: "image.jpg", alt: "Product image", className: "rounded" },
  button: { variant: "default", children: "Buy Now", href: "/buy/123" }
}, baseMessage);

// Multiple cards (for product lists, search results, etc.)
await cardPublisher.publishCards([
  { title: "Card 1", description: "First card" },
  { title: "Card 2", description: "Second card" },
  { title: "Card 3", description: "Third card" }
], baseMessage);
```

#### 2. Progress Updates
```typescript
await progressPublisher.publishProgressUpdate(
  "Processing your request...", 
  75, // progress percentage
  baseMessage
);
```

#### 3. Text Messages
```typescript
await textPublisher.publishText(
  "Here's your response text",
  baseMessage
);
```

### Component Property Patterns

#### Button Properties
```typescript
button: {
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link',
  size: 'default' | 'sm' | 'lg' | 'icon',
  children: "Button Text",
  href?: "https://example.com",
  onClick?: "handleClick",
  icon?: "play" | "download" | "external-link",
  className?: "custom-styles"
}
```

#### Image Properties
```typescript
image: {
  src: "https://example.com/image.jpg",
  alt: "Descriptive alt text",
  className?: "rounded-lg shadow-md"
}
```

### When to Use Each Tier

- **Tier 1 (JsonData)**: Raw data that client will format (databases, APIs, lists)
- **Tier 2 (Component Specs)**: Single components for conversation flow (progress, cards, messages)
- **Tier 3 (Component Arrays)**: Multiple components for complex layouts (dashboards, galleries, lists)

### LLM Best Practices

1. **Always think in components**: Ask "What UI component does this data represent?"
2. **Use semantic properties**: `button.children` not `buttonText`, `image.src` not `imageUrl`
3. **Include accessibility**: Always provide `alt` text for images
4. **Choose appropriate variants**: Use Shadcn variants (`primary`, `outline`, etc.)
5. **Structure for hydration**: Organize props so client can easily map to actual components

## 🧠 LLM Mental Model

### Think Like a Frontend Developer

When you need to send information to the user, **don't think about raw data**. Instead, think:

1. **"What UI component would display this best?"**
   - Product info → Card component
   - Progress status → ProgressUpdate component  
   - Simple text → Text component

2. **"What props does this component need?"**
   - Card needs: title, description, image, button
   - Button needs: variant, children, href
   - Image needs: src, alt

3. **"How would a developer structure this?"**
   ```typescript
   // Think like this:
   <Card>
     <CardTitle>{title}</CardTitle>
     <CardDescription>{description}</CardDescription>
     <img src={image.src} alt={image.alt} />
     <Button variant={button.variant} href={button.href}>
       {button.children}
     </Button>
   </Card>
   
   // Then send the JSON equivalent:
   {
     "type": "Card",
     "props": {
       "title": "...",
       "description": "...", 
       "image": { "src": "...", "alt": "..." },
       "button": { "variant": "default", "children": "...", "href": "..." }
     }
   }
   ```

### Quick Decision Tree

- **Showing progress?** → ProgressUpdate component
- **Displaying item(s) with actions?** → Card component(s)  
- **Just text response?** → Text component
- **Raw data for client to format?** → JsonData

**Remember: You're sending component specifications, not data. The client will hydrate these specs into actual UI components.**

## Usage Example

**User**: "Recommend a movie"

**Tier 2 Response** (conversation state):
```json
{
  "__typename": "ProgressUpdate",
  "component": {
    "type": "ProgressUpdate", 
    "props": { "message": "Searching movies...", "progress": 50 }
  }
}
```

**Tier 2 Response** (card component):
```json
{
  "__typename": "Card",
  "component": {
    "type": "Card",
    "props": {
      "title": "The Matrix",
      "description": "A computer hacker learns about the true nature of reality.",
      "image": { "src": "/matrix-poster.jpg", "alt": "The Matrix movie poster" },
      "button": { "variant": "default", "children": "Watch Trailer", "href": "/trailer/matrix" }
    }
  }
}
```

**Tier 3 Response** (multiple cards):
```json
{
  "__typename": "MovieCards",
  "components": [
    { "type": "Card", "props": { "title": "The Matrix", "description": "...", "button": {...} } },
    { "type": "Card", "props": { "title": "Inception", "description": "...", "button": {...} } },
    { "type": "Card", "props": { "title": "Interstellar", "description": "...", "button": {...} } }
  ]
}
```

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
