import { ChatInput } from '@/components/chat/ChatInput'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { Loader } from '@/components/ui/loader'
import { WELCOME_MESSAGES } from '@/constants/chat.constants'
import type { Message } from '@/services/message.service'
import { useChatStore } from '@/store/chat.store'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

export function ChatWindow() {
  const { chatId } = useParams<{ chatId?: string }>()
  const {
    chats,
    currentChatId,
    setCurrentChat,
    loadChatFromBackend,
    sendMessage,
    editMessage,
    isAssistantTyping,
    welcomeMessageTrigger,
  } = useChatStore()

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState<string>('')
  const [showScrollDown, setShowScrollDown] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState(WELCOME_MESSAGES[0])

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chatId) {
      setCurrentChat(null)
      setWelcomeMessage(
        WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]
      )
      return
    }

    setCurrentChat(chatId)
    if (!chats[chatId]) loadChatFromBackend(chatId).catch(() => {})
  }, [chatId, welcomeMessageTrigger])

  const chat = currentChatId ? chats[currentChatId] : null
  const messages: Message[] = chat?.messages ?? []
  const isNewChat = messages.length === 0

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, isAssistantTyping])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handler = () => {
      const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
      setShowScrollDown(!isBottom)
    }

    handler()
    el.addEventListener('scroll', handler)
    return () => el.removeEventListener('scroll', handler)
  }, [])

  const handleSendMessage = async (content: string) => {
    await sendMessage(currentChatId, content)
  }

  const saveEditedMessage = async (messageId: string) => {
    if (!editingContent.trim()) return
    await editMessage(messageId, editingContent)
    setEditingMessageId(null)
    setEditingContent('')
  }

  return (
    <div className='relative flex flex-col h-full overflow-hidden'>
      <div className='flex-1 w-full overflow-hidden'>
        <div
          ref={scrollRef}
          className='
            h-full overflow-y-auto
            px-4 py-6
            scrollbar-thin
            scrollbar-thumb-muted-foreground/10
            hover:scrollbar-thumb-muted-foreground/20
            scrollbar-track-transparent
          '>
          <div className='mx-auto max-w-3xl space-y-4 min-h-full pb-40'>
            {isNewChat ? (
              <div className='flex h-full flex-col'>
                <div className='flex-1 flex items-center justify-center'>
                  <motion.div
                    layoutId='chat-input'
                    className='w-full max-w-2xl flex flex-col items-center space-y-6 px-4'>
                    <div className='text-center space-y-2 w-full'>
                      <AnimatePresence mode='wait'>
                        <motion.div
                          key={welcomeMessage.title}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='flex flex-col items-center space-y-2'>
                          <h2 className='text-2xl font-semibold'>
                            {welcomeMessage.title}
                          </h2>
                          <p className='text-muted-foreground max-w-lg mx-auto'>
                            {welcomeMessage.subtitle}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className='w-full max-w-2xl'>
                      <ChatInput
                        onSendMessage={handleSendMessage}
                        isLoading={false}
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg._id}
                    role={msg.role}
                    versions={msg.versions}
                    currentVersionIndex={msg.currentVersionIndex}
                    messageId={msg._id}
                    isEditing={editingMessageId === msg._id}
                    editingContent={editingContent}
                    onStartEdit={(id, content) => {
                      setEditingMessageId(id)
                      setEditingContent(content)
                    }}
                    onEditChange={(value) => setEditingContent(value)}
                    onSave={() => saveEditedMessage(msg._id)}
                    onCancel={() => setEditingMessageId(null)}
                  />
                ))}

                {isAssistantTyping && (
                  <div className='flex w-full justify-start my-2'>
                    <div className='max-w-[75%] bg-muted rounded-2xl p-4'>
                      <Loader variant='typing' size='md' />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showScrollDown && (
        <button
          onClick={() =>
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: 'smooth',
            })
          }
          className='absolute left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground p-3 shadow-lg z-30 bottom-40'>
          <ArrowDown className='h-5 w-5' />
        </button>
      )}
      <div className='pointer-events-none absolute bottom-[72px] left-0 right-0 h-32 bg-gradient-to-b from-background/0 via-background/70 to-background'></div>

      {!isNewChat && (
        <motion.div
          layoutId='chat-input'
          className='absolute bottom-0 left-0 right-0 bg-background'>
          <div className='mx-auto max-w-3xl'>
            <ChatInput onSendMessage={handleSendMessage} isLoading={false} />
          </div>
        </motion.div>
      )}
    </div>
  )
}
