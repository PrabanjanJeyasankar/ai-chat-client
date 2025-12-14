'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

type ShimmerLoaderTextProps = {
  text: string
  className?: string
}

export function ShimmerLoaderText({ text, className }: ShimmerLoaderTextProps) {
  return (
    <motion.p
      className={cn(
        'text-sm font-medium bg-size-[600%_100%] bg-clip-text text-transparent',
        'bg-linear-to-r from-white via-black to-white',
        className
      )}
      animate={{
        backgroundPosition: ['100% center', '0% center'],
      }}
      transition={{
        duration: 1.5,
        ease: 'linear',
        repeat: Infinity,
      }}>
      {text}
    </motion.p>
  )
}
