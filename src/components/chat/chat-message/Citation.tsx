import type { Source } from '@/domain/chat/chat.types'
import { cn } from '@/lib/utils'
import { getSourceLink } from './utils/source-helpers'

type CitationProps = {
  citationNumber: number
  sources: Source[]
  className?: string
}

export function Citation({
  citationNumber,
  sources,
  className,
}: CitationProps) {
  const source = sources[citationNumber - 1]
  const link = source ? getSourceLink(source) : null
  const label = `Source ${citationNumber}`

  return (
    <span className={cn('inline-flex align-baseline', className)}>
      {link ? (
        <a
          href={link.href}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={label}
          title={link.title}
          className={cn(
            'ml-0.5 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-md border border-primary/20 bg-primary/5 px-1 text-[0.625rem] font-semibold leading-none text-primary no-underline transition-all duration-200',
            'hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
          )}>
          {citationNumber}
        </a>
      ) : (
        <span
          aria-label={label}
          className='ml-0.5 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-md border border-border/50 bg-muted/30 px-1 text-[0.625rem] font-medium leading-none text-muted-foreground'>
          {citationNumber}
        </span>
      )}
    </span>
  )
}
