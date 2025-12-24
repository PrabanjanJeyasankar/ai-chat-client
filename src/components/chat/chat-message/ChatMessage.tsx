import { Message } from '@/components/ui/message'
import type { ChatMode, MessageVersion, Source } from '@/domain/chat/chat.types'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import { useCopyToClipboard } from './hooks/useCopyToClipboard'
import { MessageActions } from './MessageActions'
import { MessageContent } from './MessageContent'
import { MessageError } from './MessageError'
import { MessageModeBadge } from './MessageModeBadge'
import { MessageSources } from './MessageSources'
import { cleanContent } from './utils/content-cleaner'

type ChatMessageProps = {
  role: 'user' | 'assistant'
  mode?: ChatMode
  versions?: MessageVersion[]
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
  messageId,
  sources = [],
  isEditing = false,
  editingContent = '',
  onStartEdit,
  onEditChange,
  onSave,
  onCancel,
}: ChatMessageProps) {
  const { copied, copy } = useCopyToClipboard()

  const isUser = role === 'user'
  const version = versions[currentVersionIndex]
  const content = version?.content ?? ''
  const isError = version?.isError === true
  const hasSources = !isUser && sources.length > 0
  const hasModeBadge = !isUser && (mode === 'news' || mode === 'law')

  const cleanedContent = useMemo(
    () => (hasSources ? cleanContent(content) : content),
    [content, hasSources]
  )

  const handleStartEdit = () => {
    if (onStartEdit) onStartEdit(messageId, content)
  }

  return (
    <div
      className={cn(
        'group flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}>
      <div
        className={cn(
          'relative flex flex-col',
          isUser ? 'items-end' : 'items-start',
          'max-w-[min(42rem,85%)] md:max-w-[min(48rem,75%)]'
        )}>
        {isError ? (
          <MessageError content={content} />
        ) : (
          <>
            {hasModeBadge && <MessageModeBadge mode={mode} />}

            <Message
              className={cn(
                'w-fit max-w-full rounded-2xl border',
                isUser
                  ? 'bg-primary text-primary-foreground border-primary/20 rounded-br-md px-4 py-2.5'
                  : 'bg-card text-foreground border-border/70 rounded-bl-md px-5 py-4'
              )}>
              <MessageContent
                content={cleanedContent}
                isUser={isUser}
                isEditing={isEditing}
                editingContent={editingContent}
                sources={sources}
                onEditChange={onEditChange}
              />
            </Message>

            {hasSources && <MessageSources sources={sources} />}

            <MessageActions
              isUser={isUser}
              isEditing={isEditing}
              copied={copied}
              onCopy={() => copy(content)}
              onStartEdit={isUser ? handleStartEdit : undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          </>
        )}
      </div>
    </div>
  )
}
