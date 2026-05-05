import { useState, useRef, useEffect, useCallback } from 'react'
import { Button, Input } from 'antd'
import { SendOutlined, CloseOutlined } from '@ant-design/icons'

const { TextArea } = Input

interface InputAreaProps {
  onSend: (content: string) => void
  onStop: () => void
  isStreaming: boolean
  disabled: boolean
}

export default function InputArea({ onSend, onStop, isStreaming, disabled }: InputAreaProps) {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim() || isStreaming || disabled) return
    onSend(text.trim())
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if ((e.ctrlKey || e.shiftKey) && e.key === 'Enter') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const before = text.slice(0, start)
      const after = text.slice(end)
      const newValue = before + '\n' + after
      setText(newValue)
      // Restore cursor via native DOM after React commit
      setTimeout(() => {
        ta.selectionStart = start + 1
        ta.selectionEnd = start + 1
      }, 0)
    }
  }

  return (
    <div style={{
      padding: '16px',
      background: '#faf6ed',
      borderTop: '1px solid #d9d0c0'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="input-skeuo" style={{ flex: 1, padding: '2px' }}>
          <TextArea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? '请先选择模型' : '输入消息，Enter 发送，Ctrl/Shift+Enter 换行'}
            disabled={disabled || isStreaming}
              autoSize={{ minRows: 2, maxRows: 5 }}
            style={{
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              resize: 'none',
              fontSize: 14,
              color: '#3d3226'
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          {isStreaming ? (
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={onStop}
            style={{
              height: 38,
              borderRadius: 10,
              boxShadow: '0 2px 0 #a83232',
              fontWeight: 600,
              fontSize: 13,
              border: '1px solid #cc4444'
            }}
          >
            停止
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            className="btn-skeuo"
            style={{ height: 38, borderRadius: 10, fontSize: 13, border: '1px solid #4a90d9' }}
          >
            发送
          </Button>
        )}
        </div>
      </div>
    </div>
  )
}
