import type { ChatMode } from '@/domain/chat/chat.types'
import { cn } from '@/lib/utils'
import { DatabaseZap, Scale } from 'lucide-react'

type MessageModeBadgeProps = {
  mode: ChatMode
}

export function MessageModeBadge({ mode }: MessageModeBadgeProps) {
  const isNews = mode === 'news'
  return (
    <div
      className={cn(
        'mb-2.5 inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold backdrop-blur-sm',
        isNews
          ? 'border-chart-2/25 bg-chart-2/10 text-chart-2'
          : 'border-chart-5/25 bg-chart-5/10 text-chart-5'
      )}
      aria-hidden='true'>
      <div className='flex h-3.5 w-3.5 items-center justify-center'>
        {isNews ? (
          <DatabaseZap className='h-3 w-3' />
        ) : (
          <Scale className='h-3 w-3' />
        )}
      </div>
      <span className='whitespace-nowrap'>
        {isNews ? 'News' : 'Legal'}
      </span>
    </div>
  )
}
