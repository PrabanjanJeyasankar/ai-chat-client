import CurrentChatTitle from '@/components/current-chat-title'
import { AppSidebar } from '@/components/navigation/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { type ReactNode } from 'react'

export type ChatLayoutProps = {
  children: ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className='h-screen w-screen overflow-hidden'>
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
