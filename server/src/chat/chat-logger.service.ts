import * as fs from 'fs'
import * as path from 'path'
import { randomBytes } from 'crypto'

export interface RequestInfo {
  url: string
  headers: Record<string, string>
  body: string
}

export interface ResponseInfo {
  content: string
  rawResponse: string
  inputTokens: number
  outputTokens: number
  waitTimeMs: number
  outputSpeedTps: number
}

export class ChatLogger {
  private logDir: string
  private files = new Map<string, string>()

  constructor() {
    this.logDir = path.resolve(process.cwd(), 'data', 'logs')
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  private getFile(conversationId: string): string {
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

  logRound(conversationId: string, req: RequestInfo, res: ResponseInfo) {
    const filepath = this.getFile(conversationId)
    const ts = new Date().toISOString()
    const sep = '='.repeat(72)
    const sections: string[] = [
      sep,
      `[${ts}] REQUEST`,
      sep,
      `URL: ${req.url}`,
      '',
      'HEADERS:',
      ...Object.entries(req.headers).map(([k, v]) => {
        if (k.toLowerCase() === 'authorization') v = v.slice(0, 8) + '...' // mask api key
        return `  ${k}: ${v}`
      }),
      '',
      'BODY:',
      this.prettyPrint(req.body),
      '',
      sep,
      `[${ts}] RESPONSE`,
      sep,
      'CONTENT:',
      res.content,
      '',
      'RAW RESPONSE:',
      this.prettyPrint(res.rawResponse),
      '',
      `INPUT_TOKENS: ${res.inputTokens}`,
      `OUTPUT_TOKENS: ${res.outputTokens}`,
      `WAIT_TIME_MS: ${res.waitTimeMs}`,
      `OUTPUT_SPEED_TPS: ${res.outputSpeedTps}`,
      '',
      '',
    ]
    fs.appendFileSync(filepath, sections.join('\n'), 'utf-8')
  }

  private prettyPrint(str: string): string {
    try {
      const parsed = JSON.parse(str)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return str
    }
  }
}
