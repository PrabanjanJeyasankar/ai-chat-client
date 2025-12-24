import { Markdown } from '@/components/ui/markdown'
import { Textarea } from '@/components/ui/textarea'
import type { Source } from '@/domain/chat/chat.types'
import { cn } from '@/lib/utils'
import type {
  ComponentPropsWithoutRef,
  JSX as ReactJSX,
  ReactNode,
} from 'react'
import { Children, useMemo } from 'react'
import type { Components } from 'react-markdown'
import { Citation } from './Citation'

type MessageContentProps = {
  content: string
  isUser: boolean
  isEditing: boolean
  editingContent: string
  sources: Source[]
  onEditChange?: (value: string) => void
}

function renderInlineCitations(node: ReactNode, sources: Source[]) {
  return Children.map(node, (child, idx) => {
    if (typeof child !== 'string') return child

    const citationRegex = /\[(\d+)\]/g
    const parts: ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = citationRegex.exec(child)) !== null) {
      const before = child.slice(lastIndex, match.index)
      if (before) parts.push(before)

      const citationNumber = Number.parseInt(match[1], 10)
      if (Number.isFinite(citationNumber) && citationNumber > 0) {
        parts.push(
          <Citation
            key={`c-${idx}-${match.index}`}
            citationNumber={citationNumber}
            sources={sources}
          />
        )
      } else {
        parts.push(match[0])
      }

      lastIndex = match.index + match[0].length
    }

    const rest = child.slice(lastIndex)
    if (rest) parts.push(rest)
    return parts
  })
}

type MarkdownElProps<T extends keyof ReactJSX.IntrinsicElements> =
  ComponentPropsWithoutRef<T> & { node?: unknown }

export function MessageContent({
  content,
  isUser,
  isEditing,
  editingContent,
  sources,
  onEditChange,
}: MessageContentProps) {
  const hasSources = sources.length > 0

  const markdownComponents = useMemo(() => {
    if (!hasSources) return undefined

    const withCitations = (children: ReactNode) =>
      renderInlineCitations(children, sources)

    const components: Partial<Components> = {
      p: ({ children, ...props }: MarkdownElProps<'p'>) => (
        <p {...props}>{withCitations(children)}</p>
      ),
      li: ({ children, ...props }: MarkdownElProps<'li'>) => (
        <li {...props}>{withCitations(children)}</li>
      ),
      blockquote: ({ children, ...props }: MarkdownElProps<'blockquote'>) => (
        <blockquote {...props}>{withCitations(children)}</blockquote>
      ),
      h1: ({ children, ...props }: MarkdownElProps<'h1'>) => (
        <h1 {...props}>{withCitations(children)}</h1>
      ),
      h2: ({ children, ...props }: MarkdownElProps<'h2'>) => (
        <h2 {...props}>{withCitations(children)}</h2>
      ),
      h3: ({ children, ...props }: MarkdownElProps<'h3'>) => (
        <h3 {...props}>{withCitations(children)}</h3>
      ),
      h4: ({ children, ...props }: MarkdownElProps<'h4'>) => (
        <h4 {...props}>{withCitations(children)}</h4>
      ),
      h5: ({ children, ...props }: MarkdownElProps<'h5'>) => (
        <h5 {...props}>{withCitations(children)}</h5>
      ),
      h6: ({ children, ...props }: MarkdownElProps<'h6'>) => (
        <h6 {...props}>{withCitations(children)}</h6>
      ),
      a: ({ children, ...props }: MarkdownElProps<'a'>) => (
        <a
          {...props}
          className={cn(
            'font-medium text-primary underline underline-offset-4',
            'hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}>
          {children}
        </a>
      ),
    }

    return components
  }, [hasSources, sources])

  if (isEditing) {
    return (
      <Textarea
        className='min-w-[240px] bg-transparent shadow-none'
        value={editingContent}
        onChange={(e) => onEditChange?.(e.target.value)}
        rows={3}
      />
    )
  }

  if (isUser) {
    return (
      <p className='whitespace-pre-wrap text-sm leading-relaxed'>{content}</p>
    )
  }

  return (
    <Markdown
      className={cn(
        'prose prose-sm max-w-none leading-relaxed',
        'prose-p:my-2 prose-li:my-1 prose-pre:my-3',
        'prose-a:break-words'
      )}
      components={markdownComponents}>
      {content}
    </Markdown>
  )
}
