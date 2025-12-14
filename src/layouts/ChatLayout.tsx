import CurrentChatTitle from '@/components/CurrentChatTitle'
import { AppSidebar } from '@/components/navigation/AppSidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useChatStore } from '@/domain/chat/chat.store'
import { type ReactNode, useEffect } from 'react'

export type ChatLayoutProps = {
  children: ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const { connectWebSocket, disconnectWebSocket } = useChatStore()

  useEffect(() => {
    const initWebSocket = async () => {
      try {
        await connectWebSocket()
        console.log('[ChatLayout] WebSocket connected successfully')
      } catch (error) {
        console.error('[ChatLayout] WebSocket connection failed:', error)
      }
    }

    initWebSocket()

    return () => {
      disconnectWebSocket()
    }
  }, [connectWebSocket, disconnectWebSocket])

  return (
    <div className='h-dvh w-screen overflow-hidden fixed inset-0'>
      <SidebarProvider className='h-full overflow-hidden'>
        <AppSidebar />

        <SidebarInset className='flex flex-col h-full overflow-hidden p-0 m-0'>
          <header className='flex h-14 shrink-0 items-center gap-2 border-b px-4'>
            <SidebarTrigger />
            <Separator orientation='vertical' className='h-5' />
            <CurrentChatTitle />
          </header>

          <main className='flex-1 flex flex-col overflow-hidden min-h-0'>
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
