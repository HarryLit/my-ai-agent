import { useRef, useEffect, useLayoutEffect } from 'react'
import { Empty } from 'antd'
import { MessageOutlined } from '@ant-design/icons'
import type { Message } from '../types'
import MessageItem from './MessageItem'

interface MessageListProps {
  messages: Message[]
  streamingContent?: string
  thinkingContent?: string
  thinkingTime?: number
  thinkingDone?: boolean
  streamStats?: { inputTokens: number; outputTokens: number; waitTimeMs: number; outputSpeedTps: number } | null
  isStreaming: boolean
  modelName: string
}

export default function MessageList({ messages, streamingContent, thinkingContent, thinkingTime, thinkingDone, streamStats, isStreaming, modelName }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isNearBottomRef = useRef(true)
  const prevStreamingRef = useRef(false)

  const scrollToBottom = () => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
  }

  // Scroll to bottom on mount
  useEffect(() => {
    scrollToBottom()
  }, [])

  // Scroll on updates: capture position before data changes
  useLayoutEffect(() => {
    if (isStreaming && !prevStreamingRef.current) {
      isNearBottomRef.current = true
    }
    prevStreamingRef.current = isStreaming

    if (isNearBottomRef.current) {
      scrollToBottom()
    }
  }, [messages, streamingContent, isStreaming])

  return (
    <div
      ref={containerRef}
      className="paper-bg"
      onScroll={handleScroll}
      style={{ flex: 1, overflowY: 'auto', padding: '20px' }}
    >
      {messages.length === 0 && !isStreaming ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Empty
            image={<MessageOutlined style={{ fontSize: 48, color: '#b8cbe4' }} />}
            description={<span style={{ color: '#7a8fa8' }}>发送消息开始对话</span>}
          />
        </div>
      ) : (
        <div>
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} modelName={modelName} />
          ))}
          {isStreaming && (
            <MessageItem
              streamingContent={streamingContent}
              thinkingContent={thinkingContent}
              thinkingTime={thinkingTime}
              thinkingDone={thinkingDone}
              streamStats={streamStats}
              isStreaming
              modelName={modelName}
            />
          )}
        </div>
      )}
    </div>
  )
}
