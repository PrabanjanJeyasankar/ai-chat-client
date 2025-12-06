import { ChatInput } from '@/components/chat/ChatInput'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { Loader } from '@/components/ui/loader'
import { Skeleton } from '@/components/ui/skeleton'
import { WELCOME_MESSAGES } from '@/constants/chat.constants'
import type { Message } from '@/services/message.service'
import { useChatStore } from '@/store/chat.store'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

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
    isChatLoading,
  } = useChatStore()

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState<string>('')
  const [showScrollDown, setShowScrollDown] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState(WELCOME_MESSAGES[0])
  const [searchParams, setSearchParams] = useSearchParams()

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

    if (!chats[chatId]) {
      loadChatFromBackend(chatId).catch(() => {})
    }
  }, [chatId, welcomeMessageTrigger])

  useEffect(() => {
    const handler = (event: any) => {
      const messageId = event.detail.messageId
      const element = document.getElementById(`msg-${messageId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('ring-2', 'ring-yellow-400')
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-yellow-400')
        }, 1500)
      }
    }
    window.addEventListener('scroll-to-message', handler)
    return () => window.removeEventListener('scroll-to-message', handler)
  }, [])

  const chat = currentChatId ? chats[currentChatId] : null
  const messages: Message[] = chat?.messages ?? []
  const isNewChat = messages.length === 0
  useEffect(() => {
    const msgId = searchParams.get('msgId')

    if (!chatId) {
      return
    }

    if (!msgId) {
      return
    }

    if (messages.length === 0) {
      return
    }

    setTimeout(() => {
      const el = document.getElementById(`msg-${msgId}`)

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-2', 'ring-yellow-400')

        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-yellow-400')
          setSearchParams({})
        }, 1500)
      }
    }, 150)
  }, [chatId, messages])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    container.scrollTop = container.scrollHeight

    const onScroll = () => {
      const isBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        120
      setShowScrollDown(!isBottom)
    }

    onScroll()
    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [messages, isAssistantTyping])

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
          className='h-full overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent'>
          <div className='mx-auto max-w-3xl space-y-4 min-h-full pb-40 flex flex-col'>
            {isChatLoading ? (
              <div className='flex flex-col space-y-4 pt-10 px-4 max-w-3xl mx-auto w-full'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='flex flex-col space-y-3'>
                    <div className='flex justify-end'>
                      <Skeleton className='h-12 w-2/3 rounded-2xl rounded-tr-sm' />
                    </div>
                    <div className='flex justify-start'>
                      <Skeleton className='h-24 w-3/4 rounded-2xl rounded-tl-sm' />
                    </div>
                  </div>
                ))}
              </div>
            ) : isNewChat ? (
              <div className='flex-1 flex flex-col'>
                <div className='flex-1 flex items-center justify-center'>
                  <motion.div
                    layoutId='chat-input'
                    className='w-full max-w-2xl flex flex-col items-center space-y-6 px-4'>
                    <div className='text-center space-y-2 w-full'>
                      <AnimatePresence mode='wait'>
                        <motion.div
                          key={welcomeMessage.title}
                          initial={{
                            opacity: 0,
                            y: -20,
                            scale: 0.95,
                            filter: 'blur(4px)',
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter: 'blur(0px)',
                          }}
                          exit={{
                            opacity: 0,
                            y: 20,
                            scale: 0.95,
                            filter: 'blur(4px)',
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                            mass: 0.5,
                          }}
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
                  <div id={`msg-${msg._id}`} key={msg._id}>
                    <ChatMessage
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
                  </div>
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

      <div className='pointer-events-none absolute bottom-[72px] left-0 right-0 h-32 bg-gradient-to-b from-background/0 via-background/70 to-background' />

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
