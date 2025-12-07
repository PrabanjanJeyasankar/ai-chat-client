import { SearchDialog } from '@/components/chat/SearchDialog'
import { searchService } from '@/services/search.service'
import { useState } from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { authStore } from '@/store/auth.store'
import { useChatStore } from '@/store/chat.store'
import { Logo } from '../Logo'
import { NavUser } from '../nav-user'
import { NavChatActions } from './nav-chat-action'
import { NavChatHistory } from './nav-chat-history'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const currentUser = authStore((s) => s.currentUser)
  const { loadAllChats, setCurrentChat, refreshWelcomeMessage } = useChatStore()

  useEffect(() => {
    loadAllChats()
  }, [])

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().includes('MAC')

    const listener = (event: KeyboardEvent) => {
      if (
        (isMac && event.metaKey && event.key === 'k') ||
        (!isMac && event.ctrlKey && event.key === 'k')
      ) {
        event.preventDefault()
        setIsSearchOpen(true)
      }
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  const handleNewChat = () => {
    setCurrentChat(null)
    refreshWelcomeMessage()
    navigate('/chat')
  }

  return (
    <>
      <Sidebar variant='inset' {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size='lg' asChild>
                <a href='#'>
                  <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                    <Logo />
                  </div>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-medium'>AI Chat</span>
                    <span className='truncate text-xs'>Personal Workspace</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <NavChatActions
            onNewChat={handleNewChat}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
          <NavChatHistory />
        </SidebarContent>

        <SidebarFooter>
          <NavUser
            user={{
              name: currentUser?.name || 'Guest',
              email: currentUser?.email || 'guest@example.com',
              avatar: '/avatars/shadcn.jpg',
            }}
          />
        </SidebarFooter>
      </Sidebar>

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={searchService.searchMessages}
      />
    </>
  )
}
