'use client'

import { useChatStore } from '@/store/chat.store'

export default function CurrentChatTitle() {
  const { currentChatId, history } = useChatStore()

  const chat = history.find((c) => c._id === currentChatId)

  const title = chat?.title || 'Chat'

  return <h1 className='text-sm font-medium truncate'>{title}</h1>
}
