import { Button, Select, ConfigProvider } from 'antd'
import { PlusOutlined, SettingOutlined, DeleteOutlined, RobotOutlined } from '@ant-design/icons'
import type { Conversation, ModelConfig } from '../types'

interface SidebarProps {
  conversations: Conversation[]
  activeConvId: string
  models: ModelConfig[]
  activeModelId: string
  onSelectConv: (id: string) => void
  onNewConv: () => void
  onDeleteConv: (id: string) => void
  onModelChange: (id: string) => void
  onOpenModelConfig: () => void
}

export default function Sidebar({
  conversations, activeConvId, models, activeModelId,
  onSelectConv, onNewConv, onDeleteConv, onModelChange, onOpenModelConfig
}: SidebarProps) {
  return (
    <div className="sidebar-skeuo" style={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onNewConv}
          block
          style={{
            background: 'linear-gradient(180deg, #d4a84b 0%, #b8860b 100%)',
            border: '1px solid #8b6508',
            boxShadow: '0 2px 0 #8b6508',
            fontWeight: 600,
            height: 40,
            borderRadius: 10
          }}
        >
          新对话
        </Button>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <Select
          value={activeModelId || undefined}
          onChange={onModelChange}
          style={{ flex: 1 }}
          placeholder="选择模型"
          options={models.map(m => ({ value: m.id, label: m.name }))}
          className="model-select-dark"
          popupMatchSelectWidth={false}
        />
        <Button
          icon={<SettingOutlined />}
          onClick={onOpenModelConfig}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#c8bda0',
          }}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelectConv(conv.id)}
            className={`conv-item${conv.id === activeConvId ? ' active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px 10px 12px',
              fontSize: 13
            }}
          >
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
              <RobotOutlined style={{ fontSize: 14, opacity: 0.5 }} />
              {conv.title}
            </span>
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={e => { e.stopPropagation(); onDeleteConv(conv.id) }}
              style={{ color: 'rgba(255,255,255,0.25)', opacity: 0, transition: 'opacity 0.2s' }}
              className="conv-delete-btn"
            />
          </div>
        ))}
      </div>

      <style>{`
        .conv-item .conv-delete-btn { opacity: 0; }
        .conv-item:hover .conv-delete-btn { opacity: 0.7; }
        .conv-item .conv-delete-btn:hover { opacity: 1 !important; color: #ff6b6b !important; }
        .model-select-dark .ant-select-selector {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.12) !important;
          color: #e0d8c8 !important;
          height: 36px !important;
          border-radius: 8px !important;
        }
        .model-select-dark .ant-select-selection-item { color: #e0d8c8 !important; line-height: 34px !important; }
        .model-select-dark .ant-select-arrow { color: rgba(255,255,255,0.3) !important; }
      `}</style>
    </div>
  )
}
