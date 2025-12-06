import { apiEndpoints } from '@/api/apiEndpoints'
import { axiosInstance } from '@/lib/axiosInstance'

export type Message = {
  _id: string
  chatId: string
  userId: string | null
  role: 'user' | 'assistant'
  versions: Array<{
    content: string
    model: string | null
    createdAt: string
    isError?: boolean
  }>
  currentVersionIndex: number
  createdAt: string
  updatedAt: string
}

export type CreateMessageRequest = {
  content: string
}

export type CreateMessageResponse = {
  success: boolean
  message: string
  data: {
    userMessage: Message
    assistantMessage: Message
    chatId?: string
    title?: string
  }
}

export type GetMessagesResponse = {
  success: boolean
  message: string
  data: {
    messages: Message[]
  }
}

export type EditMessageRequest = {
  content: string
}

export type EditMessageResponse = {
  success: boolean
  message: string
  data: {
    editedUserMessage: Message
    newAssistantMessage: Message
  }
}

async function createMessage(
  data: CreateMessageRequest
): Promise<CreateMessageResponse> {
  const response = await axiosInstance.post<CreateMessageResponse>(
    apiEndpoints.message.create,
    data
  )
  return response.data
}

async function createMessageInChat(
  chatId: string,
  data: CreateMessageRequest
): Promise<CreateMessageResponse> {
  const response = await axiosInstance.post<CreateMessageResponse>(
    apiEndpoints.message.createInChat(chatId),
    data
  )
  return response.data
}

async function getMessages(chatId: string): Promise<GetMessagesResponse> {
  const response = await axiosInstance.get<GetMessagesResponse>(
    apiEndpoints.message.getMessages(chatId)
  )
  return response.data
}

async function editMessage(
  messageId: string,
  data: EditMessageRequest
): Promise<EditMessageResponse> {
  const response = await axiosInstance.put<EditMessageResponse>(
    apiEndpoints.message.edit(messageId),
    data
  )
  return response.data
}

export const messageService = {
  createMessage,
  createMessageInChat,
  getMessages,
  editMessage,
}
