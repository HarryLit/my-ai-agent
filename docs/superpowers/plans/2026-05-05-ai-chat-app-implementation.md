# AI Chat App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a local AI chat app with NestJS backend + React frontend, supporting OpenAI-compatible models with SSE streaming, token statistics, and SQLite persistence.

**Architecture:** Monorepo with `server/` (NestJS + better-sqlite3) and `client/` (React + Vite + Tailwind). SSE streaming via NestJS `@Sse()`. Token stats computed client-side (wait time, output speed) and server-side (token counts from API).

**Tech Stack:** NestJS, better-sqlite3, React 18, Vite, Tailwind CSS, RxJS, uuid

---

### Task 1: Root Workspace + Project Scaffolding

**Files:**
- Create: `package.json` (root)
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `client/package.json`
- Create: `client/vite.config.ts`
- Create: `client/tsconfig.json`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/index.html`
- Create: `client/src/main.tsx`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "my-ai-agent",
  "private": true,
  "workspaces": ["server", "client"]
}
```

- [ ] **Step 2: Create server package.json**

```json
{
  "name": "server",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "nest start",
    "dev": "nest start --watch",
    "build": "nest build",
    "test": "jest --passWithNoTests"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "better-sqlite3": "^11.0.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/better-sqlite3": "^7.6.0",
    "@types/express": "^4.17.0",
    "@types/jest": "^29.0.0",
    "@types/node": "^20.0.0",
    "@types/uuid": "^9.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "ts-node": "^10.0.0",
    "typescript": "^5.0.0"
  }
}
```

- [ ] **Step 3: Create server/tsconfig.json**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 4: Create client package.json**

```json
{
  "name": "client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 5: Create client/vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

- [ ] **Step 6: Create client/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Create client/tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}
```

- [ ] **Step 8: Create client/postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

- [ ] **Step 9: Create client/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Chat</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 10: Create client/src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 11: Create client/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 12: Install dependencies**

Run: `npm install` at root

---

### Task 2: Server - Database Service

**Files:**
- Create: `server/src/app.module.ts`
- Create: `server/src/main.ts`
- Create: `server/src/database/database.module.ts`
- Create: `server/src/database/database.service.ts`
- Create: `server/src/database/database.service.spec.ts`

- [ ] **Step 1: Create app.module.ts**

```ts
import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'

@Module({
  imports: [DatabaseModule]
})
export class AppModule {}
```

- [ ] **Step 2: Create main.ts**

```ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  await app.listen(3000)
  console.log('Server running on http://localhost:3000')
}
bootstrap()
```

- [ ] **Step 3: Create database.service.ts**

```ts
import { Injectable, OnModuleDestroy } from '@nestjs/common'
import Database from 'better-sqlite3'
import path from 'path'

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private db: Database.Database

  constructor() {
    const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'data', 'chat.db')
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.initSchema()
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS models (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        api_url TEXT NOT NULL,
        api_key TEXT NOT NULL DEFAULT '',
        model_name TEXT NOT NULL DEFAULT '',
        headers TEXT NOT NULL DEFAULT '{}',
        temperature REAL,
        top_p REAL,
        max_tokens INTEGER,
        stop TEXT DEFAULT '[]',
        frequency_penalty REAL,
        presence_penalty REAL,
        request_template TEXT DEFAULT '',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT '新对话',
        model_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (model_id) REFERENCES models(id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        content TEXT NOT NULL DEFAULT '',
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        wait_time_ms INTEGER DEFAULT 0,
        output_speed_tps REAL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      );
    `)
  }

  getDb(): Database.Database {
    return this.db
  }

  onModuleDestroy() {
    this.db.close()
  }
}
```

- [ ] **Step 4: Create database.module.ts**

```ts
import { Global, Module } from '@nestjs/common'
import { DatabaseService } from './database.service'

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService]
})
export class DatabaseModule {}
```

- [ ] **Step 5: Create database.service.spec.ts**

```ts
import { Test, TestingModule } from '@nestjs/testing'
import { DatabaseService } from './database.service'
import path from 'path'
import fs from 'fs'

describe('DatabaseService', () => {
  let service: DatabaseService
  const testDbPath = path.resolve(process.cwd(), 'data', 'test-chat.db')

  beforeEach(async () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath)
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseService,
          useFactory: () => {
            process.env.DB_PATH = testDbPath
            return new DatabaseService()
          }
        }
      ]
    }).compile()
    service = module.get<DatabaseService>(DatabaseService)
  })

  afterEach(() => {
    service.onModuleDestroy()
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath)
    }
  })

  it('should initialize and create tables', () => {
    const db = service.getDb()
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as any[]
    const tableNames = tables.map(t => t.name)
    expect(tableNames).toContain('models')
    expect(tableNames).toContain('conversations')
    expect(tableNames).toContain('messages')
  })
})
```

- [ ] **Step 6: Create jest config for server**

Create `server/jest.config.js`:

```js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node'
}
```

- [ ] **Step 7: Run tests**

Run: `npm run test --prefix server`
Expected: PASS (DatabaseService should initialize and create tables)

---

### Task 3: Server - Models Module (CRUD)

**Files:**
- Create: `server/src/models/models.module.ts`
- Create: `server/src/models/models.controller.ts`
- Create: `server/src/models/models.service.ts`
- Create: `server/src/models/models.service.spec.ts`
- Modify: `server/src/app.module.ts`

- [ ] **Step 1: Create models.service.ts**

```ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { v4 as uuid } from 'uuid'

export interface ModelConfig {
  id: string
  name: string
  api_url: string
  api_key: string
  model_name: string
  headers: string
  temperature: number | null
  top_p: number | null
  max_tokens: number | null
  stop: string
  frequency_penalty: number | null
  presence_penalty: number | null
  request_template: string
  is_active: number
  created_at: string
}

export interface CreateModelDto {
  name: string
  api_url: string
  api_key?: string
  model_name?: string
  headers?: Record<string, string>
  temperature?: number
  top_p?: number
  max_tokens?: number
  stop?: string[]
  frequency_penalty?: number
  presence_penalty?: number
  request_template?: string
}

@Injectable()
export class ModelsService {
  constructor(private db: DatabaseService) {}

  findAll(): ModelConfig[] {
    return this.db.getDb().prepare('SELECT * FROM models ORDER BY created_at DESC').all() as ModelConfig[]
  }

  findOne(id: string): ModelConfig {
    const model = this.db.getDb().prepare('SELECT * FROM models WHERE id = ?').get(id) as ModelConfig | undefined
    if (!model) throw new NotFoundException('Model not found')
    return model
  }

  create(dto: CreateModelDto): ModelConfig {
    const id = uuid()
    const headers = dto.headers ? JSON.stringify(dto.headers) : '{}'
    const stop = dto.stop ? JSON.stringify(dto.stop) : '[]'
    this.db.getDb().prepare(`
      INSERT INTO models (id, name, api_url, api_key, model_name, headers, temperature, top_p, max_tokens, stop, frequency_penalty, presence_penalty, request_template)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, dto.name, dto.api_url, dto.api_key || '', dto.model_name || '', headers, dto.temperature ?? null, dto.top_p ?? null, dto.max_tokens ?? null, stop, dto.frequency_penalty ?? null, dto.presence_penalty ?? null, dto.request_template || '')
    return this.findOne(id)
  }

  update(id: string, dto: Partial<CreateModelDto>): ModelConfig {
    this.findOne(id)
    const fields: string[] = []
    const values: any[] = []
    if (dto.name !== undefined) { fields.push('name = ?'); values.push(dto.name) }
    if (dto.api_url !== undefined) { fields.push('api_url = ?'); values.push(dto.api_url) }
    if (dto.api_key !== undefined) { fields.push('api_key = ?'); values.push(dto.api_key) }
    if (dto.model_name !== undefined) { fields.push('model_name = ?'); values.push(dto.model_name) }
    if (dto.headers !== undefined) { fields.push('headers = ?'); values.push(JSON.stringify(dto.headers)) }
    if (dto.temperature !== undefined) { fields.push('temperature = ?'); values.push(dto.temperature) }
    if (dto.top_p !== undefined) { fields.push('top_p = ?'); values.push(dto.top_p) }
    if (dto.max_tokens !== undefined) { fields.push('max_tokens = ?'); values.push(dto.max_tokens) }
    if (dto.stop !== undefined) { fields.push('stop = ?'); values.push(JSON.stringify(dto.stop)) }
    if (dto.frequency_penalty !== undefined) { fields.push('frequency_penalty = ?'); values.push(dto.frequency_penalty) }
    if (dto.presence_penalty !== undefined) { fields.push('presence_penalty = ?'); values.push(dto.presence_penalty) }
    if (dto.request_template !== undefined) { fields.push('request_template = ?'); values.push(dto.request_template) }
    if (fields.length > 0) {
      values.push(id)
      this.db.getDb().prepare(`UPDATE models SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    }
    return this.findOne(id)
  }

  delete(id: string): void {
    this.findOne(id)
    this.db.getDb().prepare('DELETE FROM models WHERE id = ?').run(id)
  }
}
```

- [ ] **Step 2: Create models.controller.ts**

```ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { ModelsService, CreateModelDto } from './models.service'

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  findAll() {
    return this.modelsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modelsService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateModelDto) {
    return this.modelsService.create(dto)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateModelDto>) {
    return this.modelsService.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.modelsService.delete(id)
    return { success: true }
  }
}
```

- [ ] **Step 3: Create models.module.ts**

```ts
import { Module } from '@nestjs/common'
import { ModelsController } from './models.controller'
import { ModelsService } from './models.service'

@Module({
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService]
})
export class ModelsModule {}
```

- [ ] **Step 4: Update app.module.ts**

```ts
import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { ModelsModule } from './models/models.module'

@Module({
  imports: [DatabaseModule, ModelsModule]
})
export class AppModule {}
```

- [ ] **Step 5: Create models.service.spec.ts**

```ts
import { Test, TestingModule } from '@nestjs/testing'
import { ModelsService } from './models.service'
import { DatabaseService } from '../database/database.service'
import path from 'path'
import fs from 'fs'

describe('ModelsService', () => {
  let service: ModelsService
  let testDbPath: string

  beforeAll(() => {
    testDbPath = path.resolve(process.cwd(), 'data', 'test-models.db')
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath)
    process.env.DB_PATH = testDbPath
  })

  afterAll(() => {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath)
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModelsService, DatabaseService]
    }).compile()
    service = module.get<ModelsService>(ModelsService)
  })

  it('should create and find a model', () => {
    const model = service.create({
      name: 'Test Model',
      api_url: 'https://api.openai.com/v1',
      model_name: 'gpt-3.5-turbo',
      temperature: 0.7
    })
    expect(model.id).toBeDefined()
    expect(model.name).toBe('Test Model')

    const found = service.findOne(model.id)
    expect(found.name).toBe('Test Model')
  })

  it('should update a model', () => {
    const model = service.create({ name: 'M1', api_url: 'https://example.com' })
    const updated = service.update(model.id, { temperature: 0.5 })
    expect(updated.temperature).toBe(0.5)
  })

  it('should delete a model', () => {
    const model = service.create({ name: 'M2', api_url: 'https://example.com' })
    service.delete(model.id)
    expect(() => service.findOne(model.id)).toThrow()
  })

  it('should list all models', () => {
    service.create({ name: 'A', api_url: 'https://a.com' })
    service.create({ name: 'B', api_url: 'https://b.com' })
    const all = service.findAll()
    expect(all.length).toBeGreaterThanOrEqual(2)
  })
})
```

- [ ] **Step 6: Run models tests**

Run: `npx jest --prefix server --testPathPattern models.service.spec`
Expected: PASS

---

### Task 4: Server - Conversations Module (CRUD)

**Files:**
- Create: `server/src/conversations/conversations.module.ts`
- Create: `server/src/conversations/conversations.controller.ts`
- Create: `server/src/conversations/conversations.service.ts`
- Create: `server/src/conversations/conversations.service.spec.ts`
- Modify: `server/src/app.module.ts`

- [ ] **Step 1: Create conversations.service.ts**

```ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { v4 as uuid } from 'uuid'

export interface Conversation {
  id: string
  title: string
  model_id: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  input_tokens: number
  output_tokens: number
  wait_time_ms: number
  output_speed_tps: number
  created_at: string
}

@Injectable()
export class ConversationsService {
  constructor(private db: DatabaseService) {}

  findAll(): Conversation[] {
    return this.db.getDb().prepare('SELECT * FROM conversations ORDER BY updated_at DESC').all() as Conversation[]
  }

  findOne(id: string): Conversation {
    const conv = this.db.getDb().prepare('SELECT * FROM conversations WHERE id = ?').get(id) as Conversation | undefined
    if (!conv) throw new NotFoundException('Conversation not found')
    return conv
  }

  create(modelId: string): Conversation {
    const id = uuid()
    this.db.getDb().prepare('INSERT INTO conversations (id, model_id) VALUES (?, ?)').run(id, modelId)
    return this.findOne(id)
  }

  delete(id: string): void {
    this.findOne(id)
    this.db.getDb().prepare('DELETE FROM conversations WHERE id = ?').run(id)
  }

  updateTitle(id: string, title: string): Conversation {
    this.findOne(id)
    this.db.getDb().prepare("UPDATE conversations SET title = ?, updated_at = datetime('now') WHERE id = ?").run(title, id)
    return this.findOne(id)
  }

  getMessages(conversationId: string): Message[] {
    this.findOne(conversationId)
    return this.db.getDb().prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(conversationId) as Message[]
  }

  addMessage(msg: { conversation_id: string; role: 'user' | 'assistant'; content: string; input_tokens?: number; output_tokens?: number; wait_time_ms?: number; output_speed_tps?: number }): Message {
    const id = uuid()
    this.db.getDb().prepare(`
      INSERT INTO messages (id, conversation_id, role, content, input_tokens, output_tokens, wait_time_ms, output_speed_tps)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, msg.conversation_id, msg.role, msg.content, msg.input_tokens ?? 0, msg.output_tokens ?? 0, msg.wait_time_ms ?? 0, msg.output_speed_tps ?? 0)
    this.db.getDb().prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(msg.conversation_id)
    return this.db.getDb().prepare('SELECT * FROM messages WHERE id = ?').get(id) as Message
  }
}
```

- [ ] **Step 2: Create conversations.controller.ts**

```ts
import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common'
import { ConversationsService } from './conversations.service'

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly convService: ConversationsService) {}

  @Get()
  findAll() {
    return this.convService.findAll()
  }

  @Post()
  create(@Body('modelId') modelId: string) {
    return this.convService.create(modelId)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.convService.delete(id)
    return { success: true }
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string) {
    return this.convService.getMessages(id)
  }
}
```

- [ ] **Step 3: Create conversations.module.ts**

```ts
import { Module } from '@nestjs/common'
import { ConversationsController } from './conversations.controller'
import { ConversationsService } from './conversations.service'

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService]
})
export class ConversationsModule {}
```

- [ ] **Step 4: Update app.module.ts**

```ts
import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { ModelsModule } from './models/models.module'
import { ConversationsModule } from './conversations/conversations.module'

@Module({
  imports: [DatabaseModule, ModelsModule, ConversationsModule]
})
export class AppModule {}
```

- [ ] **Step 5: Create conversations.service.spec.ts**

```ts
import { Test, TestingModule } from '@nestjs/testing'
import { ConversationsService } from './conversations.service'
import { DatabaseService } from '../database/database.service'
import path from 'path'
import fs from 'fs'

describe('ConversationsService', () => {
  let service: ConversationsService
  let dbService: DatabaseService
  let testDbPath: string
  let modelId: string

  beforeAll(() => {
    testDbPath = path.resolve(process.cwd(), 'data', 'test-conv.db')
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath)
    process.env.DB_PATH = testDbPath
  })

  afterAll(() => {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath)
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversationsService, DatabaseService]
    }).compile()
    service = module.get<ConversationsService>(ConversationsService)
    dbService = module.get<DatabaseService>(DatabaseService)
    modelId = 'test-model-id'
    dbService.getDb().prepare('INSERT OR IGNORE INTO models (id, name, api_url) VALUES (?, ?, ?)').run(modelId, 'Test', 'https://example.com')
  })

  it('should create and find a conversation', () => {
    const conv = service.create(modelId)
    expect(conv.id).toBeDefined()
    const found = service.findOne(conv.id)
    expect(found.id).toBe(conv.id)
  })

  it('should add messages to a conversation', () => {
    const conv = service.create(modelId)
    service.addMessage({ conversation_id: conv.id, role: 'user', content: 'Hello', input_tokens: 5 })
    service.addMessage({ conversation_id: conv.id, role: 'assistant', content: 'Hi there', output_tokens: 3, wait_time_ms: 200, output_speed_tps: 15.5 })
    const msgs = service.getMessages(conv.id)
    expect(msgs).toHaveLength(2)
    expect(msgs[0].role).toBe('user')
    expect(msgs[1].output_speed_tps).toBe(15.5)
  })

  it('should delete a conversation', () => {
    const conv = service.create(modelId)
    service.delete(conv.id)
    expect(() => service.findOne(conv.id)).toThrow()
  })
})
```

- [ ] **Step 6: Run conversations tests**

Run: `npx jest --prefix server --testPathPattern conversations.service.spec`
Expected: PASS

---

### Task 5: Server - Chat Module (SSE Streaming)

**Files:**
- Create: `server/src/chat/chat.module.ts`
- Create: `server/src/chat/chat.controller.ts`
- Create: `server/src/chat/chat.service.ts`
- Modify: `server/src/app.module.ts`

- [ ] **Step 1: Create chat.service.ts**

```ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Observable, Observer } from 'rxjs'
import { DatabaseService } from '../database/database.service'
import { ConversationsService } from '../conversations/conversations.service'
import { ModelsService, ModelConfig } from '../models/models.service'

interface StreamEvent {
  type: 'token' | 'done' | 'error'
  content?: string
  tokens?: number
  inputTokens?: number
  outputTokens?: number
  waitTimeMs?: number
  outputSpeedTps?: number
  message?: string
}

@Injectable()
export class ChatService {
  constructor(
    private db: DatabaseService,
    private convService: ConversationsService,
    private modelsService: ModelsService
  ) {}

  sendMessage(conversationId: string, content: string): Observable<StreamEvent> {
    return new Observable((observer: Observer<StreamEvent>) => {
      let conv: any
      try {
        conv = this.convService.findOne(conversationId)
      } catch {
        observer.next({ type: 'error', message: 'Conversation not found' })
        observer.complete()
        return
      }

      let model: ModelConfig
      try {
        model = this.modelsService.findOne(conv.model_id)
      } catch {
        observer.next({ type: 'error', message: 'Model not found' })
        observer.complete()
        return
      }

      const startTime = Date.now()
      let firstTokenTime: number | null = null
      let accumulatedContent = ''
      let outputTokens = 0
      let inputTokens = 0

      // Save user message
      this.convService.addMessage({ conversation_id: conversationId, role: 'user', content })

      // Build messages array from history
      const history = this.convService.getMessages(conversationId)
      const messages = history.map(m => ({ role: m.role, content: m.content }))

      // Build request body
      const body: Record<string, any> = {
        model: model.model_name || model.name,
        messages,
        stream: true
      }
      if (model.temperature !== null) body.temperature = model.temperature
      if (model.top_p !== null) body.top_p = model.top_p
      if (model.max_tokens !== null) body.max_tokens = model.max_tokens
      if (model.stop && model.stop !== '[]') body.stop = JSON.parse(model.stop)
      if (model.frequency_penalty !== null) body.frequency_penalty = model.frequency_penalty
      if (model.presence_penalty !== null) body.presence_penalty = model.presence_penalty
      if (model.request_template) {
        try {
          const tmpl = JSON.parse(model.request_template)
          Object.assign(body, tmpl)
        } catch {}
      }

      // Parse custom headers
      let customHeaders: Record<string, string> = {}
      try { customHeaders = JSON.parse(model.headers) } catch {}

      // Count input tokens roughly (4 chars per token)
      const inputText = messages.map(m => m.content).join(' ')
      inputTokens = Math.ceil(inputText.length / 4)

      fetch(model.api_url + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.api_key}`,
          ...customHeaders
        },
        body: JSON.stringify(body)
      }).then(async res => {
        if (!res.ok) {
          const errText = await res.text()
          observer.next({ type: 'error', message: `API error ${res.status}: ${errText}` })
          observer.complete()
          return
        }

        const reader = res.body?.getReader()
        if (!reader) {
          observer.next({ type: 'error', message: 'No response body' })
          observer.complete()
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        const processChunk = () => {
          while (buffer.includes('\n')) {
            const idx = buffer.indexOf('\n')
            const line = buffer.slice(0, idx).trim()
            buffer = buffer.slice(idx + 1)

            if (!line || line.startsWith(':')) continue
            if (!line.startsWith('data: ')) continue

            const data = line.slice(6)
            if (data === '[DONE]') {
              // Stream done
              const waitTime = firstTokenTime ? firstTokenTime - startTime : 0
              const elapsed = firstTokenTime ? (Date.now() - firstTokenTime) / 1000 : 1
              const speed = outputTokens / Math.max(elapsed, 0.01)

              this.convService.addMessage({
                conversation_id: conversationId,
                role: 'assistant',
                content: accumulatedContent,
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                wait_time_ms: waitTime,
                output_speed_tps: parseFloat(speed.toFixed(2))
              })

              // Auto-generate title from first user message
              if (accumulatedContent.length > 0 && history.length <= 1) {
                const title = content.slice(0, 30) + (content.length > 30 ? '...' : '')
                this.convService.updateTitle(conversationId, title)
              }

              observer.next({
                type: 'done',
                inputTokens,
                outputTokens,
                waitTimeMs: waitTime,
                outputSpeedTps: parseFloat(speed.toFixed(2))
              })
              observer.complete()
              return
            }

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta
              const finishReason = parsed.choices?.[0]?.finish_reason

              if (delta?.content) {
                if (!firstTokenTime) firstTokenTime = Date.now()
                accumulatedContent += delta.content
                outputTokens = Math.ceil(accumulatedContent.length / 4)
                observer.next({ type: 'token', content: delta.content, tokens: outputTokens })
              }

              if (finishReason === 'stop') {
                // Will be handled by [DONE]
              }
            } catch {}
          }
        }

        const pump = () => {
          reader!.read().then(({ done, value }) => {
            if (done) {
              processChunk()
              return
            }
            buffer += decoder.decode(value, { stream: true })
            processChunk()
            pump()
          }).catch(err => {
            observer.next({ type: 'error', message: err.message })
            observer.complete()
          })
        }
        pump()
      }).catch(err => {
        observer.next({ type: 'error', message: err.message })
        observer.complete()
      })
    })
  }
}
```

- [ ] **Step 2: Create chat.controller.ts**

```ts
import { Controller, Sse, Post, Query, Body } from '@nestjs/common'
import { ChatService } from './chat.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  @Sse()
  send(
    @Query('conversationId') conversationId: string,
    @Body('content') content: string
  ): Observable<MessageEvent> {
    return this.chatService.sendMessage(conversationId, content).pipe(
      map(data => ({
        data: JSON.stringify(data)
      } as MessageEvent))
    )
  }
}
```

- [ ] **Step 3: Create chat.module.ts**

```ts
import { Module } from '@nestjs/common'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ConversationsModule } from '../conversations/conversations.module'
import { ModelsModule } from '../models/models.module'

@Module({
  imports: [ConversationsModule, ModelsModule],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
```

- [ ] **Step 4: Update app.module.ts**

```ts
import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { ModelsModule } from './models/models.module'
import { ConversationsModule } from './conversations/conversations.module'
import { ChatModule } from './chat/chat.module'

@Module({
  imports: [DatabaseModule, ModelsModule, ConversationsModule, ChatModule]
})
export class AppModule {}
```

- [ ] **Step 5: Verify server builds**

Run: `npx @nestjs/cli build --prefix server` (or `npx tsc --project server/tsconfig.json --noEmit`)
Expected: No errors

---

### Task 6: Client - Types + API Layer

**Files:**
- Create: `client/src/types.ts`
- Create: `client/src/api.ts`

- [ ] **Step 1: Create client/src/types.ts**

```ts
export interface ModelConfig {
  id: string
  name: string
  api_url: string
  api_key: string
  model_name: string
  headers: string
  temperature: number | null
  top_p: number | null
  max_tokens: number | null
  stop: string
  frequency_penalty: number | null
  presence_penalty: number | null
  request_template: string
  is_active: number
  created_at: string
}

export interface Conversation {
  id: string
  title: string
  model_id: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  input_tokens: number
  output_tokens: number
  wait_time_ms: number
  output_speed_tps: number
  created_at: string
}

export interface StreamEvent {
  type: 'token' | 'done' | 'error'
  content?: string
  tokens?: number
  inputTokens?: number
  outputTokens?: number
  waitTimeMs?: number
  outputSpeedTps?: number
  message?: string
}
```

- [ ] **Step 2: Create client/src/api.ts**

```ts
import type { ModelConfig, Conversation, Message, StreamEvent } from './types'

const BASE = '/api'

export async function fetchModels(): Promise<ModelConfig[]> {
  const res = await fetch(`${BASE}/models`)
  return res.json()
}

export async function createModel(data: Partial<ModelConfig>): Promise<ModelConfig> {
  const res = await fetch(`${BASE}/models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function updateModel(id: string, data: Partial<ModelConfig>): Promise<ModelConfig> {
  const res = await fetch(`${BASE}/models/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function deleteModel(id: string): Promise<void> {
  await fetch(`${BASE}/models/${id}`, { method: 'DELETE' })
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${BASE}/conversations`)
  return res.json()
}

export async function createConversation(modelId: string): Promise<Conversation> {
  const res = await fetch(`${BASE}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelId })
  })
  return res.json()
}

export async function deleteConversation(id: string): Promise<void> {
  await fetch(`${BASE}/conversations/${id}`, { method: 'DELETE' })
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`${BASE}/conversations/${conversationId}/messages`)
  return res.json()
}

export function sendChatMessage(
  conversationId: string,
  content: string,
  onEvent: (event: StreamEvent) => void,
  onError: (err: Error) => void
): AbortController {
  const controller = new AbortController()

  fetch(`${BASE}/chat/send?conversationId=${conversationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
    signal: controller.signal
  }).then(async res => {
    if (!res.ok) {
      onError(new Error(`HTTP ${res.status}`))
      return
    }
    const reader = res.body?.getReader()
    if (!reader) {
      onError(new Error('No response body'))
      return
    }
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      while (buffer.includes('\n')) {
        const idx = buffer.indexOf('\n')
        const line = buffer.slice(0, idx).trim()
        buffer = buffer.slice(idx + 1)
        if (!line || !line.startsWith('data: ')) continue
        try {
          const event: StreamEvent = JSON.parse(line.slice(6))
          onEvent(event)
        } catch {}
      }
    }
  }).catch(err => {
    if (err.name !== 'AbortError') onError(err)
  })

  return controller
}
```

---

### Task 7: Client - Hooks

**Files:**
- Create: `client/src/hooks/useChat.ts`
- Create: `client/src/hooks/useModels.ts`
- Create: `client/src/hooks/useConversations.ts`

- [ ] **Step 1: Create useModels.ts**

```ts
import { useState, useEffect, useCallback } from 'react'
import type { ModelConfig } from '../types'
import * as api from '../api'

export function useModels() {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [activeModelId, setActiveModelId] = useState<string>('')

  const load = useCallback(async () => {
    const list = await api.fetchModels()
    setModels(list)
    if (list.length > 0 && !list.find(m => m.id === activeModelId)) {
      setActiveModelId(list[0].id)
    }
  }, [activeModelId])

  useEffect(() => { load() }, [])

  const create = async (data: Partial<ModelConfig>) => {
    const m = await api.createModel(data)
    await load()
    setActiveModelId(m.id)
    return m
  }

  const update = async (id: string, data: Partial<ModelConfig>) => {
    await api.updateModel(id, data)
    await load()
  }

  const remove = async (id: string) => {
    await api.deleteModel(id)
    if (activeModelId === id) setActiveModelId('')
    await load()
  }

  return { models, activeModelId, setActiveModelId, create, update, remove, load }
}
```

- [ ] **Step 2: Create useConversations.ts**

```ts
import { useState, useEffect, useCallback } from 'react'
import type { Conversation } from '../types'
import * as api from '../api'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string>('')

  const load = useCallback(async () => {
    const list = await api.fetchConversations()
    setConversations(list)
    if (list.length > 0 && !list.find(c => c.id === activeConvId)) {
      setActiveConvId(list[0].id)
    }
  }, [activeConvId])

  useEffect(() => { load() }, [])

  const create = async (modelId: string) => {
    const conv = await api.createConversation(modelId)
    await load()
    setActiveConvId(conv.id)
    return conv
  }

  const remove = async (id: string) => {
    await api.deleteConversation(id)
    if (activeConvId === id) setActiveConvId('')
    await load()
  }

  return { conversations, activeConvId, setActiveConvId, create, remove, load }
}
```

- [ ] **Step 3: Create useChat.ts**

```ts
import { useState, useRef, useCallback } from 'react'
import type { Message, StreamEvent } from '../types'
import * as api from '../api'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamStats, setStreamStats] = useState<{ inputTokens: number; outputTokens: number; waitTimeMs: number; outputSpeedTps: number } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const loadMessages = useCallback(async (conversationId: string) => {
    const msgs = await api.fetchMessages(conversationId)
    setMessages(msgs)
    setStreamingContent('')
    setStreamStats(null)
  }, [])

  const send = useCallback((conversationId: string, content: string) => {
    setIsStreaming(true)
    setStreamingContent('')
    setStreamStats(null)

    abortRef.current = api.sendChatMessage(conversationId, content,
      (event: StreamEvent) => {
        if (event.type === 'token') {
          setStreamingContent(prev => prev + (event.content || ''))
        } else if (event.type === 'done') {
          setIsStreaming(false)
          setStreamStats({
            inputTokens: event.inputTokens || 0,
            outputTokens: event.outputTokens || 0,
            waitTimeMs: event.waitTimeMs || 0,
            outputSpeedTps: event.outputSpeedTps || 0
          })
          // Reload messages to get the saved assistant message
          api.fetchMessages(conversationId).then(setMessages)
          setStreamingContent('')
        } else if (event.type === 'error') {
          setIsStreaming(false)
          console.error('Stream error:', event.message)
        }
      },
      (err: Error) => {
        setIsStreaming(false)
        console.error(err)
      }
    )
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return { messages, isStreaming, streamingContent, streamStats, loadMessages, send, stop }
}
```

---

### Task 8: Client - Components (Sidebar + ModelDialog)

**Files:**
- Create: `client/src/components/Sidebar.tsx`
- Create: `client/src/components/ModelDialog.tsx`

- [ ] **Step 1: Create Sidebar.tsx**

```tsx
import { useState } from 'react'
import type { Conversation, ModelConfig } from '../types'

interface SidebarProps {
  conversations: Conversation[]
  activeConvId: string
  models: ModelConfig[]
  activeModelId: string
  onSelectConv: (id: string) => void
  onNewConv: () => void
  onDeleteConv: (id: string) => void
  onModelChange: (id: string) => void
  onOpenModelConfig: () => void
}

export default function Sidebar({
  conversations, activeConvId, models, activeModelId,
  onSelectConv, onNewConv, onDeleteConv, onModelChange, onOpenModelConfig
}: SidebarProps) {
  return (
    <div className="w-72 h-full bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewConv}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
        >
          + 新对话
        </button>
      </div>

      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <select
            value={activeModelId}
            onChange={e => onModelChange(e.target.value)}
            className="flex-1 bg-gray-800 text-white text-sm rounded px-2 py-1.5 border border-gray-600"
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button
            onClick={onOpenModelConfig}
            className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600"
            title="模型管理"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelectConv(conv.id)}
            className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-800 ${
              conv.id === activeConvId ? 'bg-gray-700' : ''
            }`}
          >
            <span className="text-sm truncate flex-1">{conv.title}</span>
            <button
              onClick={e => { e.stopPropagation(); onDeleteConv(conv.id) }}
              className="p-1 hover:text-red-400 opacity-0 hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ModelDialog.tsx**

```tsx
import { useState, useEffect } from 'react'
import type { ModelConfig } from '../types'

interface ModelDialogProps {
  open: boolean
  models: ModelConfig[]
  onClose: () => void
  onCreate: (data: Partial<ModelConfig>) => Promise<ModelConfig>
  onUpdate: (id: string, data: Partial<ModelConfig>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

interface HeaderEntry {
  key: string
  value: string
}

function ModelForm({ model, onSave, onCancel }: {
  model?: ModelConfig
  onSave: (data: Partial<ModelConfig>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(model?.name || '')
  const [apiUrl, setApiUrl] = useState(model?.api_url || '')
  const [apiKey, setApiKey] = useState(model?.api_key || '')
  const [modelName, setModelName] = useState(model?.model_name || '')
  const [temperature, setTemperature] = useState(model?.temperature?.toString() || '')
  const [topP, setTopP] = useState(model?.top_p?.toString() || '')
  const [maxTokens, setMaxTokens] = useState(model?.max_tokens?.toString() || '')
  const [stop, setStop] = useState(model?.stop ? JSON.parse(model.stop).join(', ') : '')
  const [frequencyPenalty, setFrequencyPenalty] = useState(model?.frequency_penalty?.toString() || '')
  const [presencePenalty, setPresencePenalty] = useState(model?.presence_penalty?.toString() || '')
  const [requestTemplate, setRequestTemplate] = useState(model?.request_template || '')
  const [headers, setHeaders] = useState<HeaderEntry[]>(() => {
    if (model?.headers) {
      try { return Object.entries(JSON.parse(model.headers)).map(([k, v]) => ({ key: k, value: v as string })) } catch {}
    }
    return []
  })

  const handleSave = () => {
    const headerObj: Record<string, string> = {}
    headers.forEach(h => { if (h.key) headerObj[h.key] = h.value })
    onSave({
      name,
      api_url: apiUrl,
      api_key: apiKey,
      model_name: modelName,
      headers: headerObj,
      temperature: temperature ? parseFloat(temperature) : undefined,
      top_p: topP ? parseFloat(topP) : undefined,
      max_tokens: maxTokens ? parseInt(maxTokens) : undefined,
      stop: stop ? stop.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      frequency_penalty: frequencyPenalty ? parseFloat(frequencyPenalty) : undefined,
      presence_penalty: presencePenalty ? parseFloat(presencePenalty) : undefined,
      request_template: requestTemplate || undefined
    })
  }

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }])
  const removeHeader = (i: number) => setHeaders(headers.filter((_, idx) => idx !== i))
  const updateHeader = (i: number, field: 'key' | 'value', val: string) => {
    const h = [...headers]
    h[i][field] = val
    setHeaders(h)
  }

  const inputClass = "w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
  const labelClass = "block text-xs text-gray-400 mb-1"

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>名称 *</label>
          <input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder="My Model" />
        </div>
        <div>
          <label className={labelClass}>Model Name</label>
          <input className={inputClass} value={modelName} onChange={e => setModelName(e.target.value)} placeholder="gpt-4" />
        </div>
      </div>
      <div>
        <label className={labelClass}>API URL *</label>
        <input className={inputClass} value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://api.openai.com/v1" />
      </div>
      <div>
        <label className={labelClass}>API Key</label>
        <input className={inputClass} type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-..." />
      </div>

      <div>
        <label className={labelClass}>自定义请求头</label>
        {headers.map((h, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <input className={`${inputClass} flex-1`} placeholder="header name" value={h.key} onChange={e => updateHeader(i, 'key', e.target.value)} />
            <input className={`${inputClass} flex-1`} placeholder="value" value={h.value} onChange={e => updateHeader(i, 'value', e.target.value)} />
            <button onClick={() => removeHeader(i)} className="px-2 text-red-400 hover:text-red-300">×</button>
          </div>
        ))}
        <button onClick={addHeader} className="text-xs text-blue-400 hover:text-blue-300">+ 添加请求头</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Temperature</label>
          <input className={inputClass} type="number" step="0.1" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="0.7" />
        </div>
        <div>
          <label className={labelClass}>Top P</label>
          <input className={inputClass} type="number" step="0.1" value={topP} onChange={e => setTopP(e.target.value)} placeholder="1" />
        </div>
        <div>
          <label className={labelClass}>Max Tokens</label>
          <input className={inputClass} type="number" value={maxTokens} onChange={e => setMaxTokens(e.target.value)} placeholder="2048" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Frequency Penalty</label>
          <input className={inputClass} type="number" step="0.1" value={frequencyPenalty} onChange={e => setFrequencyPenalty(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className={labelClass}>Presence Penalty</label>
          <input className={inputClass} type="number" step="0.1" value={presencePenalty} onChange={e => setPresencePenalty(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className={labelClass}>Stop Sequences</label>
          <input className={inputClass} value={stop} onChange={e => setStop(e.target.value)} placeholder="comma, separated" />
        </div>
      </div>

      <div>
        <label className={labelClass}>自定义请求 Body (JSON，覆盖默认字段)</label>
        <textarea className={`${inputClass} h-24 font-mono text-xs`} value={requestTemplate} onChange={e => setRequestTemplate(e.target.value)} placeholder='{"max_tokens": 4096, "extra_param": "value"}' />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="px-4 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded">取消</button>
        <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded">{model ? '保存' : '创建'}</button>
      </div>
    </div>
  )
}

export default function ModelDialog({ open, models, onClose, onCreate, onUpdate, onDelete }: ModelDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const editingModel = editingId ? models.find(m => m.id === editingId) : undefined

  useEffect(() => { if (!open) { setShowForm(false); setEditingId(null) } }, [open])

  if (!open) return null

  const handleSave = async (data: Partial<ModelConfig>) => {
    if (editingId) {
      await onUpdate(editingId, data)
    } else {
      await onCreate(data)
    }
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-[640px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">模型管理</h2>
          <button onClick={onClose} className="p-1 hover:text-gray-300">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!showForm ? (
            <div className="space-y-2">
              {models.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.model_name || m.api_url}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(m.id); setShowForm(true) }} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded">编辑</button>
                    <button onClick={() => onDelete(m.id)} className="px-3 py-1 text-sm bg-red-700 hover:bg-red-600 rounded">删除</button>
                  </div>
                </div>
              ))}
              <button onClick={() => { setEditingId(null); setShowForm(true) }} className="w-full py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg">
                + 添加模型
              </button>
            </div>
          ) : (
            <ModelForm model={editingModel} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingId(null) }} />
          )}
        </div>
      </div>
    </div>
  )
}
```

---

### Task 9: Client - Chat Components

**Files:**
- Create: `client/src/components/InputArea.tsx`
- Create: `client/src/components/MessageItem.tsx`
- Create: `client/src/components/MessageList.tsx`
- Create: `client/src/components/ChatWindow.tsx`

- [ ] **Step 1: Create InputArea.tsx**

```tsx
import { useState, useRef, useEffect } from 'react'

interface InputAreaProps {
  onSend: (content: string) => void
  onStop: () => void
  isStreaming: boolean
  disabled: boolean
}

export default function InputArea({ onSend, onStop, isStreaming, disabled }: InputAreaProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [text])

  const handleSend = () => {
    if (!text.trim() || isStreaming || disabled) return
    onSend(text.trim())
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-700 p-4 bg-gray-900">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? '请先选择模型' : '输入消息...'}
          disabled={disabled || isStreaming}
          rows={1}
          className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 resize-none outline-none border border-gray-600 focus:border-blue-500 placeholder-gray-500 text-sm"
        />
        {isStreaming ? (
          <button
            onClick={onStop}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-sm whitespace-nowrap"
          >
            停止
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl text-sm whitespace-nowrap"
          >
            发送
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create MessageItem.tsx**

```tsx
import type { Message } from '../types'

interface MessageItemProps {
  message?: Message
  streamingContent?: string
  streamStats?: { inputTokens: number; outputTokens: number; waitTimeMs: number; outputSpeedTps: number } | null
  isStreaming?: boolean
}

export default function MessageItem({ message, streamingContent, streamStats, isStreaming }: MessageItemProps) {
  const isUser = message?.role === 'user'
  const content = message?.content || streamingContent || ''
  const showStats = !isUser && (message || streamStats)

  const stats = message ? {
    input: message.input_tokens,
    output: message.output_tokens,
    wait: message.wait_time_ms,
    speed: message.output_speed_tps
  } : streamStats

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] ${isUser ? 'order-1' : 'order-1'}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-800 text-gray-100 rounded-bl-md'
        }`}>
          <div className="text-sm whitespace-pre-wrap break-words">{content}</div>
          {isStreaming && content && (
            <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-0.5" />
          )}
        </div>

        {showStats && (message || streamStats) && stats && (
          <div className={`flex gap-3 mt-1 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {stats.input > 0 && <span>⬇ {stats.input} tokens</span>}
            {stats.output > 0 && <span>⬆ {stats.output} tokens</span>}
            {stats.wait > 0 && <span>⏳ {stats.wait}ms</span>}
            {stats.speed > 0 && <span>⚡ {stats.speed} t/s</span>}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create MessageList.tsx**

```tsx
import { useRef, useEffect } from 'react'
import type { Message } from '../types'
import MessageItem from './MessageItem'

interface MessageListProps {
  messages: Message[]
  streamingContent?: string
  streamStats?: { inputTokens: number; outputTokens: number; waitTimeMs: number; outputSpeedTps: number } | null
  isStreaming: boolean
}

export default function MessageList({ messages, streamingContent, streamStats, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 && !isStreaming && (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          发送消息开始对话
        </div>
      )}
      {messages.map((msg, i) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      {isStreaming && (
        <MessageItem
          streamingContent={streamingContent}
          streamStats={streamStats}
          isStreaming
        />
      )}
      <div ref={bottomRef} />
    </div>
  )
}
```

- [ ] **Step 4: Create ChatWindow.tsx**

```tsx
import MessageList from './MessageList'
import InputArea from './InputArea'

interface ChatWindowProps {
  messages: any[]
  streamingContent: string
  streamStats: any
  isStreaming: boolean
  hasActiveConv: boolean
  hasActiveModel: boolean
  onSend: (content: string) => void
  onStop: () => void
}

export default function ChatWindow({
  messages, streamingContent, streamStats, isStreaming,
  hasActiveConv, hasActiveModel, onSend, onStop
}: ChatWindowProps) {
  return (
    <div className="flex-1 flex flex-col bg-gray-950">
      {!hasActiveConv ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          选择一个对话或创建新对话
        </div>
      ) : (
        <>
          <MessageList
            messages={messages}
            streamingContent={streamingContent}
            streamStats={streamStats}
            isStreaming={isStreaming}
          />
          <InputArea
            onSend={onSend}
            onStop={onStop}
            isStreaming={isStreaming}
            disabled={!hasActiveModel}
          />
        </>
      )}
    </div>
  )
}
```

---

### Task 10: Client - App Integration

**Files:**
- Create: `client/src/App.tsx`
- Delete or modify: `client/src/App.css` (if exists, delete)

- [ ] **Step 1: Create App.tsx**

```tsx
import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import ModelDialog from './components/ModelDialog'
import { useModels } from './hooks/useModels'
import { useConversations } from './hooks/useConversations'
import { useChat } from './hooks/useChat'

export default function App() {
  const models = useModels()
  const conversations = useConversations()
  const chat = useChat()
  const [modelDialogOpen, setModelDialogOpen] = useState(false)

  useEffect(() => {
    if (conversations.activeConvId) {
      chat.loadMessages(conversations.activeConvId)
    }
  }, [conversations.activeConvId])

  const handleSend = (content: string) => {
    if (!conversations.activeConvId) return
    chat.send(conversations.activeConvId, content)
  }

  const handleNewConv = () => {
    if (!models.activeModelId) return
    conversations.create(models.activeModelId)
  }

  const handleSelectConv = (id: string) => {
    if (chat.isStreaming) chat.stop()
    conversations.setActiveConvId(id)
  }

  const handleDeleteConv = async (id: string) => {
    if (chat.isStreaming) chat.stop()
    await conversations.remove(id)
  }

  return (
    <div className="h-screen flex bg-gray-950 text-white">
      <Sidebar
        conversations={conversations.conversations}
        activeConvId={conversations.activeConvId}
        models={models.models}
        activeModelId={models.activeModelId}
        onSelectConv={handleSelectConv}
        onNewConv={handleNewConv}
        onDeleteConv={handleDeleteConv}
        onModelChange={models.setActiveModelId}
        onOpenModelConfig={() => setModelDialogOpen(true)}
      />
      <ChatWindow
        messages={chat.messages}
        streamingContent={chat.streamingContent}
        streamStats={chat.streamStats}
        isStreaming={chat.isStreaming}
        hasActiveConv={!!conversations.activeConvId}
        hasActiveModel={!!models.activeModelId}
        onSend={handleSend}
        onStop={chat.stop}
      />
      <ModelDialog
        open={modelDialogOpen}
        models={models.models}
        onClose={() => setModelDialogOpen(false)}
        onCreate={models.create}
        onUpdate={models.update}
        onDelete={models.remove}
      />
    </div>
  )
}
```

---

### Task 11: Verify Build

- [ ] **Step 1: Verify server builds**

Run: `npx tsc --project server/tsconfig.json --noEmit`
Expected: No type errors

- [ ] **Step 2: Verify client builds**

Run: `npx tsc --project client/tsconfig.json --noEmit`
Expected: No type errors

- [ ] **Step 3: Start server and test**

Run: `npm run dev --prefix server`
Expected: Server starts on port 3000

- [ ] **Step 4: Start client**

Run: `npm run dev --prefix client`
Expected: Vite dev server starts, open http://localhost:5173

- [ ] **Step 5: Verify end-to-end flow**

1. Open http://localhost:5173
2. Click "模型管理" (gear icon) → add a model with API URL and key
3. Click "新对话" → new conversation created
4. Type message → send → verify SSE streaming works
5. Verify token stats appear after response completes
6. Verify conversation persists after page refresh
