import { Message } from '@/components/ui/message'
import { AlertTriangle } from 'lucide-react'

type MessageErrorProps = {
  content: string
}

export function MessageError({ content }: MessageErrorProps) {
  return (
    <Message className='flex w-fit items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-destructive backdrop-blur-sm'>
      <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0' />
      <p className='whitespace-pre-wrap text-sm font-medium leading-relaxed'>
        {content}
      </p>
    </Message>
  )
}
