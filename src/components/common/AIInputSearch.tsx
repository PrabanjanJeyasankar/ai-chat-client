import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Newspaper, Paperclip, Send, Zap } from 'lucide-react'
import { Fragment, useMemo } from 'react'

export function AIInputSearch() {
  const placeholder = 'Summarize key insights from these files.'
  const suggestions = useMemo(
    () => [
      {
        label: 'Does this document conflict with any other uploaded document?',
        size: 'text-sm',
      },
      {
        label: 'List all obligations, responsibilities, or duties mentioned',
        size: 'text-sm',
      },
      {
        label: 'Are there any expiry dates?',
        size: 'text-sm',
      },
      {
        label: 'Which sections mention penalties, risks, or liabilities?',
        size: 'text-sm',
      },

      {
        label:
          'What does this document say about termination or exit conditions?',
        size: 'text-sm',
      },
    ],
    []
  )

  const visibleSuggestions = useMemo(
    () => suggestions.slice(0, 3),
    [suggestions]
  )

  return (
    <div className='w-full py-6 scale-[1] sm:py-8 sm:scale-[1.25] md:scale-[1.4] lg:scale-[1.55] xl:scale-[1.8]'>
      <div className='relative w-full max-w-[80rem] mx-auto p-1'>
        <div
          role='textbox'
          tabIndex={0}
          className={cn(
            'relative flex w-full cursor-text flex-col overflow-hidden text-left transition-all duration-300',
            'rounded-[30px] border border-white/35 bg-white/6 backdrop-blur-[26px] ring-1 ring-white/30',
            'shadow-[0_18px_50px_rgba(15,23,42,0.22),inset_0_0.5px_0_rgba(255,255,255,0.45)]',
            'before:pointer-events-none before:absolute before:inset-0 before:rounded-[30px] before:border before:border-white/30',
            'before:bg-[radial-gradient(60%_80%_at_15%_0%,rgba(255,255,255,0.55),transparent_65%)]',
            'after:pointer-events-none after:absolute after:inset-[1px] after:rounded-[28px]',
            'after:bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0.06)_35%,transparent_70%)]',
            'before:mask-[linear-gradient(120deg,transparent,rgba(255,255,255,0.9),transparent)]',
            'after:[mask-image:radial-gradient(70%_60%_at_20%_0%,rgba(255,255,255,0.9),transparent)]',
            'dark:border-white/12 dark:bg-black/25 dark:ring-white/18',
            'dark:before:border-white/18 dark:before:bg-[radial-gradient(60%_80%_at_15%_0%,rgba(255,255,255,0.28),transparent_65%)]',
            'dark:after:bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04)_35%,transparent_70%)]',
            'border-orange-200/20 ring-orange-200/10'
          )}
          aria-hidden='true'>
          <div className='relative z-10 max-h-[200px] overflow-y-auto border-none rounded-2xl'>
            <Textarea
              id='ai-input-04'
              value=''
              placeholder={placeholder}
              readOnly
              tabIndex={-1}
              className='pointer-events-none w-full resize-none border-none bg-transparent px-5 py-4 text-lg leading-relaxed text-foreground/90 placeholder:text-black/40 focus-visible:ring-0'
            />
          </div>
          <div className='relative z-10 flex h-14 items-center justify-between px-4'>
            <div className='flex items-center gap-1.5'>
              <button
                className={cn(
                  'relative flex h-8 items-center gap-2 overflow-hidden rounded-full border border-white/35 px-3 text-xs font-semibold text-white',
                  'bg-orange-500/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-sm'
                )}>
                <span className='pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent_60%)] opacity-80' />
                <Zap className='relative z-10 h-3.5 w-3.5' />
                <span className='relative z-10'>Trace mode</span>
              </button>
              <button
                className={cn(
                  'relative flex h-8 items-center gap-2 overflow-hidden rounded-full border border-white/30 px-3 text-xs font-semibold text-white/80',
                  'bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm'
                )}>
                <span className='pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_60%)] opacity-60' />
                <Newspaper className='relative z-10 h-3.5 w-3.5' />
                <span className='relative z-10'>News mode</span>
              </button>
            </div>

            <div className='flex items-center gap-2'>
              <label className='cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/25 hover:text-orange-500'>
                <input type='file' className='hidden' />
                <Paperclip className='h-4.5 w-4.5' />
              </label>
              <button
                type='button'
                className={cn(
                  'rounded-full p-2.5 shadow-sm transition-all',
                  'bg-orange-500 text-white shadow-orange-500/25'
                )}>
                <Send className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>
        <div className='mt-3'>
          {/* <div className='mb-2 ml-2 flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-muted-white'>
            <span className='relative flex h-2 w-2'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400/80' />
              <span className='relative inline-flex h-2 w-2 rounded-full bg-orange-400' />
            </span>
            Live suggestions
          </div> */}
          <div className='ml-2 flex flex-wrap gap-1 sm:ml-4'>
            {visibleSuggestions.map((item, index) => (
              <Fragment key={item.label}>
                <div
                  className={cn(
                    'group/reflect relative inline-flex rounded-3xl border border-white/20 bg-white/4 px-4 py-3 text-black/65',
                    index < 2 && 'w-full sm:w-[calc(50%-0.25rem)]',
                    'backdrop-blur-xl transition',
                    'shadow-[0_10px_30px_rgba(15,23,42,0.12),inset_0_0.5px_0_rgba(255,255,255,0.5)]',
                    'dark:border-white/12 dark:bg-white/6',
                    'overflow-hidden',
                    item.size
                  )}>
                  <span className='pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.45),transparent)] opacity-50' />
                  <div className='flex items-center gap-3'>
                    <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-orange-500 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.6)]'>
                      <Zap className='h-4 w-4' />
                    </span>
                    <span className='text-sm  tracking-tight'>
                      {item.label}
                    </span>
                  </div>
                </div>
                {index === 1 && (
                  <span className='basis-full' aria-hidden='true' />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
