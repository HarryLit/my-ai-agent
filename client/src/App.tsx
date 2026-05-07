import { useEffect, useState, useMemo } from 'react'
import { ConfigProvider } from 'antd'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import ModelDialog from './components/ModelDialog'
import { useModels } from './hooks/useModels'
import { useConversations } from './hooks/useConversations'
import { useChat } from './hooks/useChat'

export default function App() {
  const models = useModels()
  const conversations = useConversations()
  const chat = useChat()
  const [modelDialogOpen, setModelDialogOpen] = useState(false)

  const activeModelName = useMemo(() => {
    if (!conversations.activeConvId) return ''
    const conv = conversations.conversations.find(c => c.id === conversations.activeConvId)
    if (!conv) return ''
    const model = models.models.find(m => m.id === conv.model_id)
    return model?.name || model?.model_name || model?.id || ''
  }, [conversations.activeConvId, conversations.conversations, models.models])

  useEffect(() => {
    if (conversations.activeConvId) {
      chat.loadMessages(conversations.activeConvId)
    }
  }, [conversations.activeConvId])

  const handleSend = (content: string) => {
    if (!conversations.activeConvId || !models.activeModelId) return
    chat.send(conversations.activeConvId, content, models.activeModelId)
  }

  const handleNewConv = () => {
    if (!models.activeModelId) return
    conversations.create(models.activeModelId)
  }

  const handleSelectConv = (id: string) => {
    if (chat.isStreaming) chat.stop()
    conversations.setActiveConvId(id)
  }

  const handleDeleteConv = async (id: string) => {
    if (chat.isStreaming) chat.stop()
    await conversations.remove(id)
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4a90d9',
          colorBgContainer: '#f5f8fc',
          colorBgLayout: '#f0f4f8',
          colorText: '#2c3e4a',
          colorTextSecondary: '#7a8fa8',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          borderRadius: 8,
          colorBorder: '#cddae8',
        }
      }}
    >
      <div style={{ height: '100vh', display: 'flex' }}>
        <Sidebar
          conversations={conversations.conversations}
          activeConvId={conversations.activeConvId}
          models={models.models}
          activeModelId={models.activeModelId}
          onSelectConv={handleSelectConv}
          onNewConv={handleNewConv}
          onDeleteConv={handleDeleteConv}
          onModelChange={models.setActiveModelId}
          onOpenModelConfig={() => setModelDialogOpen(true)}
        />
        <ChatWindow
          messages={chat.messages}
          streamingContent={chat.streamingContent}
          thinkingContent={chat.thinkingContent}
          thinkingTime={chat.thinkingTime}
          thinkingDone={chat.thinkingDone}
          streamStats={chat.streamStats}
          isStreaming={chat.isStreaming}
          hasActiveConv={!!conversations.activeConvId}
          hasActiveModel={!!models.activeModelId}
          modelName={activeModelName}
          models={models.models}
          activeModelId={models.activeModelId}
          onSend={handleSend}
          onStop={chat.stop}
          onClear={() => conversations.activeConvId && chat.clear(conversations.activeConvId)}
          onModelChange={models.setActiveModelId}
          onOpenModelConfig={() => setModelDialogOpen(true)}
        />
        <ModelDialog
          open={modelDialogOpen}
          models={models.models}
          onClose={() => setModelDialogOpen(false)}
          onCreate={models.create}
          onUpdate={models.update}
          onDelete={models.remove}
        />
      </div>
    </ConfigProvider>
  )
}
