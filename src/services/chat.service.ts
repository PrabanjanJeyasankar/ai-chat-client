// chat.service.ts

import { apiEndpoints } from '@/api/apiEndpoints'
import { axiosInstance } from '@/lib/axiosInstance'

export type ChatListItem = {
  _id: string
  title: string
  lastMessage?: string
  lastMessageAt?: string
  createdAt?: string
  updatedAt?: string
}

export type ChatListResponse = {
  success: boolean
  message: string
  data: ChatListItem[]
}

export type CreateChatRequest = {
  firstMessageContent: string
}

export type CreateChatResponse = {
  success: boolean
  message: string
  data: {
    chatId: string
    userId: string
    title: string
    messages: []
    createdAt: string
  }
}

export type RenameChatRequest = {
  title: string
}

export type RenameChatResponse = {
  success: boolean
  message: string
  data: {
    chatId: string
    title: string
    updatedAt: string
  }
}

async function getAllChats(): Promise<ChatListResponse> {
  const response = await axiosInstance.get<ChatListResponse>(
    apiEndpoints.chat.getAll
  )
  return response.data
}

async function getChat(chatId: string) {
  const response = await axiosInstance.get(apiEndpoints.chat.getById(chatId))
  return response.data
}

async function createChat(
  data: CreateChatRequest
): Promise<CreateChatResponse> {
  const response = await axiosInstance.post<CreateChatResponse>(
    apiEndpoints.chat.create,
    data
  )
  return response.data
}

async function renameChat(
  chatId: string,
  data: RenameChatRequest
): Promise<RenameChatResponse> {
  const response = await axiosInstance.patch<RenameChatResponse>(
    apiEndpoints.chat.rename(chatId),
    data
  )
  return response.data
}

async function deleteChat(chatId: string) {
  const response = await axiosInstance.delete(apiEndpoints.chat.delete(chatId))
  return response.data
}

export const chatService = {
  getAllChats,
  getChat,
  createChat,
  renameChat,
  deleteChat,
}
