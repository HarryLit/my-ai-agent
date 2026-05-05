import { useState, useRef, useCallback } from 'react'
import type { Message, StreamEvent } from '../types'
import * as api from '../api'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamStats, setStreamStats] = useState<{
    inputTokens: number; outputTokens: number; waitTimeMs: number; outputSpeedTps: number
  } | null>(null)
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

  const clear = useCallback(async (conversationId: string) => {
    abortRef.current?.abort()
    setIsStreaming(false)
    setStreamingContent('')
    setStreamStats(null)
    await api.clearMessages(conversationId)
    setMessages([])
  }, [])

  return { messages, isStreaming, streamingContent, streamStats, loadMessages, send, stop, clear }
}
