import { useState, useEffect, useCallback } from 'react'
import type { ModelConfig } from '../types'
import * as api from '../api'

export function useModels() {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [activeModelId, setActiveModelId] = useState<string>('')
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    const list = await api.fetchModels()
    setModels(list)
    if (list.length > 0 && !list.find(m => m.id === activeModelId)) {
      setActiveModelId(list[0].id)
    }
    setLoaded(true)
  }, [activeModelId])

  useEffect(() => { load() }, [])

  const create = async (data: Partial<ModelConfig>) => {
    const m = await api.createModel(data)
    await load()
    setActiveModelId(m.id)
    return m
  }

  const update = async (id: string, data: Partial<ModelConfig>) => {
    await api.updateModel(id, data)
    await load()
  }

  const remove = async (id: string) => {
    await api.deleteModel(id)
    if (activeModelId === id) setActiveModelId('')
    await load()
  }

  return { models, activeModelId, setActiveModelId, create, update, remove, load }
}
