import { environment } from './environment'

const baseUrl = environment.apiBaseUrl

export const apiEndpoints = {
  auth: {
    signup: `${baseUrl}/auth/signup`,
    login: `${baseUrl}/auth/login`,
    me: `${baseUrl}/auth/me`,
    refresh: `${baseUrl}/auth/refresh`,
    logout: `${baseUrl}/auth/logout`,
  },
  chat: {
    create: `${baseUrl}/chat`,
    getAll: `${baseUrl}/chat`,
    getById: (chatId: string) => `${baseUrl}/chat/${chatId}`,
    rename: (chatId: string) => `${baseUrl}/chat/${chatId}`,
    delete: (chatId: string) => `${baseUrl}/chat/${chatId}`,
  },
  message: {
    create: `${baseUrl}/message`,
    createInChat: (chatId: string) => `${baseUrl}/message/${chatId}/messages`,
    getMessages: (chatId: string) => `${baseUrl}/message/${chatId}/messages`,
    edit: (messageId: string) => `${baseUrl}/message/${messageId}`,
    regenerate: (messageId: string) =>
      `${baseUrl}/message/${messageId}/regenerate`,
  },
  search: {
    search: `${baseUrl}/search`,
  },
} as const

export type ApiEndpoints = typeof apiEndpoints
