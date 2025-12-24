export type ChatMode = 'default' | 'news' | 'law'

export type MessageRole = 'user' | 'assistant'

export type MessageVersion = {
  content: string
  model: string | null
  createdAt: string
  isError?: boolean
}

// News mode source
export type NewsSource = {
  title: string
  url: string
  source: string
  lines: string
  publishedAt: string
  similarity: number
  finalScore: number
}

// Law mode source
export type LawSource = {
  doc_id: string
  chunk_index: number
  text: string
  page_number: number
  pdf_url: string
  similarity: number
  finalScore: number
}

export type Source = NewsSource | LawSource

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
