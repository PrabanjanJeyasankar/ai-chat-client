import { chatClient } from '@/domain/chat/chat.client'
import type {
  Chat,
  ChatListItem,
  ChatMode,
  Message,
  MessageProgress,
} from '@/domain/chat/chat.types'
import { messageClient } from '@/domain/chat/message.client'
import { storage } from '@/infrastructure/storage/local-storage'
import { webSocketClient } from '@/infrastructure/websocket/websocket.client'
import { create } from 'zustand'

type ChainOfThoughtsPhase = {
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

type ChainOfThoughtsData = Record<string, ChainOfThoughtsPhase>

type ChatState = {
  chats: Record<string, Chat>
  currentChatId: string | null
  newsMode: boolean
  history: ChatListItem[]
  hasHydrated: boolean
  welcomeMessageTrigger: number
  isAssistantTyping: boolean
  assistantTypingMode: ChatMode | null
  isWebSocketConnected: boolean
  webSocketError: string | null
  messageProgress: Record<string, MessageProgress>
  streamingMessageId: string | null
  streamingContent: string
  chainOfThoughts: Record<string, ChainOfThoughtsData>
  error: string | null
  isChatLoading: boolean

  setNewsMode: (enabled: boolean) => void
  loadAllChats: () => Promise<void>
  refreshWelcomeMessage: () => void
  setAssistantTyping: (typing: boolean) => void
  setAssistantTypingMode: (mode: ChatMode | null) => void
  cancelInFlightMessage: () => void
  connectWebSocket: () => Promise<void>
  disconnectWebSocket: () => void
  clearMessageProgress: (messageId: string) => void
  clearAll: () => void
  setError: (msg: string | null) => void
  clearError: () => void
  setCurrentChat: (chatId: string | null) => void
  createTempChat: () => string
  upgradeTempChat: (tempId: string, realId: string, title: string) => void
  loadChatFromBackend: (chatId: string) => Promise<void>
  sendMessage: (chatId: string | null, content: string) => Promise<void>
  editMessage: (messageId: string, content: string) => Promise<void>
  renameChat: (chatId: string, title: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  handleWebSocketMessageCompleted: (data: {
    chatId: string
    userMessage: Message
    assistantMessage: Message
    isFirstMessage: boolean
    title?: string
  }) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: storage.get<Record<string, Chat>>('chats') || {},
  currentChatId: null,
  isChatLoading: false,
  newsMode: storage.get<boolean>('newsMode') ?? false,
  history: [],
  hasHydrated: false,
  assistantTypingMode: null,
  welcomeMessageTrigger: 0,
  isAssistantTyping: false,
  isWebSocketConnected: false,
  webSocketError: null,
  messageProgress: {},
  streamingMessageId: null,
  streamingContent: '',
  chainOfThoughts: {},
  error: null,

  setNewsMode(enabled) {
    storage.set('newsMode', enabled)
    set({ newsMode: enabled })
  },

  setAssistantTypingMode(mode) {
    set({ assistantTypingMode: mode })
  },

  cancelInFlightMessage() {
    set({
      isAssistantTyping: false,
      assistantTypingMode: null,
      messageProgress: {},
      streamingMessageId: null,
      streamingContent: '',
    })
  },

  async connectWebSocket() {
    try {
      set({ webSocketError: null })
      await webSocketClient.connect()
      set({ isWebSocketConnected: true })

      webSocketClient.onMessageProgress((progress) => {
        const current = get().messageProgress
        const details = progress?.details || {}
        const mergedDetails = {
          ...details,
          messageId: progress.messageId,
          stage:
            typeof details?.stage === 'string' ? details.stage : progress.stage,
          timestamp:
            typeof details?.timestamp === 'string'
              ? details.timestamp
              : undefined,
        }

        set({
          messageProgress: {
            ...current,
            [progress.messageId]: mergedDetails,
          },
        })
      })

      webSocketClient.onMessageChunk((chunk) => {
        const { messageId, fullContent } = chunk
        const currentChatId = get().currentChatId
        if (!currentChatId) return

        set({
          streamingMessageId: messageId,
          streamingContent: fullContent,
        })

        // Update the assistant message in real-time
        const chats = get().chats
        const chat = chats[currentChatId]
        if (!chat) return

        const updated = structuredClone(chats)
        const updatedChat = updated[currentChatId]

        // Find or create streaming assistant message
        let assistantMsg = updatedChat.messages.find(
          (m) => m.role === 'assistant' && m._id.startsWith('streaming-')
        )

        if (!assistantMsg) {
          assistantMsg = {
            _id: `streaming-${messageId}`,
            chatId: currentChatId,
            userId: null,
            role: 'assistant',
            mode: get().assistantTypingMode || 'default',
            versions: [
              {
                content: fullContent,
                model: null,
                createdAt: new Date().toISOString(),
              },
            ],
            currentVersionIndex: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          updatedChat.messages.push(assistantMsg)
        } else {
          assistantMsg.versions[0].content = fullContent
        }

        set({ chats: updated })
      })

      webSocketClient.onChainOfThoughts((data) => {
        const current = get().chainOfThoughts
        set({
          chainOfThoughts: {
            ...current,
            [data.messageId]: {
              ...current[data.messageId],
              [data.phase]: {
                phase: data.phase,
                status: data.status,
                analysis: data.analysis,
                strategy: data.strategy,
                evaluation: data.evaluation,
                sourceCount: data.sourceCount,
                reasoning: data.reasoning,
                phases: data.phases,
                timestamp: data.timestamp,
              },
            },
          },
        })
      })

      webSocketClient.onMessageCompleted((event) => {
        try {
          if (
            event.data &&
            typeof event.data === 'object' &&
            'chatId' in event.data &&
            'userMessage' in event.data &&
            'assistantMessage' in event.data &&
            'isFirstMessage' in event.data
          ) {
            get().handleWebSocketMessageCompleted(
              event.data as {
                chatId: string
                userMessage: Message
                assistantMessage: Message
                isFirstMessage: boolean
                title?: string
              }
            )
          } else {
            console.error(
              '[WebSocket] Invalid message completed data:',
              event.data
            )
          }
        } catch (error) {
          console.error('[WebSocket] Error handling message completed:', error)
        } finally {
          get().clearMessageProgress(event.messageId)
          set({ streamingMessageId: null, streamingContent: '' })
          get().setAssistantTyping(false)
          get().setAssistantTypingMode(null)
        }
      })

      webSocketClient.onMessageError((event) => {
        console.error('[WebSocket] Message error:', event)
        try {
          get().setError(event.error?.message || 'Message failed')
        } catch (error) {
          console.error('[WebSocket] Error handling message error:', error)
        } finally {
          get().clearMessageProgress(event.messageId)
          set({ streamingMessageId: null, streamingContent: '' })
          get().setAssistantTyping(false)
        }
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'WebSocket connection failed'
      set({
        webSocketError: errorMessage,
        isWebSocketConnected: false,
      })
      console.error('[WebSocket] Connection failed:', error)
    }
  },

  disconnectWebSocket() {
    webSocketClient.disconnect()
    set({
      isWebSocketConnected: false,
      webSocketError: null,
      messageProgress: {},
    })
  },

  clearMessageProgress(messageId: string) {
    const current = get().messageProgress
    const updated = { ...current }
    delete updated[messageId]
    set({ messageProgress: updated })
  },

  setError(msg) {
    set({ error: msg })
  },

  clearError() {
    set({ error: null })
  },

  clearAll() {
    set({
      chats: {},
      currentChatId: null,
      history: [],
      error: null,
      isChatLoading: false,
      isAssistantTyping: false,
      assistantTypingMode: null,
      messageProgress: {},
    })
  },

  async loadAllChats() {
    try {
      const response = await chatClient.getAll()
      set({ history: response.data, hasHydrated: true })
    } catch (error) {
      console.error('[chat.store] loadAllChats ERROR →', error)
    }
  },

  refreshWelcomeMessage() {
    set((state) => ({ welcomeMessageTrigger: state.welcomeMessageTrigger + 1 }))
  },

  setAssistantTyping(typing) {
    set({ isAssistantTyping: typing })
  },

  setCurrentChat(chatId) {
    set({ currentChatId: chatId })
  },

  createTempChat() {
    const tempId = `temp-${Date.now()}`
    const prev = get().chats
    const chats = structuredClone(prev)
    const mode = get().newsMode ? 'news' : 'default'

    chats[tempId] = {
      chatId: tempId,
      messages: [],
      isTemporary: true,
      mode,
    }

    set({ chats, currentChatId: tempId })
    return tempId
  },

  upgradeTempChat(tempId, realId, title) {
    const prev = get().chats
    const chats = structuredClone(prev)
    const temp = chats[tempId]
    if (!temp) return

    chats[realId] = {
      chatId: realId,
      title,
      messages: temp.messages,
      isTemporary: false,
      mode: temp.mode,
    }

    delete chats[tempId]

    storage.set('chats', chats)
    set({ chats, currentChatId: realId })

    setTimeout(() => {
      get().loadAllChats()
    }, 100)
  },

  async loadChatFromBackend(chatId) {
    const existing = get().chats[chatId]
    if (!existing || existing.messages.length === 0) {
      set({ isChatLoading: true })
    }

    try {
      const response = await messageClient.getMessages(chatId)
      const prev = get().chats
      const chats = structuredClone(prev)
      const existingChat = chats[chatId]

      chats[chatId] = {
        chatId,
        messages: response.data.messages,
        isTemporary: false,
        mode:
          existingChat?.mode ||
          response.data.messages[response.data.messages.length - 1]?.mode ||
          'default',
      }

      storage.set('chats', chats)
      set({ chats })
    } catch (error) {
      const err: unknown = error
      const backendError =
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.message ||
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.error ||
        (err as { message?: string })?.message ||
        'Unknown error occurred'

      get().setError(backendError)

      const latest = get().chats
      const updated = structuredClone(latest)
      const updatedChat =
        updated[chatId] ||
        (updated[chatId] = {
          chatId,
          messages: [],
          isTemporary: false,
        })

      updatedChat.messages.push({
        _id: `error-${Date.now()}`,
        chatId,
        userId: null,
        role: 'assistant',
        mode: updatedChat.mode || 'default',
        versions: [
          {
            content: `⚠️ ${backendError}`,
            model: null,
            createdAt: new Date().toISOString(),
            isError: true,
          },
        ],
        currentVersionIndex: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      storage.set('chats', updated)
      set({ chats: updated })
    } finally {
      set({ isChatLoading: false })
    }
  },

  async sendMessage(chatId, content) {
    let localId = chatId

    if (!localId) {
      localId = get().createTempChat()
    }

    const requestedMode = get().newsMode ? 'news' : 'default'

    if (!get().isWebSocketConnected) {
      try {
        await get().connectWebSocket()
      } catch {
        get().setError(
          'Failed to connect to real-time service. Please try again.'
        )
        return
      }
    }

    const prev = get().chats
    const chats = structuredClone(prev)
    const chat = chats[localId]

    chat.messages = chat.messages.filter((m) => {
      const version =
        m?.versions && typeof m.currentVersionIndex === 'number'
          ? m.versions[m.currentVersionIndex]
          : m?.versions?.[0]
      return !(m?.role === 'assistant' && version?.isError === true)
    })

    const tempMessageId = `temp-${Date.now()}`

    chat.messages.push({
      _id: tempMessageId,
      chatId: localId,
      userId: null,
      role: 'user',
      mode: requestedMode,
      versions: [
        {
          content,
          model: null,
          createdAt: new Date().toISOString(),
        },
      ],
      currentVersionIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    set({ chats, messageProgress: {} })
    get().setAssistantTyping(true)
    get().setAssistantTypingMode(requestedMode)

    try {
      const messageId = await webSocketClient.sendMessage({
        chatId: chat.isTemporary ? null : localId,
        content,
        mode: requestedMode,
        streaming: true,
      })

      console.log(`[WebSocket] Message sent successfully: ${messageId}`)
    } catch (error) {
      console.error('[WebSocket] Message sending failed:', error)

      const latest = get().chats
      const updated = structuredClone(latest)
      const updatedChat = updated[localId]

      updatedChat.messages = [
        ...updatedChat.messages.filter((m) => !m._id.startsWith('temp-')),
        {
          _id: `error-${Date.now()}`,
          chatId: localId,
          userId: null,
          role: 'assistant',
          mode: updatedChat.mode || requestedMode,
          versions: [
            {
              content: `Failed to send message: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`,
              model: null,
              createdAt: new Date().toISOString(),
              isError: true,
            },
          ],
          currentVersionIndex: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      storage.set('chats', updated)
      set({ chats: updated })

      get().setAssistantTyping(false)
      get().setAssistantTypingMode(null)
    }
  },

  handleWebSocketMessageCompleted(data: {
    chatId: string
    userMessage: Message
    assistantMessage: Message
    isFirstMessage: boolean
    title?: string
  }) {
    const { chatId, userMessage, assistantMessage, isFirstMessage, title } =
      data

    const latest = get().chats
    const updated = structuredClone(latest)

    let targetChatId = chatId
    let tempChatToUpgrade = null

    if (isFirstMessage && title) {
      const tempChat = Object.values(updated).find((chat) => chat.isTemporary)
      if (tempChat) {
        tempChatToUpgrade = tempChat
        targetChatId = chatId
      }
    }

    const updatedChat = tempChatToUpgrade || updated[targetChatId]
    if (!updatedChat) {
      console.error(`[WebSocket] Chat not found: ${targetChatId}`)
      return
    }

    updatedChat.messages = [
      ...updatedChat.messages.filter((m) => {
        const version =
          m?.versions && typeof m.currentVersionIndex === 'number'
            ? m.versions[m.currentVersionIndex]
            : m?.versions?.[0]
        const isEphemeralError =
          m?.role === 'assistant' && version?.isError === true
        const isStreamingMessage = m._id.startsWith('streaming-')
        return (
          !m._id.startsWith('temp-') && !isEphemeralError && !isStreamingMessage
        )
      }),
      userMessage,
      assistantMessage,
    ]

    updatedChat.mode = userMessage.mode || 'default'

    if (tempChatToUpgrade) {
      updated[chatId] = {
        chatId,
        title,
        messages: updatedChat.messages,
        isTemporary: false,
        mode: updatedChat.mode,
      }

      delete updated[tempChatToUpgrade.chatId]

      storage.set('chats', updated)
      set({ chats: updated, currentChatId: chatId })
    } else {
      storage.set('chats', updated)
      set({ chats: updated })
    }

    setTimeout(() => {
      try {
        get()
          .loadAllChats()
          .catch((err) => {
            console.error('[WebSocket] Error refreshing chat list:', err)
          })
      } catch (error) {
        console.error('[WebSocket] Error calling loadAllChats:', error)
      }
    }, 100)
  },

  async editMessage(messageId, content) {
    try {
      const { data } = await messageClient.editMessage(messageId, { content })
      const prev = get().chats
      const chats = structuredClone(prev)

      const chatEntry = Object.values(chats).find((c) =>
        c.messages.some((m) => m._id === messageId)
      )
      if (!chatEntry) return

      const editedUserMessage = {
        ...data.editedUserMessage,
        mode:
          data.editedUserMessage.mode ||
          chatEntry.mode ||
          (get().newsMode ? 'news' : 'default'),
      }

      const newAssistantMessage = {
        ...data.newAssistantMessage,
        mode:
          data.newAssistantMessage.mode ||
          chatEntry.mode ||
          (get().newsMode ? 'news' : 'default'),
      }
      if (data.sources && data.sources.length > 0) {
        newAssistantMessage.sources = data.sources
      }

      chatEntry.messages = chatEntry.messages.map((m) =>
        m._id === messageId
          ? editedUserMessage
          : m._id === newAssistantMessage._id
          ? newAssistantMessage
          : m
      )

      storage.set('chats', chats)
      set({ chats })
      get().loadAllChats()
    } catch (error) {
      console.log('[chat.store] editMessage ERROR →', error)
      get().setError('Failed to edit message')
    }
  },

  async renameChat(chatId, title) {
    try {
      await chatClient.rename(chatId, { title })

      const prev = get().chats
      const chats = structuredClone(prev)

      if (chats[chatId]) {
        chats[chatId].title = title
        set({ chats })
      }

      const history = get().history.map((c) =>
        c._id === chatId ? { ...c, title } : c
      )
      set({ history })
    } catch (error) {
      console.log('[chat.store] renameChat ERROR →', error)
      get().setError('Failed to rename chat')
    }
  },

  async deleteChat(chatId) {
    try {
      await chatClient.delete(chatId)

      const prev = get().chats
      const chats = structuredClone(prev)

      if (chats[chatId]) {
        delete chats[chatId]
        set({ chats })
        storage.set('chats', chats)
      }

      const history = get().history.filter((c) => c._id !== chatId)
      set({ history })

      if (get().currentChatId === chatId) {
        set({ currentChatId: null })
        window.history.pushState(null, '', '/chat')
      }
    } catch (error) {
      console.log('[chat.store] deleteChat ERROR →', error)
      get().setError('Failed to delete chat')
    }
  },
}))
