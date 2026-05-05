# AI Chat Application Design

## Overview

Local AI chat application with Node.js (NestJS) backend + React (Vite + Tailwind) frontend. Supports OpenAI-compatible API providers with SSE streaming, token statistics, conversation management, and SQLite persistence.

## Architecture

```
my-ai-agent/
├── server/                     # NestJS + TypeScript
│   ├── src/
│   │   ├── main.ts             # Bootstrap
│   │   ├── app.module.ts
│   │   ├── database/
│   │   │   ├── database.module.ts
│   │   │   └── database.service.ts    # better-sqlite3 wrapper
│   │   ├── chat/
│   │   │   ├── chat.module.ts
│   │   │   ├── chat.controller.ts     # POST /chat/send (SSE)
│   │   │   └── chat.service.ts        # LLM API call + stream relay
│   │   ├── conversations/
│   │   │   ├── conversations.module.ts
│   │   │   ├── conversations.controller.ts  # CRUD /conversations
│   │   │   └── conversations.service.ts
│   │   └── models/
│   │       ├── models.module.ts
│   │       ├── models.controller.ts    # CRUD /models
│   │       └── models.service.ts
│   ├── package.json
│   └── tsconfig.json
├── client/                     # React + Vite + Tailwind
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   ├── InputArea.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ModelDialog.tsx
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   └── useModels.ts
│   │   └── types.ts
│   ├── package.json
│   └── vite.config.ts
└── package.json                # Root workspace
```

## Database Schema (SQLite via better-sqlite3)

### conversations
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT | UUID |
| title | TEXT | Auto-generated from first message |
| model_id | TEXT | FK to models.id |
| created_at | TEXT | ISO 8601 |
| updated_at | TEXT | ISO 8601 |

### messages
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT | UUID |
| conversation_id | TEXT | FK to conversations.id |
| role | TEXT | 'user' | 'assistant' |
| content | TEXT | Message content |
| input_tokens | INTEGER | Tokens in prompt |
| output_tokens | INTEGER | Tokens in response |
| wait_time_ms | INTEGER | Time until first token |
| output_speed_tps | REAL | Tokens per second |
| created_at | TEXT | ISO 8601 |

### models
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT | UUID |
| name | TEXT | Display name |
| api_url | TEXT | Endpoint URL |
| api_key | TEXT | Encrypted or stored plain |
| model_name | TEXT | Model identifier sent to API |
| headers | TEXT | JSON string of custom headers |
| temperature | REAL | |
| top_p | REAL | |
| max_tokens | INTEGER | |
| stop | TEXT | JSON array of stop strings |
| frequency_penalty | REAL | |
| presence_penalty | REAL | |
| request_template | TEXT | JSON string to override request body |
| is_active | INTEGER | 0 | 1 |
| created_at | TEXT | ISO 8601 |

## API Endpoints

### Chat
- `POST /chat/send?conversationId=xxx` — SSE stream
  - Body: `{ content: string }`
  - Response: `text/event-stream`
  - Events:
    - `data: { type: "token", content: string, tokens: number }`
    - `data: { type: "done", inputTokens: number, outputTokens: number, waitTimeMs: number, outputSpeedTps: number }`
    - `data: { type: "error", message: string }`

### Conversations
- `GET /conversations` — List all conversations
- `POST /conversations` — Create new conversation (body: `{ modelId: string }`)
- `DELETE /conversations/:id` — Delete conversation and its messages
- `GET /conversations/:id/messages` — Get messages for a conversation

### Models
- `GET /models` — List all models
- `POST /models` — Create model config
- `PUT /models/:id` — Update model config
- `DELETE /models/:id` — Delete model config

## SSE Data Flow

1. Client sends `POST /chat/send?conversationId=xxx` with `{ content }`
2. Server creates message record (role=user), retrieves conversation history
3. Server calls LLM API with streaming=true
4. For each chunk received:
   - Accumulate content + token count
   - Write SSE event: `data: { "type": "token", "content": "...", "tokens": N }\n\n`
5. Client side:
   - On first token received → record `wait_time_ms`
   - For each chunk → update output speed = total_tokens / elapsed_seconds
6. Stream ends:
   - Server saves assistant message with final counts
   - Sends final event: `data: { "type": "done", "inputTokens": ..., "outputTokens": ..., "waitTimeMs": ..., "outputSpeedTps": ... }\n\n`
7. Client updates UI with statistics

## Frontend Component Tree

```
App
├── Sidebar
│   ├── ConversationList
│   │   └── ConversationItem (per conversation)
│   ├── NewChatButton
│   └── ModelSelector (dropdown)
├── ChatWindow
│   ├── MessageList
│   │   └── MessageItem (per message)
│   │       ├── MessageContent
│   │       └── TokenStats (input_tokens, output_tokens, wait_time, speed)
│   └── InputArea
│       └── SendButton
└── ModelDialog (modal overlay)
    ├── BasicFields (name, api_url, api_key, model_name)
    ├── HeaderList (key-value pairs for custom headers)
    ├── ParameterFields (temperature, top_p, max_tokens, stop)
    ├── PenaltyFields (frequency_penalty, presence_penalty)
    └── RequestTemplateEditor (JSON textarea)
```

## Dependencies

### Server
- `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`
- `better-sqlite3`, `@types/better-sqlite3`
- `uuid`, `@types/uuid`
- `rxjs` (NestJS SSE)
- Dev: `typescript`, `ts-node`, `@nestjs/cli`

### Client
- `react`, `react-dom`
- `vite`, `@vitejs/plugin-react`
- `tailwindcss`, `postcss`, `autoprefixer`
- `uuid`

## Key Design Decisions
- **better-sqlite3** over TypeORM/Prisma: minimal overhead, synchronous API simplifies NestJS service code, no migration complexity for single-file DB
- **No state management library**: React hooks + fetch are sufficient for this scale
- **No tiktoken dependency**: Use API-reported token counts (most providers return usage in response); fallback to rough estimation if unavailable
- **SSE via NestJS**: `@Sse()` decorator with RxJS Subject for clean stream management
- **request_template**: raw JSON overrides entire request body; user must include all required fields. Useful for provider-specific parameters not covered by standard fields.
