import { Injectable, NotFoundException } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { DatabaseService } from '../database/database.service'

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
  constructor(private dbService: DatabaseService) {}

  private getDb() { return this.dbService.getDb() }

  findAll(): Conversation[] {
    const stmt = this.getDb().prepare('SELECT * FROM conversations ORDER BY updated_at DESC')
    const rows: Conversation[] = []
    while (stmt.step()) rows.push(stmt.getAsObject() as unknown as Conversation)
    stmt.free()
    return rows
  }

  findOne(id: string): Conversation {
    const stmt = this.getDb().prepare('SELECT * FROM conversations WHERE id = ?')
    stmt.bind([id])
    if (!stmt.step()) { stmt.free(); throw new NotFoundException('Conversation not found') }
    const row = stmt.getAsObject() as unknown as Conversation
    stmt.free()
    return row
  }

  create(modelId: string): Conversation {
    const id = uuid()
    this.getDb().run('INSERT INTO conversations (id, model_id) VALUES (?, ?)', [id, modelId])
    this.dbService.save()
    return this.findOne(id)
  }

  delete(id: string): void {
    this.findOne(id)
    this.getDb().run('DELETE FROM conversations WHERE id = ?', [id])
    this.dbService.save()
  }

  updateTitle(id: string, title: string): Conversation {
    this.findOne(id)
    this.getDb().run("UPDATE conversations SET title = ?, updated_at = datetime('now') WHERE id = ?", [title, id])
    this.dbService.save()
    return this.findOne(id)
  }

  clearMessages(conversationId: string): void {
    this.findOne(conversationId)
    this.getDb().run('DELETE FROM messages WHERE conversation_id = ?', [conversationId])
    this.dbService.save()
  }

  getMessages(conversationId: string): Message[] {
    this.findOne(conversationId)
    const stmt = this.getDb().prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC')
    stmt.bind([conversationId])
    const rows: Message[] = []
    while (stmt.step()) rows.push(stmt.getAsObject() as unknown as Message)
    stmt.free()
    return rows
  }

  addMessage(msg: {
    conversation_id: string
    role: 'user' | 'assistant'
    content: string
    input_tokens?: number
    output_tokens?: number
    wait_time_ms?: number
    output_speed_tps?: number
  }): Message {
    const id = uuid()
    this.getDb().run(
      `INSERT INTO messages (id, conversation_id, role, content, input_tokens, output_tokens, wait_time_ms, output_speed_tps)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, msg.conversation_id, msg.role, msg.content, msg.input_tokens ?? 0, msg.output_tokens ?? 0, msg.wait_time_ms ?? 0, msg.output_speed_tps ?? 0]
    )
    this.getDb().run("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?", [msg.conversation_id])
    this.dbService.save()
    const stmt = this.getDb().prepare('SELECT * FROM messages WHERE id = ?')
    stmt.bind([id])
    stmt.step()
    const row = stmt.getAsObject() as unknown as Message
    stmt.free()
    return row
  }
}
