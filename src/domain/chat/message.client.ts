import { apiEndpoints } from '@/api/apiEndpoints'
import { axiosInstance } from '@/infrastructure/http/axios-instance'
import type { ChatMode, Message, Source } from './chat.types'

type CreateMessageRequest = {
  content: string
  mode?: ChatMode
}

type CreateMessageResponse = {
  success: boolean
  message: string
  data: {
    userMessage: Message
    assistantMessage: Message
    chatId?: string
    title?: string
    sources?: Source[]
  }
}

type GetMessagesResponse = {
  success: boolean
  message: string
  data: {
    messages: Message[]
  }
}

type EditMessageRequest = {
  content: string
}

type EditMessageResponse = {
  success: boolean
  message: string
  data: {
    editedUserMessage: Message
    newAssistantMessage: Message
    sources?: Source[]
  }
}

export const messageClient = {
  create: async (
    data: CreateMessageRequest
  ): Promise<CreateMessageResponse> => {
    const response = await axiosInstance.post<CreateMessageResponse>(
      apiEndpoints.message.create,
      data,
      { timeout: 180000 }
    )
    return response.data
  },

  createInChat: async (
    chatId: string,
    data: CreateMessageRequest
  ): Promise<CreateMessageResponse> => {
    const response = await axiosInstance.post<CreateMessageResponse>(
      apiEndpoints.message.createInChat(chatId),
      data,
      { timeout: 180000 }
    )
    return response.data
  },

  getMessages: async (chatId: string): Promise<GetMessagesResponse> => {
    const response = await axiosInstance.get<GetMessagesResponse>(
      apiEndpoints.message.getMessages(chatId)
    )
    return response.data
  },

  editMessage: async (
    messageId: string,
    data: EditMessageRequest
  ): Promise<EditMessageResponse> => {
    const response = await axiosInstance.patch<EditMessageResponse>(
      apiEndpoints.message.edit(messageId),
      data,
      { timeout: 180000 }
    )
    return response.data
  },

  regenerateMessage: async (messageId: string) => {
    const response = await axiosInstance.post(
      apiEndpoints.message.regenerate(messageId),
      {},
      { timeout: 180000 }
    )
    return response.data
  },
}
