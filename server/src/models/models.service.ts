import { Injectable, NotFoundException } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { DatabaseService } from '../database/database.service'

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
  thinking_enabled: number
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
  thinking_enabled?: number
}

type SqlRow = Record<string, any>

@Injectable()
export class ModelsService {
  constructor(private db: DatabaseService) {}

  private rowToModel(r: SqlRow): ModelConfig {
    return { ...r } as ModelConfig
  }

  findAll(): ModelConfig[] {
    const stmt = this.db.getDb().prepare('SELECT * FROM models ORDER BY created_at DESC')
    const rows: ModelConfig[] = []
    while (stmt.step()) rows.push(this.rowToModel(stmt.getAsObject()))
    stmt.free()
    return rows
  }

  findOne(id: string): ModelConfig {
    const stmt = this.db.getDb().prepare('SELECT * FROM models WHERE id = ?')
    stmt.bind([id])
    if (!stmt.step()) {
      stmt.free()
      throw new NotFoundException('Model not found')
    }
    const row = this.rowToModel(stmt.getAsObject())
    stmt.free()
    return row
  }

  create(dto: CreateModelDto): ModelConfig {
    const id = uuid()
    const headers = dto.headers ? JSON.stringify(dto.headers) : '{}'
    const stop = dto.stop ? JSON.stringify(dto.stop) : '[]'
    this.db.getDb().run(
      `INSERT INTO models (id, name, api_url, api_key, model_name, headers, temperature, top_p, max_tokens, stop, frequency_penalty, presence_penalty, request_template, thinking_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, dto.name, dto.api_url, dto.api_key || '', dto.model_name || '', headers, dto.temperature ?? null, dto.top_p ?? null, dto.max_tokens ?? null, stop, dto.frequency_penalty ?? null, dto.presence_penalty ?? null, dto.request_template || '', dto.thinking_enabled ?? 0]
    )
    this.db.save()
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
      this.db.getDb().run(`UPDATE models SET ${fields.join(', ')} WHERE id = ?`, values)
      this.db.save()
    }
    return this.findOne(id)
  }

  delete(id: string): void {
    this.findOne(id)
    this.db.getDb().run('DELETE FROM models WHERE id = ?', [id])
    this.db.save()
  }
}
