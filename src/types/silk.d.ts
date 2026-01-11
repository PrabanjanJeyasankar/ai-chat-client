declare module '@/components/Silk' {
  import type { FC } from 'react'

  export interface SilkProps {
    speed?: number
    scale?: number
    color?: string
    noiseIntensity?: number
    rotation?: number
  }

  const Silk: FC<SilkProps>
  export default Silk
}
