import type { ChatMode } from '@/domain/chat/chat.types'

export type MessageProgressEvent = {
  messageId: string
  stage: string
  details: {
    stage: string
    substage: string
    title: string
    message: string
    icon: string
    timestamp: string
    [key: string]: unknown
  }
}

export type MessageStatus = 'received' | 'processing' | 'completed' | 'error'

export type MessageEvent = {
  messageId: string
  status: MessageStatus
  data?: Record<string, unknown>
  error?: {
    message: string
    code: number
  }
}

export type SendMessageRequest = {
  chatId: string | null
  content: string
  mode?: ChatMode
  streaming?: boolean
}

export type MessageChunkEvent = {
  messageId: string
  type: 'chunk'
  content: string
  fullContent: string
  chunkIndex: number
  timestamp: string
}

export type ChainOfThoughtsEvent = {
  messageId: string
  phase: string
  status: string
  analysis?: string
  strategy?: string
  evaluation?: string
  sourceCount?: number
  reasoning?: string
  phases?: number
  timestamp: string
}
