import { Injectable } from '@nestjs/common'
import { Observable, Observer } from 'rxjs'
import { ConversationsService } from '../conversations/conversations.service'
import { ModelsService, ModelConfig } from '../models/models.service'
import { ChatLogger } from './chat-logger.service'

export interface StreamEvent {
  type: 'token' | 'thinking' | 'done' | 'error'
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
    private convService: ConversationsService,
    private modelsService: ModelsService,
    private logger: ChatLogger
  ) {}

  sendMessage(conversationId: string, content: string): Observable<StreamEvent> {
    return new Observable((observer: Observer<StreamEvent>) => {
      let conv: any
      try { conv = this.convService.findOne(conversationId) } catch {
        observer.next({ type: 'error', message: 'Conversation not found' })
        observer.complete()
        return
      }

      let model: ModelConfig
      try { model = this.modelsService.findOne(conv.model_id) } catch {
        observer.next({ type: 'error', message: 'Model not found' })
        observer.complete()
        return
      }

      const startTime = Date.now()
      let firstTokenTime: number | null = null
      let accumulatedContent = ''
      let outputTokens = 0
      let inputTokens = 0

      this.convService.addMessage({ conversation_id: conversationId, role: 'user', content })

      const history = this.convService.getMessages(conversationId)
      const messages = history.map(m => ({ role: m.role, content: m.content }))

      const body: Record<string, any> = {
        model: model.model_name || model.name,
        messages,
        stream: true
      }
      if (model.thinking_enabled as any === 1 || (model.thinking_enabled as any) === '1') {
        body.reasoning_effort = 'medium'
      }
      if (model.temperature !== null && model.temperature !== undefined) body.temperature = Number(model.temperature)
      if (model.top_p !== null && model.top_p !== undefined) body.top_p = Number(model.top_p)
      if (model.max_tokens !== null && model.max_tokens !== undefined) body.max_tokens = Number(model.max_tokens)
      if (model.stop && model.stop !== '[]') { try { body.stop = JSON.parse(model.stop) } catch {} }
      if (model.frequency_penalty !== null && model.frequency_penalty !== undefined) body.frequency_penalty = Number(model.frequency_penalty)
      if (model.presence_penalty !== null && model.presence_penalty !== undefined) body.presence_penalty = Number(model.presence_penalty)
      if (model.request_template) {
        try { Object.assign(body, JSON.parse(model.request_template)) } catch {}
      }

      let customHeaders: Record<string, string> = {}
      try { customHeaders = JSON.parse(model.headers) } catch {}

      const inputText = messages.map(m => m.content).join(' ')
      inputTokens = Math.ceil(inputText.length / 4)

      const apiUrl = model.api_url.replace(/\/+$/, '')

      // Save request info for logging
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.api_key}`,
        ...customHeaders
      }
      const requestBody = JSON.stringify(body)
      const requestUrl = apiUrl + '/chat/completions'

      fetch(requestUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody
      }).then(async (res: Response) => {
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

        const finish = () => {
          const waitTime = firstTokenTime ? firstTokenTime - startTime : 0
          const elapsed = firstTokenTime ? (Date.now() - firstTokenTime) / 1000 : 1
          const speed = outputTokens / Math.max(elapsed, 0.01)

          this.logger.logRound(conversationId, {
            url: requestUrl,
            headers: requestHeaders,
            body: requestBody
          }, {
            content: accumulatedContent,
            inputTokens,
            outputTokens,
            waitTimeMs: waitTime,
            outputSpeedTps: parseFloat(speed.toFixed(2))
          })

          this.convService.addMessage({
            conversation_id: conversationId,
            role: 'assistant',
            content: accumulatedContent,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            wait_time_ms: waitTime,
            output_speed_tps: parseFloat(speed.toFixed(2))
          })

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
        }

        const processChunk = () => {
          while (buffer.includes('\n')) {
            const idx = buffer.indexOf('\n')
            const line = buffer.slice(0, idx).trim()
            buffer = buffer.slice(idx + 1)

            if (!line) continue
            if (line.startsWith(':')) continue
            if (!line.startsWith('data: ')) continue

            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              finish()
              return true // signal completion
            }

            try {
              const parsed = JSON.parse(data)
              const choice = parsed.choices?.[0]
              const delta = choice?.delta
              const finishReason = choice?.finish_reason

              if (delta?.content) {
                if (!firstTokenTime) firstTokenTime = Date.now()
                accumulatedContent += delta.content
                outputTokens = Math.ceil(accumulatedContent.length / 4)
                observer.next({ type: 'token', content: delta.content, tokens: outputTokens })
              }

              if (finishReason && finishReason !== 'null') {
                // Some providers send token usage in the final chunk
                if (parsed.usage) {
                  inputTokens = parsed.usage.prompt_tokens || inputTokens
                  outputTokens = parsed.usage.completion_tokens || outputTokens
                }
                finish()
                return true
              }
            } catch {}
          }
          return false
        }

        const pump = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              const completed = processChunk()
              if (!completed) finish()
              return
            }
            buffer += decoder.decode(value, { stream: true })
            const completed = processChunk()
            if (completed) return
            pump()
          }).catch((err: Error) => {
            observer.next({ type: 'error', message: err.message })
            observer.complete()
          })
        }
        pump()
      }).catch((err: Error) => {
        observer.next({ type: 'error', message: err.message })
        observer.complete()
      })
    })
  }
}
