import type { LawSource, NewsSource, Source } from '@/domain/chat/chat.types'
import { cn } from '@/lib/utils'
import { FileBadge, Newspaper } from 'lucide-react'
import { getLawDocName } from './utils/source-helpers'

type MessageSourcesProps = {
  sources: Source[]
}

export function MessageSources({ sources }: MessageSourcesProps) {
  const hasNewsSources = sources.some(
    (source) => 'title' in source && 'url' in source
  )
  const hasLawSources = sources.some(
    (source) => 'doc_id' in source && 'pdf_url' in source
  )

  return (
    <div className='mt-4 w-full'>
      <div className='mb-2.5 flex items-center gap-2'>
        <span className='flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground'>
          <span className='inline-flex items-center gap-1.5' aria-hidden='true'>
            {hasNewsSources && (
              <span className='inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/30 p-1'>
                <Newspaper className='h-3.5 w-3.5' />
              </span>
            )}
            {hasNewsSources && hasLawSources && (
              <span className='h-4 w-px bg-border/70' />
            )}
            {hasLawSources && (
              <span className='inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/30 p-1'>
                <FileBadge className='h-3.5 w-3.5' />
              </span>
            )}
          </span>
          Sources
        </span>
        <span className='flex h-5 min-w-5 items-center justify-center rounded-full border border-border/50 bg-muted/30 px-1.5 text-[0.625rem] font-semibold text-muted-foreground'>
          {sources.length}
        </span>
      </div>
      <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
        {sources.map((source, idx) => {
          const isNews = 'title' in source && 'url' in source
          const isLaw = 'doc_id' in source && 'pdf_url' in source

          if (isNews) {
            const newsSource = source as NewsSource
            return (
              <a
                key={idx}
                href={newsSource.url}
                target='_blank'
                rel='noopener noreferrer'
                className={cn(
                  'group flex min-w-0 items-center gap-2.5 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-xs transition-all duration-200',
                  'hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
                )}>
                <span className='inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-primary/20 bg-primary/5 px-2 text-[0.625rem] font-bold text-primary'>
                  {idx + 1}
                </span>
                <span className='flex min-w-0 items-center gap-2 font-medium text-foreground'>
                  <span className='truncate'>{newsSource.title}</span>
                </span>
              </a>
            )
          }

          if (isLaw) {
            const lawSource = source as LawSource
            return (
              <a
                key={idx}
                href={lawSource.pdf_url}
                target='_blank'
                rel='noopener noreferrer'
                className={cn(
                  'group flex min-w-0 items-center gap-2.5 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-xs transition-all duration-200',
                  'hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
                )}>
                <span className='inline-flex h-5 min-w-5 items-center justify-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-3.5 text-[0.625rem] font-bold text-primary'>
                  p.{lawSource.page_number}
                </span>
                <span className='min-w-0 truncate font-medium text-foreground'>
                  {getLawDocName(lawSource.doc_id)}
                </span>
              </a>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
