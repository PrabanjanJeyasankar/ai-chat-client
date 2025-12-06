// chat.store.ts

import { chatService, type ChatListItem } from '@/services/chat.service'
import { messageService, type Message } from '@/services/message.service'
import { storage } from '@/utils/storage'
import { create } from 'zustand'

export type LocalChat = {
  chatId: string
  title?: string
  messages: Message[]
  isTemporary?: boolean
}

type ChatState = {
  chats: Record<string, LocalChat>
  currentChatId: string | null

  history: ChatListItem[]
  hasHydrated: boolean
  loadAllChats: () => Promise<void>

  welcomeMessageTrigger: number
  refreshWelcomeMessage: () => void

  isAssistantTyping: boolean
  setAssistantTyping: (typing: boolean) => void

  clearAll: () => void

  error: string | null
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
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: storage.get<Record<string, LocalChat>>('chats') || {},
  currentChatId: null,

  history: [],
  hasHydrated: false,

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
      isAssistantTyping: false,
    })
  },

  async loadAllChats() {
    try {
      const response = await chatService.getAllChats()

      set({ history: response.data, hasHydrated: true })
    } catch (error) {}
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

    chats[tempId] = {
      chatId: tempId,
      messages: [],
      isTemporary: true,
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
    }

    delete chats[tempId]

    storage.set('chats', chats)
    set({ chats, currentChatId: realId })

    get().loadAllChats()
  },

  async loadChatFromBackend(chatId) {
    try {
      const response = await messageService.getMessages(chatId)

      const prev = get().chats
      const chats = structuredClone(prev)

      chats[chatId] = {
        chatId,
        messages: response.data.messages,
        isTemporary: false,
      }

      storage.set('chats', chats)
      set({ chats })
    } catch (error) {
      get().setError('Failed to load chat')

      // create inline assistant error message
      const prev = get().chats
      const chats = structuredClone(prev)

      chats[chatId] = chats[chatId] || {
        chatId,
        messages: [],
        isTemporary: false,
      }

      chats[chatId].messages.push({
        _id: `error-${Date.now()}`,
        chatId,
        userId: null,
        role: 'assistant',
        versions: [
          {
            content: '⚠️ Failed to load messages.',
            model: null,
            createdAt: new Date().toISOString(),
            isError: true,
          },
        ],
        currentVersionIndex: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      set({ chats })
    }
  },

  async sendMessage(chatId, content) {
    let localId = chatId

    if (!localId) {
      localId = get().createTempChat()
    }

    const prev = get().chats
    const chats = structuredClone(prev)
    const chat = chats[localId]

    const tempMessageId = `temp-${Date.now()}`

    chat.messages.push({
      _id: tempMessageId,
      chatId: localId,
      userId: null,
      role: 'user',
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

    let response

    try {
      if (chat.isTemporary) {
        response = await messageService.createMessage({ content })

        const realId = response.data.chatId || localId
        const title = response.data.title || 'New Chat'

        get().upgradeTempChat(localId, realId, title)
        localId = realId
      } else {
        response = await messageService.createMessageInChat(localId, {
          content,
        })
      }

      const realId = response.data.chatId ?? localId
      const latest = get().chats
      const updated = structuredClone(latest)

      const updatedChat = updated[realId]

      updatedChat.messages = [
        ...updatedChat.messages.filter((m) => !m._id.startsWith('temp-')),
        response.data.userMessage,
        response.data.assistantMessage,
      ]

      storage.set('chats', updated)
      set({ chats: updated })
    } catch (error) {
      const latest = get().chats
      const updated = structuredClone(latest)
      const updatedChat = updated[localId]

      updatedChat.messages.push({
        _id: `error-${Date.now()}`,
        chatId: localId,
        userId: null,
        role: 'assistant',
        versions: [
          {
            content: 'Assistant failed to respond.',
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

    get().setAssistantTyping(false)
    get().loadAllChats()
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

      chatEntry.messages = chatEntry.messages.map((m) =>
        m._id === messageId
          ? data.editedUserMessage
          : m._id === data.newAssistantMessage._id
          ? data.newAssistantMessage
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

      // Update history immediately
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

      // Update history immediately
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
