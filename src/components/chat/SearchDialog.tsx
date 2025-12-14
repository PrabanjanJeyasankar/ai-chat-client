import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { SearchResultItem } from '@/domain/search/search.client'
import { debounce } from '@/utils/debounce'
import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type SearchDialogProps = {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => Promise<SearchResultItem[]>
}

export function SearchDialog({ isOpen, onClose, onSearch }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const performSearch = useCallback(
    debounce(async (value: string) => {
      if (!value.trim()) {
        setSearchResults([])
        return
      }
      setIsLoading(true)
      try {
        const results = await onSearch(value)
        setSearchResults(results)
      } finally {
        setIsLoading(false)
      }
    }, 250),
    []
  )

  useEffect(() => {
    performSearch(searchQuery)
  }, [searchQuery, performSearch])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 30)
    }
  }, [isOpen])

  const highlight = (text: string | undefined | null) => {
    if (!text) return text
    if (!searchQuery) return text
    const pattern = new RegExp(`(${searchQuery})`, 'gi')
    return text.split(pattern).map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark
          key={`${i}-${part}`}
          className='bg-yellow-300 text-black rounded px-0.5'>
          {part}
        </mark>
      ) : (
        <span key={`${i}-${part}`}>{part}</span>
      )
    )
  }

  const handleSelect = (item: SearchResultItem) => {
    onClose()

    const chatId =
      item.chatId && typeof item.chatId === 'object'
        ? item.chatId._id
        : typeof item.chatId === 'string'
        ? item.chatId
        : null

    if (chatId) {
      if (chatId && location.pathname === `/chat/${chatId}`) {
        window.dispatchEvent(
          new CustomEvent('scroll-to-message', {
            detail: { messageId: item._id },
          })
        )
      } else {
        navigate(`/chat/${chatId}?msgId=${item._id}`)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='p-0 w-[95vw] max-w-xl sm:max-w-2xl rounded-lg overflow-hidden shadow-2xl top-[10%] translate-y-0 sm:top-[20%]'>
        <DialogHeader className='px-4 pt-4 pb-2'>
          <DialogTitle className='text-lg font-semibold'>Search</DialogTitle>
          <DialogDescription id='search-desc'>
            Find messages across all your chats
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className='px-4 pb-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  ref={inputRef}
                  placeholder='Search messages...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10 h-11 rounded-lg'
                />
              </div>

              <div className='mt-3 h-[360px] overflow-y-auto space-y-2 pr-1'>
                {isLoading && (
                  <div className='space-y-2'>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className='w-full border rounded-lg p-3 space-y-2'>
                        <Skeleton className='h-4 w-3/4' />
                        <Skeleton className='h-3 w-1/4' />
                      </div>
                    ))}
                  </div>
                )}
                {!isLoading &&
                  searchResults.map((item) => {
                    const version = item.versions?.[item.currentVersionIndex]
                    const content = version?.content ?? ''
                    const chatTitle =
                      typeof item.chatId === 'object'
                        ? item.chatId?.title ?? ''
                        : 'No chat'

                    return (
                      <Button
                        key={item._id}
                        variant='ghost'
                        onClick={() => handleSelect(item)}
                        className='w-full justify-start h-auto py-3 px-3 border rounded-lg bg-background hover:bg-muted text-left flex flex-col items-start whitespace-normal'>
                        <div className='mb-2'>
                          <Badge
                            variant='outline'
                            className='text-xs font-normal bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors'>
                            {chatTitle}
                          </Badge>
                        </div>
                        <div className='text-sm font-medium leading-snug w-full'>
                          {highlight(content)}
                        </div>
                      </Button>
                    )
                  })}

                {searchQuery && searchResults.length === 0 && (
                  <div className='text-sm text-muted-foreground text-center py-4'>
                    No results found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
