import logoImage from '@/assets/images/Trace_Logo.png'
import { cn } from '@/lib/utils'

type LogoProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-6 w-auto',
  md: 'h-8 w-auto',
  lg: 'h-12 w-auto',
}

export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <img
      src={logoImage}
      alt='Logo'
      className={cn(sizeClasses[size], className)}
    />
  )
}
