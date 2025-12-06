// src/layouts/AuthLayout.tsx

import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

export type AuthLayoutProps = {
  title: string
  description: ReactNode
  children: ReactNode
  className?: string
}

export function AuthLayout({
  title,
  description,
  children,
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'bg-background min-h-svh flex items-center justify-center p-6',
        className
      )}>
      <div className='w-full max-w-sm flex flex-col'>
        <div className='flex flex-col items-center text-center mb-6 gap-2'>
          <a href='#' className='flex flex-col items-center gap-2 font-medium'>
            <div className='flex size-8 items-center justify-center rounded-md'>
              <Logo />
            </div>
            <span className='sr-only'>AI Chat.</span>
          </a>

          <h1 className='text-xl font-bold'>{title}</h1>
          <div className='text-sm text-muted-foreground'>{description}</div>
        </div>

        <div className='flex-1 overflow-visible'>{children}</div>
      </div>
    </div>
  )
}
