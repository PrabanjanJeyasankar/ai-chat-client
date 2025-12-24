import { useChatStore } from '@/domain/chat/chat.store'
import { useLatestProgressDetails } from '@/hooks/use-latest-progress'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { ShimmerLoaderText } from '../ShimmerTextLoader'
import { Loader } from '../ui/loader'

export function ChatProgressIndicator() {
  const { assistantTypingMode, streamingMessageId } = useChatStore()
  const latestProgress = useLatestProgressDetails()

  const hasProgressDisplay =
    assistantTypingMode === 'news' || assistantTypingMode === 'law'
  const isStreaming = !!streamingMessageId

  const progressText = useMemo(() => {
    if (!hasProgressDisplay || !latestProgress) return null

    const substage =
      typeof latestProgress.substage === 'object' &&
      latestProgress.substage !== null
        ? (latestProgress.substage as Record<string, unknown>)
        : null

    const substageMessage =
      typeof substage?.message === 'string' ? substage.message.trim() : null

    const directTitle =
      typeof latestProgress.title === 'string'
        ? latestProgress.title.trim()
        : null

    const stageLabel =
      typeof latestProgress.stage === 'string'
        ? latestProgress.stage.replace(/_/g, ' ')
        : null

    const fallback = stageLabel ? `Working on ${stageLabel}...` : null

    return substageMessage || directTitle || fallback
  }, [hasProgressDisplay, latestProgress])

  if (isStreaming) {
    return null
  }

  if (hasProgressDisplay) {
    if (!progressText) {
      return <Loader variant='typing' size='md' />
    }

    return (
      <AnimatePresence mode='wait'>
        <motion.div
          key={`${latestProgress?.stage}-${latestProgress?.substage}-${latestProgress?.timestamp}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.35 }}>
          <ShimmerLoaderText text={progressText} />
        </motion.div>
      </AnimatePresence>
    )
  }

  return <Loader variant='typing' size='md' />
}
