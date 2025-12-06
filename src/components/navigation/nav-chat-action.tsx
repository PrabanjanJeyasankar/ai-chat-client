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
  const [keys, setKeys] = useState({
    search: '',
    newChat: '',
  })

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().includes('MAC')

    setKeys({
      search: isMac ? '⌘K' : 'Ctrl+K',
      newChat: isMac ? '⇧⌘O' : 'Ctrl+Shift+O',
    })

    const handler = (e: KeyboardEvent) => {
      const meta = isMac ? e.metaKey : e.ctrlKey

      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenSearch()
      }

      if (meta && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        onNewChat()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onNewChat, onOpenSearch])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Actions</SidebarGroupLabel>

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <button
              onClick={onNewChat}
              className='w-full flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <SquarePen className='size-4' />
                <span>New Chat</span>
              </div>

              <span className='text-xs opacity-60'>{keys.newChat}</span>
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

              <span className='text-xs opacity-60'>{keys.search}</span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
