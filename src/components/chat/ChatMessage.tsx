import { Markdown } from '@/components/ui/markdown'
import { Message } from '@/components/ui/message'
import { AlertTriangle, Check, Copy, X } from 'lucide-react'

type Version = {
  content: string
  model?: string | null
  createdAt?: string
  isError?: boolean
}

type ChatMessageProps = {
  role: 'user' | 'assistant'
  versions?: Version[]
  currentVersionIndex?: number
  messageId: string

  isEditing?: boolean
  editingContent?: string
  onStartEdit?: (id: string, content: string) => void
  onEditChange?: (value: string) => void
  onSave?: () => void
  onCancel?: () => void
}

export function ChatMessage({
  role,
  versions = [],
  currentVersionIndex = 0,
  messageId,
  isEditing = false,
  editingContent = '',
  onStartEdit,
  onEditChange,
  onSave,
  onCancel,
}: ChatMessageProps) {
  const isUser = role === 'user'
  const version = versions[currentVersionIndex] || {}
  const content = version.content || ''

  const isError = version.isError === true

  const handleCopy = () => navigator.clipboard.writeText(content)

  return (
    <div
      className={`flex w-full ${
        isUser ? 'justify-end' : 'justify-start'
      } my-3 group`}>
      <div
        className={`flex flex-col max-w-[75%] ${
          isUser ? 'items-end' : 'items-start'
        }`}>
        {isError ? (
          <Message className='w-fit rounded-2xl p-4 bg-destructive/20 text-destructive flex gap-3 items-start'>
            <AlertTriangle className='h-5 w-5 shrink-0 mt-1' />
            <p className='whitespace-pre-wrap text-sm font-medium'>{content}</p>
          </Message>
        ) : (
          <>
            <Message
              className={`w-fit p-4
                ${
                  isUser
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-none'
                    : 'bg-muted rounded-2xl rounded-bl-none'
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

            {!isError && (
              <div
                className={`flex gap-1 mt-1 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
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
                      title='Copy'>
                      <Copy className='h-4 w-4' />
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
