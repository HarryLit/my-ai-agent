export interface ModelConfig {
  id: string
  name: string
  api_url: string
  api_key: string
  model_name: string
  headers: string
  temperature: number | null
  top_p: number | null
  max_tokens: number | null
  stop: string
  frequency_penalty: number | null
  presence_penalty: number | null
  request_template: string
  is_active: number
  created_at: string
}

export interface Conversation {
  id: string
  title: string
  model_id: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  input_tokens: number
  output_tokens: number
  wait_time_ms: number
  output_speed_tps: number
  created_at: string
}

export interface StreamEvent {
  type: 'token' | 'done' | 'error'
  content?: string
  tokens?: number
  inputTokens?: number
  outputTokens?: number
  waitTimeMs?: number
  outputSpeedTps?: number
  message?: string
}
