import { useChatStore } from '@/domain/chat/chat.store'
import { useMemo } from 'react'

export type LatestProgressDetails = {
  stage?: string
  substage?: unknown
  message?: string
  title?: string
  timestamp?: string
  messageId?: string
  [key: string]: unknown
}

export function useLatestProgressDetails(): LatestProgressDetails | null {
  const messageProgress = useChatStore((s) => s.messageProgress)

  return useMemo(() => {
    const entries = Object.values(messageProgress) as LatestProgressDetails[]
    if (entries.length === 0) return null
    return entries[entries.length - 1]
  }, [messageProgress])
}
