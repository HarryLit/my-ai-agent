import { ArrowDownOutlined, ArrowUpOutlined, ClockCircleOutlined, ThunderboltOutlined, CodeOutlined, CopyOutlined, FileTextOutlined, DownOutlined, RightOutlined, BulbOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState, useCallback } from 'react'
import type { Message } from '../types'

interface MessageItemProps {
  message?: Message
  streamingContent?: string
  thinkingContent?: string
  thinkingTime?: number
  thinkingDone?: boolean
  streamStats?: { inputTokens: number; outputTokens: number; waitTimeMs: number; outputSpeedTps: number } | null
  isStreaming?: boolean
  modelName?: string
}

const markdownComponents: any = {
  code({ className, children, ...props }: any) {
    const isBlock = className?.startsWith('language-') || (props.inline === false)
    const isInline = props.inline === true || (!isBlock && className === undefined)

    // Inline code: `code`
    if (isInline) {
      return (
        <code style={{
          padding: '1px 5px', background: 'rgba(74,144,217,0.08)',
          borderRadius: 3,           fontSize: '0.85em',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          color: '#4a90d9'
        }}>
          {children}
        </code>
      )
    }

    // Block code: ```lang\ncode\n```
    const match = /language-(\w+)/.exec(className || '')
    const codeStr = String(children).replace(/\n+$/, '')
    const lang = match?.[1]

    return (
      <div style={{ margin: '8px 0', borderRadius: 6, overflow: 'hidden', border: '1px solid #cddae8' }}>
        {lang && (
          <div style={{ padding: '4px 12px', fontSize: 11, color: '#7a8fa8', background: '#eef3f8', borderBottom: '1px solid #cddae8', fontFamily: 'monospace' }}>
            {lang}
          </div>
        )}
        <SyntaxHighlighter
          style={oneLight}
          language={lang || 'text'}
          PreTag="div"
          customStyle={{ margin: 0, borderRadius: lang ? '0 0 6px 6px' : 6, fontSize: 13, padding: '12px 16px' }}
        >
          {codeStr}
        </SyntaxHighlighter>
      </div>
    )
  },
  a({ children, href }: any) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#4a90d9', textDecoration: 'underline' }}>
        {children}
      </a>
    )
  },
  table({ children }: any) {
    return (
      <div style={{ overflowX: 'auto', margin: '8px 0' }}>
        <table style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: 13,
          border: '1px solid #cddae8',
          borderRadius: 6,
          overflow: 'hidden'
        }}>
          {children}
        </table>
      </div>
    )
  },
  th({ children }: any) {
    return (
      <th style={{
        padding: '6px 12px',
        background: '#eef3f8',
        borderBottom: '2px solid #cddae8',
        textAlign: 'left',
        fontWeight: 600,
        fontSize: 12,
        color: '#2c3e4a'
      }}>
        {children}
      </th>
    )
  },
  td({ children }: any) {
    return (
      <td style={{
        padding: '6px 12px',
        borderBottom: '1px solid #e8eef5',
        fontSize: 13,
        color: '#2c3e4a'
      }}>
        {children}
      </td>
    )
  },
  blockquote({ children }: any) {
    return (
      <blockquote style={{
        margin: '8px 0',
        paddingLeft: 12,
        borderLeft: '3px solid #4a90d9',
        color: '#5a7a9a',
        fontStyle: 'italic'
      }}>
        {children}
      </blockquote>
    )
  },
  ul({ children }: any) {
    return <ul style={{ paddingLeft: 20, margin: '4px 0' }}>{children}</ul>
  },
  ol({ children }: any) {
    return <ol style={{ paddingLeft: 20, margin: '4px 0' }}>{children}</ol>
  },
  li({ children }: any) {
    return <li style={{ marginBottom: 2 }}>{children}</li>
  },
  h1: ({ children }: any) => <h1 style={{ fontSize: 20, fontWeight: 700, margin: '12px 0 6px', color: '#2c3e4a' }}>{children}</h1>,
  h2: ({ children }: any) => <h2 style={{ fontSize: 18, fontWeight: 700, margin: '10px 0 5px', color: '#2c3e4a' }}>{children}</h2>,
  h3: ({ children }: any) => <h3 style={{ fontSize: 16, fontWeight: 600, margin: '8px 0 4px', color: '#2c3e4a' }}>{children}</h3>,
  p: ({ children }: any) => <p style={{ margin: '4px 0' }}>{children}</p>,
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid #cddae8', margin: '16px 0' }} />
}

export default function MessageItem({ message, streamingContent, thinkingContent, thinkingTime, thinkingDone, streamStats, isStreaming, modelName }: MessageItemProps) {
  const isUser = message?.role === 'user'
  const content = message?.content || streamingContent || ''
  const showStats = !isUser && !isStreaming && (message || streamStats)
  const [showRaw, setShowRaw] = useState(false)
  const [thinkingCollapsed, setThinkingCollapsed] = useState(false)

  const input = message ? message.input_tokens : streamStats?.inputTokens ?? 0
  const output = message ? message.output_tokens : streamStats?.outputTokens ?? 0
  const wait = message ? message.wait_time_ms : streamStats?.waitTimeMs ?? 0
  const speed = message ? message.output_speed_tps : streamStats?.outputSpeedTps ?? 0

  const roleLabel = isUser ? '你' : (message?.model_name || modelName || 'AI')

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).catch(() => {})
  }, [content])

  return (
    <div style={{ marginBottom: 16, width: '100%' }}>
      <div style={{
        fontSize: 11,
        color: '#7a8fa8',
        marginBottom: 4,
        paddingLeft: 4
      }}>
        {roleLabel}
      </div>

      <div className={isUser ? 'msg-user' : 'msg-ai'} style={{ width: '100%' }}>
        {/* Thinking / reasoning content */}
        {!isUser && (thinkingContent || message?.reasoning_content) && (
          <div style={{ marginBottom: (thinkingContent || message?.reasoning_content) ? 10 : 0 }}>
            <div
              onClick={() => setThinkingCollapsed(!thinkingCollapsed)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#7a8fa8', userSelect: 'none', paddingBottom: 4 }}
            >
              {thinkingCollapsed ? <RightOutlined /> : <DownOutlined />}
              <BulbOutlined style={{ color: '#d4a84b' }} />
              <span style={{ fontWeight: 600, color: '#b8860b' }}>思考</span>
              {(message?.thinking_time_ms || thinkingTime || 0) > 0 && (
                <span style={{ color: '#7a8fa8' }}>
                  {((message?.thinking_time_ms || thinkingTime || 0) / 1000).toFixed(1)}s
                </span>
              )}
              {(!!message?.reasoning_content || thinkingDone) && <span style={{ color: '#7a8fa8' }}>✓</span>}
            </div>
            {!thinkingCollapsed && (thinkingContent || message?.reasoning_content) && (
              <div style={{
                fontSize: 12, lineHeight: 1.6, color: '#7a8fa8', whiteSpace: 'pre-wrap',
                padding: '8px 10px', background: 'rgba(74,144,217,0.04)', borderRadius: 6,
                borderLeft: '2px solid #d4a84b', fontStyle: 'italic', marginTop: 4
              }}>
                {message?.reasoning_content || thinkingContent}
                {isStreaming && !thinkingDone && <span className="typing-cursor" />}
              </div>
            )}
          </div>
        )}

        {isStreaming && !content && !thinkingContent ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7a8fa8', fontSize: 13 }}>
            <span className="typing-cursor" />
            <span className="typing-cursor" style={{ animationDelay: '0.2s' }} />
            <span className="typing-cursor" style={{ animationDelay: '0.4s' }} />
          </div>
        ) : isUser ? (
          <div style={{ fontSize: 14, lineHeight: 1.7, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
            {content}
          </div>
        ) : (
          showRaw ? (
            <div>
              <pre style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, color: '#2c3e4a', fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' }}>
                {content}
              </pre>
              {isStreaming && <span className="typing-cursor" />}
            </div>
          ) : (
            <div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {content || ' '}
              </ReactMarkdown>
              {isStreaming && content && <span className="typing-cursor" />}
            </div>
          )
        )}
      </div>
      {!isUser && !isStreaming && content && (
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px 8px' }}>
          {showStats && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {input > 0 && (
                <span className="stat-tag"><ArrowUpOutlined /> 输入 {input}</span>
              )}
              {output > 0 && (
                <span className="stat-tag"><ArrowDownOutlined /> 输出 {output}</span>
              )}
              {wait > 0 && (
                <span className="stat-tag"><ClockCircleOutlined /> {wait}ms</span>
              )}
              {speed > 0 && (
                <span className="stat-tag"><ThunderboltOutlined /> {speed.toFixed(1)}t/s</span>
              )}
            </div>
          )}
          {showStats && <div />}
          <div style={{ display: 'flex', gap: 6 }}>
            <span
              onClick={() => setShowRaw(!showRaw)}
              className="action-btn"
              style={{ cursor: 'pointer', padding: '2px 6px', borderRadius: 4, fontSize: 12, color: '#7a8fa8', display: 'inline-flex', alignItems: 'center', gap: 3 }}
            >
              {showRaw ? <><FileTextOutlined /> 渲染</> : <><CodeOutlined /> 原文</>}
            </span>
            <span
              onClick={handleCopy}
              className="action-btn"
              style={{ cursor: 'pointer', padding: '2px 6px', borderRadius: 4, fontSize: 12, color: '#7a8fa8', display: 'inline-flex', alignItems: 'center', gap: 3 }}
            >
              <CopyOutlined /> 复制
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
