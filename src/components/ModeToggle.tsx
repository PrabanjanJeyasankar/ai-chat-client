// ModeToggle.tsx
'use client'

import type { ChatMode } from '@/domain/chat/chat.types'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { DatabaseZap, Scale } from 'lucide-react'

type ModeToggleProps = {
  mode: ChatMode
  onModeChange: (mode: ChatMode) => void
}

const modeConfig = {
  news: {
    label: 'News',
    icon: DatabaseZap,
  },
  law: {
    label: 'Law',
    icon: Scale,
  },
} as const

type ModeType = keyof typeof modeConfig

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const handleModeClick = (clickedMode: ModeType) => {
    if (mode === clickedMode) {
      onModeChange('default')
    } else {
      onModeChange(clickedMode)
    }
  }

  return (
    <div className='flex items-center gap-2'>
      {(Object.keys(modeConfig) as ModeType[]).map((modeKey) => {
        const config = modeConfig[modeKey]
        const Icon = config.icon
        const isActive = mode === modeKey

        return (
          <button
            key={modeKey}
            type='button'
            aria-pressed={isActive}
            onClick={() => handleModeClick(modeKey)}
            className={cn(
              'flex items-center gap-2 h-8 px-2 rounded-full border transition-all',
              isActive
                ? 'bg-primary/15 border-primary/60 text-primary'
                : 'bg-background/80 border-border/70 text-muted-foreground hover:text-foreground'
            )}>
            <div className='w-5 h-5 flex items-center justify-center'>
              <motion.div
                animate={{
                  rotate: isActive ? 360 : 0,
                  scale: isActive ? 1.1 : 1,
                }}
                whileHover={{
                  rotate: isActive ? 345 : 15,
                  scale: 1.1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 25,
                }}>
                <Icon
                  className={cn(
                    'size-4',
                    isActive ? 'text-primary' : 'text-inherit'
                  )}
                />
              </motion.div>
            </div>

            <AnimatePresence>
              {isActive && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className='text-xs font-medium whitespace-nowrap overflow-hidden'>
                  {config.label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )
      })}
    </div>
  )
}
