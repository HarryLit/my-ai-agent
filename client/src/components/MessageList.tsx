import { useRef, useEffect } from 'react'
import { Empty } from 'antd'
import { MessageOutlined } from '@ant-design/icons'
import type { Message } from '../types'
import MessageItem from './MessageItem'

interface MessageListProps {
  messages: Message[]
  streamingContent?: string
  streamStats?: { inputTokens: number; outputTokens: number; waitTimeMs: number; outputSpeedTps: number } | null
  isStreaming: boolean
  modelName: string
}

export default function MessageList({ messages, streamingContent, streamStats, isStreaming, modelName }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  return (
    <div className="paper-bg" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
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
              streamStats={streamStats}
              isStreaming
              modelName={modelName}
            />
          )}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
