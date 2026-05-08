import { useState, useEffect, useCallback } from 'react'
import type { Conversation } from '../types'
import * as api from '../api'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string>('')

  const load = useCallback(async () => {
    const list = await api.fetchConversations()
    setConversations(list)
    if (list.length > 0 && !list.find(c => c.id === activeConvId)) {
      setActiveConvId(list[0].id)
    }
    return list
  }, [activeConvId])

  useEffect(() => { load() }, [])

  const create = async (modelId: string) => {
    const conv = await api.createConversation(modelId)
    await load()
    setActiveConvId(conv.id)
    return conv
  }

  const remove = async (id: string) => {
    await api.deleteConversation(id)
    if (activeConvId === id) setActiveConvId('')
    await load()
  }

  return { conversations, activeConvId, setActiveConvId, create, remove, load }
}
