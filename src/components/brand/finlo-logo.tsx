import Image from 'next/image'
import { cn } from '@/lib/utils'

const LOGO = {
  full: { src: '/finlo_logo.png', width: 640, height: 160, alt: 'Finlo' },
  mark: { src: '/finlo_favicon.png', width: 512, height: 512, alt: '' },
} as const

type FinloLogoProps = {
  variant?: keyof typeof LOGO
  className?: string
  priority?: boolean
}

export function FinloLogo({
  variant = 'full',
  className,
  priority = false,
}: FinloLogoProps) {
  const asset = LOGO[variant]

  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      priority={priority}
      className={cn(
        variant === 'full' ? 'h-8 w-auto max-w-[9.5rem]' : 'size-8 object-contain',
        className,
      )}
    />
  )
}
