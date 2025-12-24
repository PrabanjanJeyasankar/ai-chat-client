export function cleanContent(content: string): string {
  let cleaned = content

  cleaned = cleaned.replace(
    /\[(?:Document|Doc|Source|File):\s*([^\]]+?\.(?:pdf|PDF))\s*(?:,?\s*(?:Page|p\.?|pg\.?):\s*(\d+))?\]/gi,
    ''
  )

  cleaned = cleaned.replace(
    /\[(?:https?:\/\/[^\]]+|[^\]]*?\.(?:pdf|PDF)[^\]]*?)\]/gi,
    ''
  )

  cleaned = cleaned.replace(/\b(?:[\w-]+\/)*[\w-]+\.(?:pdf|PDF)\b/g, '')

  return cleaned.trim()
}
