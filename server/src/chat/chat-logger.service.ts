import * as fs from 'fs'
import * as path from 'path'
import { randomBytes } from 'crypto'

export class ChatLogger {
  private logDir: string
  private files = new Map<string, string>()

  constructor() {
    this.logDir = path.resolve(process.cwd(), 'data', 'logs')
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  getOrCreateFile(conversationId: string): string {
    if (this.files.has(conversationId)) {
      return this.files.get(conversationId)!
    }
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const rand = randomBytes(2).toString('hex')
    const filename = `${ts}_${rand}.log`
    const filepath = path.join(this.logDir, filename)
    this.files.set(conversationId, filepath)
    return filepath
  }

  write(conversationId: string, role: 'user' | 'assistant' | 'system', content: string) {
    const filepath = this.getOrCreateFile(conversationId)
    const timestamp = new Date().toISOString()
    const line = `[${timestamp}] [${role}]\n${content}\n\n`
    fs.appendFileSync(filepath, line, 'utf-8')
  }
}
