'use client'

import { Button } from '@/components/ui/button'
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from '@/components/ui/prompt-input'
import { ArrowUp, Square } from 'lucide-react'
import { useState } from 'react'

type ChatInputProps = {
  onSendMessage: (content: string) => void
  isLoading: boolean
  onStop?: () => void
  disabled?: boolean
}

export function ChatInput({
  onSendMessage,
  isLoading,
  onStop,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    if (!input.trim() || isLoading || disabled) return
    onSendMessage(input.trim())
    setInput('')
  }

  return (
    <div className='bg-background'>
      <div className='mx-auto max-w-3xl pb-6'>
        <PromptInput
          value={input}
          onValueChange={setInput}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          disabled={disabled}
          className='w-full'>
          <PromptInputTextarea placeholder='Message AI...' />

          <PromptInputActions className='justify-end pt-2'>
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
