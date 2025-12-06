import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useChatStore } from '@/store/chat.store'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function NavChatHistory() {
  const {
    history,
    currentChatId,
    setCurrentChat,
    loadChatFromBackend,
    renameChat,
    deleteChat,
  } = useChatStore()

  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openChat = async (id: string) => {
    window.history.replaceState(null, '', `/chat/${id}`)
    setCurrentChat(id)
    await loadChatFromBackend(id)
  }

  const startRename = (id: string, title: string) => {
    setRenameId(id)
    setRenameValue(title || '')

    setTimeout(() => {
      const el = document.getElementById(
        `rename-input-${id}`
      ) as HTMLInputElement | null
      if (el) {
        el.focus()
        el.select()
      }
    }, 0)
  }

  const submitRename = async () => {
    if (!renameId) return
    await renameChat(renameId, renameValue.trim())
    setRenameId(null)
    setRenameValue('')
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    await deleteChat(deleteId)
    setDeleteId(null)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Chat History</SidebarGroupLabel>

      <SidebarGroupContent className='max-h-[80vh] overflow-y-auto '>
        <SidebarMenu>
          {history.map((chat, index) => {
            const id = chat._id
            const active = currentChatId === id

            return (
              <SidebarMenuItem
                key={id ?? `missing-${index}`}
                className={`group/item relative ${
                  active ? 'bg-muted rounded-md' : ''
                }`}>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => openChat(id)}
                    onDoubleClick={() => {
                      if (!renameId) startRename(id, chat.title)
                    }}
                    className='flex items-center gap-2 w-full text-left select-none'>
                    {renameId === id ? (
                      <div className='rename-wrapper'>
                        <Input
                          id={`rename-input-${id}`}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={submitRename}
                          className='rename-input h-7 text-sm'
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') submitRename()
                            if (e.key === 'Escape') setRenameId(null)
                          }}
                        />
                      </div>
                    ) : (
                      <span className='truncate text-sm'>
                        {chat.title || 'Untitled'}
                      </span>
                    )}
                  </button>
                </SidebarMenuButton>

                <DropdownMenu>
                  {renameId !== id && (
                    <DropdownMenuTrigger className='absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 translate-x-1 group-hover/item:translate-x-0 transition-all duration-200 flex items-center justify-center p-1 rounded-md'>
                      <MoreHorizontal className='size-4' />
                    </DropdownMenuTrigger>
                  )}

                  <DropdownMenuContent side='right' align='start'>
                    <DropdownMenuItem
                      onClick={() => startRename(id, chat.title)}>
                      <Pencil className='mr-2 size-4 text-muted-foreground' />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-destructive'
                      onClick={() => setDeleteId(id)}>
                      <Trash2 className='mr-2 size-4 text-destructive' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-destructive text-white hover:bg-destructive/90'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarGroup>
  )
}
