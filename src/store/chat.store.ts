import { chatService, type ChatListItem } from '@/services/chat.service'
import { messageService, type Message } from '@/services/message.service'
import { storage } from '@/utils/storage'
import { create } from 'zustand'

export type LocalChat = {
  chatId: string
  title?: string
  messages: Message[]
  isTemporary?: boolean
  mode?: 'default' | 'news'
}

type ChatState = {
  chats: Record<string, LocalChat>
  currentChatId: string | null

  newsMode: boolean
  setNewsMode: (enabled: boolean) => void

  history: ChatListItem[]
  hasHydrated: boolean
  loadAllChats: () => Promise<void>

  welcomeMessageTrigger: number
  refreshWelcomeMessage: () => void

  isAssistantTyping: boolean
  setAssistantTyping: (typing: boolean) => void
  assistantTypingMode: 'default' | 'news' | null
  setAssistantTypingMode: (mode: 'default' | 'news' | null) => void

  clearAll: () => void

  error: string | null
  setError: (msg: string | null) => void
  clearError: () => void

  setCurrentChat: (chatId: string | null) => void

  createTempChat: () => string
  upgradeTempChat: (tempId: string, realId: string, title: string) => void

  isChatLoading: boolean

  loadChatFromBackend: (chatId: string) => Promise<void>
  sendMessage: (chatId: string | null, content: string) => Promise<void>
  editMessage: (messageId: string, content: string) => Promise<void>
  renameChat: (chatId: string, title: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: storage.get<Record<string, LocalChat>>('chats') || {},
  currentChatId: null,
  isChatLoading: false,

  // Persist the chat input's mode toggle across reloads.
  // This is a UI preference (not per-chat), used when sending the next message.
  newsMode: storage.get<boolean>('newsMode') ?? false,
  setNewsMode(enabled) {
    storage.set('newsMode', enabled)
    set({ newsMode: enabled })
  },

  history: [],
  hasHydrated: false,

  assistantTypingMode: null,
  setAssistantTypingMode(mode) {
    set({ assistantTypingMode: mode })
  },

  error: null,
  setError(msg) {
    console.log('[chat.store] ERROR →', msg)
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
    })
  },

  async loadAllChats() {
    try {
      const response = await chatService.getAllChats()

      set({ history: response.data, hasHydrated: true })
    } catch (error) {
      console.error('[chat.store] loadAllChats ERROR →', error)
    }
  },

  welcomeMessageTrigger: 0,
  refreshWelcomeMessage() {
    set((state) => ({ welcomeMessageTrigger: state.welcomeMessageTrigger + 1 }))
  },

  isAssistantTyping: false,
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
      const response = await messageService.getMessages(chatId)

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = error

      const backendError =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
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

    const prev = get().chats
    const chats = structuredClone(prev)
    const chat = chats[localId]

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

    set({ chats })
    get().setAssistantTyping(true)
    get().setAssistantTypingMode(requestedMode)

    try {
      let response

      try {
        if (chat.isTemporary) {
          response = await messageService.createMessage({
            content,
            mode: requestedMode,
          })

          const realId = response.data.chatId || localId
          const title = response.data.title || 'New Chat'

          get().upgradeTempChat(localId, realId, title)
          localId = realId

          // Set chat mode
          const latest = get().chats
          const updated = structuredClone(latest)
          if (updated[realId]) {
            updated[realId].mode = requestedMode
          }
          set({ chats: updated })
        } else {
          response = await messageService.createMessageInChat(localId, {
            content,
            mode: requestedMode,
          })

          const latest = get().chats
          const updated = structuredClone(latest)
          if (updated[localId]) {
            updated[localId].mode = requestedMode
          }
          set({ chats: updated })
        }

        const realId = response.data.chatId ?? localId
        const latest = get().chats
        const updated = structuredClone(latest)

        const updatedChat = updated[realId]

        const userMessage = {
          ...response.data.userMessage,
          mode:
            response.data.userMessage.mode ||
            updatedChat?.mode ||
            requestedMode,
        }

        const assistantMessage = {
          ...response.data.assistantMessage,
          mode:
            response.data.assistantMessage.mode ||
            updatedChat?.mode ||
            requestedMode,
        }
        if (response.data.sources && response.data.sources.length > 0) {
          assistantMessage.sources = response.data.sources
        }

        updatedChat.messages = [
          ...updatedChat.messages.filter((m) => !m._id.startsWith('temp-')),
          userMessage,
          assistantMessage,
        ]

        storage.set('chats', updated)
        set({ chats: updated })
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = error

        const backendError =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Unknown error occurred'

        const latest = get().chats
        const updated = structuredClone(latest)
        const updatedChat = updated[localId]

        updatedChat.messages.push({
          _id: `error-${Date.now()}`,
          chatId: localId,
          userId: null,
          role: 'assistant',
          mode: updatedChat.mode || requestedMode,
          versions: [
            {
              content: `${backendError}`,
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
      }

      setTimeout(() => {
        get().loadAllChats()
      }, 100)
    } finally {
      get().setAssistantTyping(false)
      get().setAssistantTypingMode(null)
    }
  },
  async editMessage(messageId, content) {
    console.log('[chat.store] editMessage →', messageId)

    try {
      const { data } = await messageService.editMessage(messageId, { content })

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
      await chatService.renameChat(chatId, { title })

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
      await chatService.deleteChat(chatId)

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
