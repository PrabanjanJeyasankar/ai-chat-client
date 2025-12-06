// AppSidebar.tsx

'use client'

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

  const currentUser = authStore((s) => s.currentUser)

  const { loadAllChats, setCurrentChat, refreshWelcomeMessage } = useChatStore()

  useEffect(() => {
    loadAllChats()
  }, [])

  const handleNewChat = () => {
    setCurrentChat(null)
    refreshWelcomeMessage()

    navigate('/chat')
  }

  return (
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
        <NavChatActions onNewChat={handleNewChat} />
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
  )
}
