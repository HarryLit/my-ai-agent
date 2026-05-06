import { ArrowDownOutlined, ArrowUpOutlined, ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Message } from '../types'

interface MessageItemProps {
  message?: Message
  streamingContent?: string
  streamStats?: { inputTokens: number; outputTokens: number; waitTimeMs: number; outputSpeedTps: number } | null
  isStreaming?: boolean
  modelName?: string
}

const markdownComponents: any = {
  code({ className, children, ...props }: any) {
    // Inline code: `code`
    if (props.inline) {
      return (
        <code style={{
          padding: '1px 5px',
          background: 'rgba(74,144,217,0.08)',
          borderRadius: 3,
          fontSize: '0.9em',
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
          <div style={{
            padding: '4px 12px',
            fontSize: 11,
            color: '#7a8fa8',
            background: '#eef3f8',
            borderBottom: '1px solid #cddae8',
            fontFamily: 'monospace'
          }}>
            {lang}
          </div>
        )}
        <SyntaxHighlighter
          style={oneLight}
          language={lang || 'text'}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: lang ? '0 0 6px 6px' : 6,
            fontSize: 13,
            background: lang ? undefined : '#eef3f8'
          }}
        >
          {codeStr}
        </SyntaxHighlighter>
      </div>
    )
  },
  pre({ children }: any) {
    return <>{children}</>
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
        {isStreaming && !content ? (
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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {content || ' '}
          </ReactMarkdown>
        )}
        {isStreaming && content && (
          <span className="typing-cursor" />
        )}
      </div>

      {showStats && (
        <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {input > 0 && (
              <span className="stat-tag"><ArrowDownOutlined /> 输入 {input}</span>
            )}
            {output > 0 && (
              <span className="stat-tag"><ArrowUpOutlined /> 输出 {output}</span>
            )}
          {wait > 0 && (
            <span className="stat-tag"><ClockCircleOutlined /> {wait}ms</span>
          )}
          {speed > 0 && (
            <span className="stat-tag"><ThunderboltOutlined /> {speed.toFixed(1)}t/s</span>
          )}
        </div>
      )}
    </div>
  )
}
