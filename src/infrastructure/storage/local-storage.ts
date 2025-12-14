import { environment } from '@/api/environment'

const STORAGE_PREFIX = 'ai_chat_'

export const storage = {
  get<T>(key: string): T | null {
    if (!environment.isDev && key === 'chats') {
      return null
    }
    const value = localStorage.getItem(STORAGE_PREFIX + key)
    return value ? JSON.parse(value) : null
  },

  set<T>(key: string, value: T): void {
    if (!environment.isDev && key === 'chats') {
      return
    }
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  },

  remove(key: string): void {
    localStorage.removeItem(STORAGE_PREFIX + key)
  },

  clear(): void {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(STORAGE_PREFIX)
    )
    keys.forEach((key) => localStorage.removeItem(key))
  },
}

export const zustandStorage = {
  getItem: (key: string): string | null => {
    if (!environment.isDev && key.endsWith('chats')) {
      return null
    }
    return localStorage.getItem(key)
  },
  setItem: (key: string, value: string): void => {
    if (!environment.isDev && key.endsWith('chats')) {
      return
    }
    localStorage.setItem(key, value)
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key)
  },
}
