import { Button } from '@/components/ui/button'
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from '@/components/ui/prompt-input'
import { MAX_SINGLE_MESSAGE_CHARS } from '@/config/llmLmits'
import { useChatStore } from '@/domain/chat/chat.store'
import { ArrowUp, Square } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ModeToggle } from '../ModeToggle'

type ChatInputProps = {
  onSendMessage: (content: string) => void
  isLoading: boolean
  onStop?: () => void
  disabled?: boolean
}

export function ChatInput({
  onSendMessage,
  isLoading,
  onStop = () => {},
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const [hasShownLimitToast, setHasShownLimitToast] = useState(false)
  const { mode, setMode } = useChatStore()

  const getCharCount = (text: string) => [...text].length

  const handleChange = (value: string) => {
    const count = getCharCount(value)

    if (count > MAX_SINGLE_MESSAGE_CHARS) {
      if (!hasShownLimitToast) {
        toast.error(`Maximum allowed is ${MAX_SINGLE_MESSAGE_CHARS} characters`)
        setHasShownLimitToast(true)
      }
      return
    }

    if (count < MAX_SINGLE_MESSAGE_CHARS && hasShownLimitToast) {
      setHasShownLimitToast(false)
    }

    setInput(value)
  }

  const handleSubmit = () => {
    if (!input.trim() || isLoading || disabled) return
    onSendMessage(input.trim())
    setInput('')
    setHasShownLimitToast(false)
  }

  const charCount = getCharCount(input)

  return (
    <div className='bg-background'>
      <div className='mx-auto max-w-3xl pb-6'>
        <PromptInput
          value={input}
          onValueChange={handleChange}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          disabled={disabled}
          className='w-full'>
          <PromptInputTextarea
            placeholder='Message AI...'
            value={input}
            onChange={(e) => handleChange(e.target.value)}
          />

          <PromptInputActions className='flex items-center justify-between pt-2 w-full px-1'>
            <div className='flex items-center gap-2'>
              <ModeToggle
                mode={mode}
                onModeChange={(newMode) => {
                  setMode(newMode)
                  const modeLabel = newMode === 'default' ? 'Default' : newMode === 'news' ? 'News' : 'Law'
                  toast.success(`${modeLabel} mode ${newMode === 'default' ? 'disabled' : 'enabled'}`)
                }}
              />

              <div className='text-xs text-muted-foreground'>
                {charCount}/{MAX_SINGLE_MESSAGE_CHARS}
              </div>
            </div>

            <PromptInputAction tooltip={isLoading ? 'Stop' : 'Send'}>
              <Button
                type='button'
                variant='default'
                size='icon'
                className='h-8 w-8 rounded-full'
                disabled={disabled}
                onClick={isLoading ? onStop : handleSubmit}>
                {isLoading ? (
                  <Square className='size-5 fill-current' />
                ) : (
                  <ArrowUp className='size-5' />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  )
}
