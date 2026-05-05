import { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, List, Popconfirm, Space, Divider, InputNumber } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, MinusCircleOutlined } from '@ant-design/icons'
import type { ModelConfig } from '../types'

interface ModelDialogProps {
  open: boolean
  models: ModelConfig[]
  onClose: () => void
  onCreate: (data: Partial<ModelConfig>) => Promise<ModelConfig>
  onUpdate: (id: string, data: Partial<ModelConfig>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function ModelDialog({ open, models, onClose, onCreate, onUpdate, onDelete }: ModelDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [headerKeys, setHeaderKeys] = useState<string[]>([''])
  const [headerValues, setHeaderValues] = useState<string[]>([''])
  const [form] = Form.useForm()

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setEditingId(null)
      setHeaderKeys([''])
      setHeaderValues([''])
    }
  }, [open])

  const editingModel = editingId ? models.find(m => m.id === editingId) : undefined

  // Populate form when editing an existing model
  useEffect(() => {
    if (editingModel) {
      let headers: Record<string, string> = {}
      try { headers = JSON.parse(editingModel.headers) } catch {}
      const keys = Object.keys(headers)
      let stop: string[] = []
      try { stop = JSON.parse(editingModel.stop) } catch {}

      if (keys.length > 0) {
        setHeaderKeys(keys)
        setHeaderValues(keys.map(k => headers[k]))
      } else {
        setHeaderKeys([''])
        setHeaderValues([''])
      }

      form.setFieldsValue({
        name: editingModel.name,
        api_url: editingModel.api_url,
        api_key: editingModel.api_key,
        model_name: editingModel.model_name,
        temperature: editingModel.temperature,
        top_p: editingModel.top_p,
        max_tokens: editingModel.max_tokens,
        stop: stop.join(', '),
        frequency_penalty: editingModel.frequency_penalty,
        presence_penalty: editingModel.presence_penalty,
        request_template: editingModel.request_template || ''
      })
    } else if (editingId === '') {
      // New model - reset everything
      form.resetFields()
      setHeaderKeys([''])
      setHeaderValues([''])
    }
  }, [editingModel, editingId])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()

      const headerObj: Record<string, string> = {}
      headerKeys.forEach((k, i) => {
        if (k.trim()) {
          headerObj[k.trim()] = headerValues[i] || ''
        }
      })

      const stopText: string = values.stop || ''
      const stopArr = stopText ? stopText.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined

      const data: any = {
        name: values.name,
        api_url: values.api_url,
        api_key: values.api_key || '',
        model_name: values.model_name || '',
        headers: headerObj,
        temperature: values.temperature ?? null,
        top_p: values.top_p ?? null,
        max_tokens: values.max_tokens ?? null,
        stop: stopArr,
        frequency_penalty: values.frequency_penalty ?? null,
        presence_penalty: values.presence_penalty ?? null,
        request_template: values.request_template || ''
      }

      if (editingId && editingId !== '') {
        await onUpdate(editingId, data)
      } else {
        await onCreate(data)
      }
      setEditingId(null)
      setHeaderKeys([''])
      setHeaderValues([''])
      form.resetFields()
    } catch {}
  }

  const addHeader = () => {
    setHeaderKeys([...headerKeys, ''])
    setHeaderValues([...headerValues, ''])
  }

  const removeHeader = (i: number) => {
    setHeaderKeys(headerKeys.filter((_, idx) => idx !== i))
    setHeaderValues(headerValues.filter((_, idx) => idx !== i))
  }

  const updateHeaderKey = (i: number, val: string) => {
    const h = [...headerKeys]
    h[i] = val
    setHeaderKeys(h)
  }

  const updateHeaderValue = (i: number, val: string) => {
    const h = [...headerValues]
    h[i] = val
    setHeaderValues(h)
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      title={
        <span style={{ fontSize: 16, fontWeight: 600, color: '#3d3226' }}>
          {editingModel ? '编辑模型' : editingId === '' ? '添加模型' : '模型管理'}
        </span>
      }
      styles={{
        body: { background: '#f5f8fc', borderRadius: 12 },
        header: { background: '#f5f8fc', borderBottom: '1px solid #cddae8', borderRadius: '12px 12px 0 0' }
      }}
    >
      {/* Model list */}
      {!editingId && editingId !== '' && (
        <div style={{ marginBottom: 16 }}>
          {models.length > 0 && (
            <List
              dataSource={models}
              renderItem={m => (
                <List.Item
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                  }}
                  actions={[
                    <Button key="edit" type="text" size="small" icon={<EditOutlined />} onClick={() => setEditingId(m.id)} />,
                    <Popconfirm
                      key="del"
                      title="确定删除此模型？"
                      onConfirm={() => onDelete(m.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    title={<span style={{ color: '#3d3226', fontWeight: 500 }}>{m.name}</span>}
                    description={
                      <span style={{ color: '#a09080', fontSize: 12 }}>
                        {m.model_name || m.api_url}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          )}

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => setEditingId('')}
            block
            style={{ marginTop: 8, borderColor: '#cddae8', color: '#7a8fa8' }}
          >
            添加模型
          </Button>
        </div>
      )}

      {/* Edit/Create form */}
      {editingId !== null && (
        <>
          <Button
            type="link"
            onClick={() => { setEditingId(null); setHeaderKeys(['']); setHeaderValues(['']); form.resetFields() }}
            style={{ padding: 0, marginBottom: 12, color: '#7a8fa8' }}
          >
            ← 返回列表
          </Button>
          <Form form={form} layout="vertical" size="middle">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Form.Item
                label="名称"
                name="name"
                rules={[{ required: true, message: '请输入名称' }]}
              >
                <Input placeholder="My Model" />
              </Form.Item>
              <Form.Item label="模型标识" name="model_name">
                <Input placeholder="gpt-4o" />
              </Form.Item>
            </div>

            <Form.Item
              label="API URL"
              name="api_url"
              rules={[{ required: true, message: '请输入 API URL' }]}
            >
              <Input placeholder="https://api.openai.com/v1" />
            </Form.Item>

            <Form.Item label="API Key" name="api_key">
              <Input.Password placeholder="sk-..." />
            </Form.Item>

            {/* Custom Headers - key-value pairs */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 14, color: '#3d3226' }}>
                自定义请求头
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {headerKeys.map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Input
                      placeholder="Header 名称"
                      value={headerKeys[i]}
                      onChange={e => updateHeaderKey(i, e.target.value)}
                      style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}
                      size="small"
                    />
                    <Input
                      placeholder="Header 值"
                      value={headerValues[i]}
                      onChange={e => updateHeaderValue(i, e.target.value)}
                      style={{ flex: 2, fontFamily: 'monospace', fontSize: 12 }}
                      size="small"
                    />
                    {headerKeys.length > 1 && (
                      <Button
                        type="text"
                        size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={() => removeHeader(i)}
                        style={{ color: '#c44' }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={addHeader}
                style={{ marginTop: 6, borderColor: '#cddae8', color: '#7a8fa8' }}
              >
                添加请求头
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 12px' }}>
              <Form.Item label="Temperature" name="temperature">
                <InputNumber min={0} max={2} step={0.1} placeholder="0.7" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Top P" name="top_p">
                <InputNumber min={0} max={1} step={0.1} placeholder="1" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Max Tokens" name="max_tokens">
                <InputNumber min={1} placeholder="2048" style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 12px' }}>
              <Form.Item label="Freq Penalty" name="frequency_penalty">
                <InputNumber min={-2} max={2} step={0.1} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Presence Penalty" name="presence_penalty">
                <InputNumber min={-2} max={2} step={0.1} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Stop (逗号分隔)" name="stop">
                <Input placeholder="stop1, stop2" />
              </Form.Item>
            </div>

            <Form.Item label="自定义 Body 模板 (JSON，覆盖默认字段)" name="request_template">
              <Input.TextArea rows={3} placeholder='{"max_tokens": 4096}' style={{ fontFamily: 'monospace', fontSize: 12 }} />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => { setEditingId(null); form.resetFields() }}>
                取消
              </Button>
              <Button type="primary" onClick={handleSave} className="btn-skeuo">
                {editingModel ? '保存' : '创建'}
              </Button>
            </div>
          </Form>
        </>
      )}
    </Modal>
  )
}
