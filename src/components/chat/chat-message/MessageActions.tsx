import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, X } from 'lucide-react'

type MessageActionsProps = {
  isUser: boolean
  isEditing: boolean
  copied: boolean
  onCopy: () => void
  onStartEdit?: () => void
  onSave?: () => void
  onCancel?: () => void
}

export function MessageActions({
  isUser,
  isEditing,
  copied,
  onCopy,
  onStartEdit,
  onSave,
  onCancel,
}: MessageActionsProps) {
  return (
    <div
      className={cn(
        'absolute top-full mt-2 flex items-center gap-0.5 rounded-lg border border-border/70 bg-card p-1 backdrop-blur-sm',
        isUser ? 'right-0 flex-row-reverse' : 'left-0 flex-row',
        isEditing
          ? 'opacity-100'
          : 'opacity-0 transition-all duration-200 group-hover:opacity-100'
      )}>
      {isEditing ? (
        <>
          <button
            type='button'
            onClick={onSave}
            className='grid size-8 place-items-center rounded-md text-primary transition-all duration-200 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            title='Save'>
            <Check className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={onCancel}
            className='grid size-8 place-items-center rounded-md text-destructive transition-all duration-200 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            title='Cancel'>
            <X className='h-4 w-4' />
          </button>
        </>
      ) : (
        <>
          <button
            type='button'
            onClick={onCopy}
            className='grid size-8 place-items-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            title={copied ? 'Copied' : 'Copy'}>
            <AnimatePresence initial={false} mode='wait'>
              {copied ? (
                <motion.span
                  key='copied'
                  initial={{ opacity: 0, scale: 0.8, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -4 }}
                  transition={{ duration: 0.18 }}>
                  <Check className='h-4 w-4 text-primary' />
                </motion.span>
              ) : (
                <motion.span
                  key='copy'
                  initial={{ opacity: 0, scale: 0.8, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 4 }}
                  transition={{ duration: 0.18 }}>
                  <Copy className='h-4 w-4' />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* {isUser && onStartEdit && (
            <button
              type='button'
              onClick={onStartEdit}
              className='grid size-8 place-items-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              title='Edit'>
              <Edit3 className='h-4 w-4' />
            </button>
          )} */}
        </>
      )}
    </div>
  )
}
