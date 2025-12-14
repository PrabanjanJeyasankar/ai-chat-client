import { useChatStore } from '@/domain/chat/chat.store'
import { useMemo } from 'react'

export function MessageProgress() {
  const { messageProgress, isAssistantTyping } = useChatStore()

  const currentProgress = useMemo(() => {
    const progressEntries = Object.values(messageProgress)
    if (progressEntries.length > 0) {
      return progressEntries[progressEntries.length - 1]
    }
    return null
  }, [messageProgress])

  if (!isAssistantTyping || !currentProgress) {
    return null
  }

  const icon =
    typeof currentProgress.icon === 'string' ? currentProgress.icon : '🤖'
  const title =
    typeof currentProgress.title === 'string'
      ? currentProgress.title
      : 'Processing'
  const message =
    typeof currentProgress.message === 'string' ? currentProgress.message : ''

  return (
    <div className='flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border'>
      <div className='flex items-center gap-3'>
        <div className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900'>
          <span className='text-lg'>{icon}</span>
        </div>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <h4 className='font-medium text-gray-900 dark:text-gray-100'>
              {title}
            </h4>
            <div className='flex space-x-1'>
              <div className='w-2 h-2 bg-blue-600 rounded-full animate-pulse'></div>
              <div className='w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75'></div>
              <div className='w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150'></div>
            </div>
          </div>
          <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}
