'use client'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { Search, SquarePen } from 'lucide-react'

type NavChatActionsProps = {
  onNewChat: () => void
}

export function NavChatActions({ onNewChat }: NavChatActionsProps) {
  const handleNewChat = () => {
    onNewChat()
  }

  const handleSearch = () => {
    console.log('[NavChatActions] Search clicked (not implemented)')
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Actions</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <button
              onClick={handleNewChat}
              className='w-full flex items-center gap-2'>
              <SquarePen className='size-4' />
              <span>New Chat</span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <button
              onClick={handleSearch}
              className='w-full flex items-center gap-2'>
              <Search className='size-4' />
              <span>Search</span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
