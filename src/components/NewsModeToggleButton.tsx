// NewsModeToggle.tsx
'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { DatabaseZap } from 'lucide-react'

type NewsModeToggleProps = {
  enabled: boolean
  onToggle: () => void
}

export function NewsModeToggle({ enabled, onToggle }: NewsModeToggleProps) {
  return (
    <button
      type='button'
      aria-pressed={enabled}
      onClick={onToggle}
      className={cn(
        'flex items-center gap-2 h-8 px-2 rounded-full border transition-all',
        enabled
          ? 'bg-primary/15 border-primary/60 text-primary'
          : 'bg-background/80 border-border/70 text-muted-foreground hover:text-foreground'
      )}>
      <div className='w-5 h-5 flex items-center justify-center'>
        <motion.div
          animate={{
            rotate: enabled ? 360 : 0,
            scale: enabled ? 1.1 : 1,
          }}
          whileHover={{
            rotate: enabled ? 345 : 15,
            scale: 1.1,
          }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 25,
          }}>
          <DatabaseZap
            className={cn('size-4', enabled ? 'text-primary' : 'text-inherit')}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {enabled && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='text-xs font-medium whitespace-nowrap overflow-hidden'>
            News
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
