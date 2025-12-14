import { apiEndpoints } from '@/api/apiEndpoints'
import { axiosInstance } from '@/infrastructure/http/axios-instance'
import type { ChatListItem, ChatMode } from './chat.types'

type ChatListResponse = {
  success: boolean
  message: string
  data: ChatListItem[]
}

type CreateChatRequest = {
  firstMessageContent?: string
  mode?: ChatMode
}

type CreateChatResponse = {
  success: boolean
  message: string
  data: {
    chatId: string
    userId: string
    title: string
    messages: []
    createdAt: string
    mode?: ChatMode
  }
}

type RenameChatRequest = {
  title: string
}

type RenameChatResponse = {
  success: boolean
  message: string
  data: {
    chatId: string
    title: string
    updatedAt: string
  }
}

export const chatClient = {
  getAll: async (): Promise<ChatListResponse> => {
    const response = await axiosInstance.get<ChatListResponse>(
      apiEndpoints.chat.getAll
    )
    return response.data
  },

  getById: async (chatId: string) => {
    const response = await axiosInstance.get(apiEndpoints.chat.getById(chatId))
    return response.data
  },

  create: async (data: CreateChatRequest): Promise<CreateChatResponse> => {
    const response = await axiosInstance.post<CreateChatResponse>(
      apiEndpoints.chat.create,
      data
    )
    return response.data
  },

  rename: async (
    chatId: string,
    data: RenameChatRequest
  ): Promise<RenameChatResponse> => {
    const response = await axiosInstance.patch<RenameChatResponse>(
      apiEndpoints.chat.rename(chatId),
      data
    )
    return response.data
  },

  delete: async (chatId: string) => {
    const response = await axiosInstance.delete(
      apiEndpoints.chat.delete(chatId)
    )
    return response.data
  },
}
