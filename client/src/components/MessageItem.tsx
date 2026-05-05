import { ArrowDownOutlined, ArrowUpOutlined, ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons'
import type { Message } from '../types'

interface MessageItemProps {
  message?: Message
  streamingContent?: string
  streamStats?: { inputTokens: number; outputTokens: number; waitTimeMs: number; outputSpeedTps: number } | null
  isStreaming?: boolean
  modelName?: string
}

export default function MessageItem({ message, streamingContent, streamStats, isStreaming, modelName }: MessageItemProps) {
  const isUser = message?.role === 'user'
  const content = message?.content || streamingContent || ''
  const showStats = !isUser && !isStreaming && (message || streamStats)

  const input = message ? message.input_tokens : streamStats?.inputTokens ?? 0
  const output = message ? message.output_tokens : streamStats?.outputTokens ?? 0
  const wait = message ? message.wait_time_ms : streamStats?.waitTimeMs ?? 0
  const speed = message ? message.output_speed_tps : streamStats?.outputSpeedTps ?? 0

  const roleLabel = isUser ? '你' : (modelName || 'AI')

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
      <div>
        {/* Role indicator */}
        <div style={{
          fontSize: 11,
          color: '#7a8fa8',
          marginBottom: 4,
          paddingLeft: isUser ? 0 : 4,
          paddingRight: isUser ? 4 : 0,
          textAlign: isUser ? 'right' : 'left'
        }}>
          {roleLabel}
        </div>

        <div className={isUser ? 'msg-user' : 'msg-ai'}>
          <div style={{
            fontSize: 14,
            lineHeight: 1.7,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            color: isUser ? '#2c3e4a' : '#2c3e4a'
          }}>
            {content}
            {isStreaming && content && (
              <span className="typing-cursor" />
            )}
          </div>
        </div>

        {showStats && (
          <div style={{
            marginTop: 6,
            display: 'flex',
            gap: 6,
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            flexWrap: 'wrap'
          }}>
            {input > 0 && (
              <span className="stat-tag">
                <ArrowDownOutlined /> {input}
              </span>
            )}
            {output > 0 && (
              <span className="stat-tag">
                <ArrowUpOutlined /> {output}
              </span>
            )}
            {wait > 0 && (
              <span className="stat-tag">
                <ClockCircleOutlined /> {wait}ms
              </span>
            )}
            {speed > 0 && (
              <span className="stat-tag">
                <ThunderboltOutlined /> {speed.toFixed(1)}t/s
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
