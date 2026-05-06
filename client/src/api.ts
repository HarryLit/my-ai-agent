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

export async function clearMessages(conversationId: string): Promise<void> {
  await fetch(`${BASE}/conversations/${conversationId}/messages`, { method: 'DELETE' })
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
          // Yield to let React render between tokens
          await new Promise(r => setTimeout(r, 0))
        } catch {}
      }
    }
  }).catch(err => {
    if (err.name !== 'AbortError') onError(err)
  })

  return controller
}
