import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { Search, SquarePen } from 'lucide-react'
import { useEffect, useState } from 'react'

type NavChatActionsProps = {
  onNewChat: () => void
  onOpenSearch: () => void
}

export function NavChatActions({
  onNewChat,
  onOpenSearch,
}: NavChatActionsProps) {
  const [shortcutLabel, setShortcutLabel] = useState('')

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().includes('MAC')
    setShortcutLabel(isMac ? '⌘K' : 'Ctrl+K')
  }, [])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Actions</SidebarGroupLabel>

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <button
              onClick={onNewChat}
              className='w-full flex items-center gap-2'>
              <SquarePen className='size-4' />
              <span>New Chat</span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <button
              onClick={onOpenSearch}
              className='w-full flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <Search className='size-4' />
                <span>Search</span>
              </div>

              <span className='text-xs opacity-60'>{shortcutLabel}</span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
