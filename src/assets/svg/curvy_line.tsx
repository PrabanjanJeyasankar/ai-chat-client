import { cn } from '@/lib/utils'

type CurvyLineProps = {
  className?: string
}

export function CurvyLine({ className }: CurvyLineProps) {
  return (
    <svg
      width='843'
      height='903'
      viewBox='0 0 843 903'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      className={cn('text-white/50 dark:text-white/30', className)}>
      <path
        d='M0 259.68C0 259.68 179.5 300.629 223.476 373.141C282.434 470.358 92.9763 514.194 103.886 625.09C114.352 731.47 149.175 806.292 245.823 865.359C315.462 907.919 445.14 929.32 445.14 929.32C445.14 929.32 591.877 947.385 631.168 894.281C668.615 843.668 656.205 791.538 664.387 724.646C678.221 611.548 664.387 433.208 664.387 433.208C664.387 433.208 639.477 306.749 664.387 231.315C687.025 162.765 721.164 131.402 770.689 76.141C793.212 51.0106 848 3.28149 848 3.28149'
        stroke='currentColor'
        strokeOpacity='0.4'
        strokeWidth='8.70622'
      />
    </svg>
  )
}
