import { Button } from 'antd'
import { ClearOutlined } from '@ant-design/icons'
import type { ModelConfig } from '../types'
import MessageList from './MessageList'
import InputArea from './InputArea'

interface ChatWindowProps {
  messages: any[]
  streamingContent: string
  streamStats: any
  isStreaming: boolean
  hasActiveConv: boolean
  hasActiveModel: boolean
  modelName: string
  models: ModelConfig[]
  activeModelId: string
  onSend: (content: string) => void
  onStop: () => void
  onClear: () => void
  onModelChange: (id: string) => void
  onOpenModelConfig: () => void
}

export default function ChatWindow({
  messages, streamingContent, streamStats, isStreaming,
  hasActiveConv, hasActiveModel, modelName, models, activeModelId,
  onSend, onStop, onClear, onModelChange, onOpenModelConfig
}: ChatWindowProps) {
  const showClear = hasActiveConv && messages.length > 0 && !isStreaming

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="chat-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px' }}>
        <span style={{ fontSize: 12, color: '#7a8fa8' }}>
          {modelName && <span style={{ fontWeight: 500, color: '#4a90d9' }}>{modelName}</span>}
          {modelName && messages.length > 0 && ' · '}
          共 {messages.length} 条消息
        </span>
        {showClear && (
          <Button
            type="text"
            size="small"
            icon={<ClearOutlined />}
            onClick={onClear}
            style={{ color: '#7a8fa8', fontSize: 12 }}
          >
            清空对话
          </Button>
        )}
      </div>
      <MessageList
        messages={messages}
        streamingContent={streamingContent}
        streamStats={streamStats}
        isStreaming={isStreaming}
        modelName={modelName}
      />
      <InputArea
        onSend={onSend}
        onStop={onStop}
        isStreaming={isStreaming}
        disabled={!hasActiveModel || !hasActiveConv}
        models={models}
        activeModelId={activeModelId}
        onModelChange={onModelChange}
        onOpenModelConfig={onOpenModelConfig}
      />
    </div>
  )
}
