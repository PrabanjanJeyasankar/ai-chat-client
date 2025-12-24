import type { LawSource, NewsSource, Source } from '@/domain/chat/chat.types'

export function getLawDocName(docId: string): string {
  const lastSegment = docId.split('/').pop()
  if (!lastSegment) return docId
  return lastSegment.replace(/\.(pdf)$/i, '')
}

export function getSourceLink(source: Source) {
  const isNewsSource = 'title' in source && 'url' in source
  const isLawSource = 'doc_id' in source && 'pdf_url' in source

  if (isNewsSource) {
    const newsSource = source as NewsSource
    return { href: newsSource.url, title: newsSource.title }
  }

  if (isLawSource) {
    const lawSource = source as LawSource
    return {
      href: lawSource.pdf_url,
      title: `${getLawDocName(lawSource.doc_id)}, p.${lawSource.page_number}`,
    }
  }

  return null
}
