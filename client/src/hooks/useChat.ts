import { useState, useRef, useCallback, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import type { Message, StreamEvent } from '../types'
import * as api from '../api'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [thinkingContent, setThinkingContent] = useState('')
  const [thinkingTime, setThinkingTime] = useState(0)
  const [thinkingDone, setThinkingDone] = useState(false)
  const [streamStats, setStreamStats] = useState<{
    inputTokens: number; outputTokens: number; waitTimeMs: number; outputSpeedTps: number
  } | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const convIdRef = useRef('')
  const partialContentRef = useRef('')
  const thinkingStartRef = useRef(0)
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopThinkingTimer = () => {
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current)
      thinkingTimerRef.current = null
    }
  }

  const startThinkingTimer = () => {
    stopThinkingTimer()
    thinkingStartRef.current = Date.now()
    setThinkingTime(0)
    thinkingTimerRef.current = setInterval(() => {
      setThinkingTime(Date.now() - thinkingStartRef.current)
    }, 100)
  }

  const loadMessages = useCallback(async (conversationId: string) => {
    const msgs = await api.fetchMessages(conversationId)
    setMessages(msgs)
    setStreamingContent('')
    setThinkingContent('')
    setThinkingTime(0)
    setThinkingDone(false)
    setStreamStats(null)
  }, [])

  const send = useCallback((conversationId: string, content: string, modelId: string) => {
    const userMsg: Message = {
      id: uuid(),
      conversation_id: conversationId,
      role: 'user',
      content,
      reasoning_content: '',
      input_tokens: 0,
      output_tokens: 0,
      wait_time_ms: 0,
      output_speed_tps: 0,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])

    setIsStreaming(true)
    setStreamingContent('')
    setThinkingContent('')
    setThinkingTime(0)
    setThinkingDone(false)
    setStreamStats(null)
    partialContentRef.current = ''
    convIdRef.current = conversationId

    abortRef.current = api.sendChatMessage(conversationId, content, modelId,
      (event: StreamEvent) => {
        if (event.type === 'thinking') {
          if (!thinkingStartRef.current) startThinkingTimer()
          setThinkingContent(prev => prev + (event.content || ''))
        } else if (event.type === 'token') {
          if (thinkingStartRef.current) {
            stopThinkingTimer()
            setThinkingDone(true)
          }
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
          stopThinkingTimer()
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
    stopThinkingTimer()
    if (partialContentRef.current && convIdRef.current) {
      const assistantMsg: Message = {
        id: uuid(),
        conversation_id: convIdRef.current,
        role: 'assistant',
        content: partialContentRef.current,
        reasoning_content: '',
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

  const clear = useCallback(async (conversationId: string) => {
    abortRef.current?.abort()
    stopThinkingTimer()
    setIsStreaming(false)
    setStreamingContent('')
    setThinkingContent('')
    setThinkingTime(0)
    setThinkingDone(false)
    setStreamStats(null)
    partialContentRef.current = ''
    await api.clearMessages(conversationId)
    setMessages([])
  }, [])

  return { messages, isStreaming, streamingContent, thinkingContent, thinkingTime, thinkingDone, streamStats, loadMessages, send, stop, clear }
}
