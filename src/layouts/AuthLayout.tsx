import { Logo } from '@/components/Logo'
import { FeatureCarousel } from '@/components/common/FeatureCarousel'
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
    <div className={cn('bg-background min-h-svh relative', className)}>
      <div className='grid min-h-svh w-full grid-cols-1 md:grid-cols-[55%_45%]'>
        <div className='hidden items-center justify-center md:flex'>
          <div className='h-full w-full p-3'>
            <FeatureCarousel />
          </div>
        </div>

        <div className='flex items-center justify-center px-6 py-10'>
          <div className='w-full max-w-xs'>
            <div className='mb-6 text-center'>
              <a href='/' className='mb-6 inline-flex items-center gap-2'>
                <div className='flex size-8 items-center justify-center rounded-md'>
                  <Logo />
                </div>
              </a>
              <h1 className='text-2xl font-bold'>{title}</h1>
              <div className='mt-2 text-sm text-muted-foreground'>
                {description}
              </div>
            </div>
            <div className='overflow-visible'>{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
