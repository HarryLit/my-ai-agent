import { useState, useRef, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
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
  const convIdRef = useRef('')
  const partialContentRef = useRef('')

  const loadMessages = useCallback(async (conversationId: string) => {
    const msgs = await api.fetchMessages(conversationId)
    setMessages(msgs)
    setStreamingContent('')
    setStreamStats(null)
  }, [])

  const send = useCallback((conversationId: string, content: string) => {
    // Immediately show user message
    const userMsg: Message = {
      id: uuid(),
      conversation_id: conversationId,
      role: 'user',
      content,
      input_tokens: 0,
      output_tokens: 0,
      wait_time_ms: 0,
      output_speed_tps: 0,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])

    setIsStreaming(true)
    setStreamingContent('')
    setStreamStats(null)
    partialContentRef.current = ''
    convIdRef.current = conversationId

    abortRef.current = api.sendChatMessage(conversationId, content,
      (event: StreamEvent) => {
        if (event.type === 'token') {
          partialContentRef.current += (event.content || '')
          setStreamingContent(partialContentRef.current)
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
          partialContentRef.current = ''
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
    // Save partial content as assistant message
    if (partialContentRef.current && convIdRef.current) {
      const assistantMsg: Message = {
        id: uuid(),
        conversation_id: convIdRef.current,
        role: 'assistant',
        content: partialContentRef.current,
        input_tokens: 0,
        output_tokens: Math.ceil(partialContentRef.current.length / 4),
        wait_time_ms: 0,
        output_speed_tps: 0,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMsg])
      partialContentRef.current = ''
    }
    setIsStreaming(false)
    setStreamingContent('')
    setStreamStats(null)
  }, [])

  return { messages, isStreaming, streamingContent, streamStats, loadMessages, send, stop, clear: useCallback(async (conversationId: string) => {
    abortRef.current?.abort()
    setIsStreaming(false)
    setStreamingContent('')
    setStreamStats(null)
    partialContentRef.current = ''
    await api.clearMessages(conversationId)
    setMessages([])
  }, []) }
}
