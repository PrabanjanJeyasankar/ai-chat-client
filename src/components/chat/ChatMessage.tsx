import { Badge } from '@/components/ui/badge'
import { Markdown } from '@/components/ui/markdown'
import { Message } from '@/components/ui/message'
import type { Source } from '@/domain/chat/chat.types'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Check,
  Copy,
  DatabaseZap,
  ExternalLink,
  X,
} from 'lucide-react'
import { useState } from 'react'

type Version = {
  content: string
  model?: string | null
  createdAt?: string
  isError?: boolean
}

type ChatMessageProps = {
  role: 'user' | 'assistant'
  mode?: 'default' | 'news'
  versions?: Version[]
  currentVersionIndex?: number
  messageId: string
  sources?: Source[]

  isEditing?: boolean
  editingContent?: string
  onStartEdit?: (id: string, content: string) => void
  onEditChange?: (value: string) => void
  onSave?: () => void
  onCancel?: () => void
}

export function ChatMessage({
  role,
  mode = 'default',
  versions = [],
  currentVersionIndex = 0,
  messageId: _messageId,
  sources = [],
  isEditing = false,
  editingContent = '',
  onStartEdit: _onStartEdit,
  onEditChange,
  onSave,
  onCancel,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const isUser = role === 'user'
  const version = versions[currentVersionIndex] || {}
  const content = version.content || ''

  const isError = version.isError === true
  const hasSources = !isUser && sources && sources.length > 0
  const isNewsMode = !isUser && mode === 'news'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore clipboard errors silently
    }
  }

  return (
    <div
      className={`flex w-full ${
        isUser ? 'justify-end' : 'justify-start'
      }  group`}>
      <div
        className={`relative flex flex-col max-w-[85%] md:max-w-[75%] ${
          isUser ? 'items-end' : 'items-start'
        }`}>
        {isError ? (
          <Message className='w-fit rounded-2xl p-4 bg-destructive/20 text-destructive flex gap-3 items-start'>
            <AlertTriangle className='h-5 w-5 shrink-0 mt-1' />
            <p className='whitespace-pre-wrap text-sm font-medium'>{content}</p>
          </Message>
        ) : (
          <>
            {isNewsMode && (
              <div
                className={
                  'flex items-center gap-1 h-6 px-2 rounded-full border bg-primary/15 border-primary/10 text-primary mb-2'
                }
                aria-hidden='true'>
                <div className='w-4 h-4 flex items-center justify-center'>
                  <DatabaseZap className='size-3 text-primary' />
                </div>

                <span className='text-xs font-medium whitespace-nowrap'>
                  News
                </span>
              </div>
            )}
            <Message
              className={`w-fit wrap-break-word overflow-wrap-anywhere max-w-full
                ${
                  isUser
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-none px-4 py-2'
                    : 'bg-muted rounded-2xl rounded-bl-none p-4'
                }
              `}>
              {isEditing ? (
                <textarea
                  className='w-full text-sm p-2 rounded bg-white text-black min-w-[200px]'
                  value={editingContent}
                  onChange={(e) => onEditChange?.(e.target.value)}
                  rows={3}
                />
              ) : isUser ? (
                <p className='whitespace-pre-wrap text-sm'>{content}</p>
              ) : (
                <Markdown className='text-sm'>{content}</Markdown>
              )}
            </Message>

            {hasSources && (
              <div className='mt-3 space-y-2 w-full'>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span className='font-medium'>📚 Sources</span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='group'>
                      <Badge
                        variant='secondary'
                        className='flex items-center gap-1.5 py-1.5 px-3 hover:bg-primary/10 transition-colors cursor-pointer'>
                        <span className='text-xs font-medium truncate max-w-[200px]'>
                          {source.title}
                        </span>
                        <ExternalLink className='h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100' />
                      </Badge>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {!isError && (
              <div
                className={`absolute top-full flex gap-1 mt-1 ${
                  isUser ? 'right-0 flex-row-reverse' : 'left-0 flex-row'
                } ${
                  isEditing
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100 transition-opacity'
                }`}>
                {isEditing ? (
                  <>
                    <button
                      onClick={onSave}
                      className='p-1.5 text-green-600 hover:bg-muted rounded-full transition-colors'
                      title='Save'>
                      <Check className='h-4 w-4' />
                    </button>
                    <button
                      onClick={onCancel}
                      className='p-1.5 text-red-600 hover:bg-muted rounded-full transition-colors'
                      title='Cancel'>
                      <X className='h-4 w-4' />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCopy}
                      className='p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors'
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

                    {/* {isUser && (
                      <button
                        onClick={() => onStartEdit?.(messageId, content)}
                        className='p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors'
                        title='Edit'>
                        <Edit3 className='h-4 w-4' />
                      </button>
                    )} */}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
