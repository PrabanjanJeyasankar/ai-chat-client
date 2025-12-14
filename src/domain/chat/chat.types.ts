export type ChatMode = 'default' | 'news'

export type MessageRole = 'user' | 'assistant'

export type MessageVersion = {
  content: string
  model: string | null
  createdAt: string
  isError?: boolean
}

export type Source = {
  title: string
  url: string
  source: string
  lines: string
  publishedAt: string
  similarity: number
  finalScore: number
}

export type Message = {
  _id: string
  chatId: string
  userId: string | null
  role: MessageRole
  mode: ChatMode
  versions: MessageVersion[]
  currentVersionIndex: number
  createdAt: string
  updatedAt: string
  sources?: Source[]
}

export type Chat = {
  chatId: string
  title?: string
  messages: Message[]
  isTemporary?: boolean
  mode?: ChatMode
}

export type ChatListItem = {
  _id: string
  title: string
  lastMessage?: string
  lastMessageAt?: string
  createdAt?: string
  updatedAt?: string
  mode?: ChatMode
}

export type MessageProgress = {
  messageId: string
  stage?: string
  substage?: unknown
  message?: string
  title?: string
  timestamp?: string
  [key: string]: unknown
}
