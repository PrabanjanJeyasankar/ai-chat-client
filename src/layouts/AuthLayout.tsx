import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/components/ui/theme-provider'
import { cn } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'
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
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className={cn('bg-background min-h-svh relative', className)}>
      <Button
        variant='ghost'
        size='icon'
        onClick={toggleTheme}
        className='absolute top-4 left-4'>
        {theme === 'dark' ? (
          <Sun className='h-5 w-5' />
        ) : (
          <Moon className='h-5 w-5' />
        )}
      </Button>

      <div className='grid min-h-svh w-full grid-cols-1 md:grid-cols-2'>
        <div className='flex items-center justify-center px-6 py-10'>
          <div className='w-full max-w-sm'>
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

        <div className='hidden bg-white md:block' />
      </div>
    </div>
  )
}
