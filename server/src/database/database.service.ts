import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import initSqlJs, { Database } from 'sql.js'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Database
  private dbPath: string

  async onModuleInit() {
    const SQL = await initSqlJs()
    const dataDir = path.resolve(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

    this.dbPath = process.env.DB_PATH || path.resolve(dataDir, 'chat.db')

    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath)
      this.db = new SQL.Database(buffer)
    } else {
      this.db = new SQL.Database()
    }

    this.db.run('PRAGMA journal_mode = WAL')
    this.initSchema()
    this.migrate()
    this.save()
  }

  private migrate() {
    // Add missing columns
    const cols = this.db.prepare("PRAGMA table_info('models')")
    const existing: string[] = []
    while (cols.step()) existing.push(cols.getAsObject().name)
    cols.free()
    if (!existing.includes('thinking_enabled')) {
      this.db.run('ALTER TABLE models ADD COLUMN thinking_enabled INTEGER NOT NULL DEFAULT 0')
    }
  }

  private initSchema() {
    this.db.run(`
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
        thinking_enabled INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT '新对话',
        model_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (model_id) REFERENCES models(id)
      )
    `)
    this.db.run(`
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
      )
    `)
  }

  save(): void {
    const data = this.db.export()
    fs.writeFileSync(this.dbPath, Buffer.from(data))
  }

  getDb(): Database {
    return this.db
  }

  onModuleDestroy() {
    this.save()
    this.db.close()
  }
}
