import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type AuthCardProps = {
  icon: LucideIcon
  title: string
  subtitle: string
  accent?: 'emerald' | 'cyan'
  children: React.ReactNode
}

export function AuthCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/12 bg-white/8 p-6 sm:p-8 shadow-2xl backdrop-blur-xl',
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-linear-to-br before:from-white/10 before:to-transparent',
      )}
    >
      {/* Decorative glow in corner */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,#54a4d730_0%,#2d82b920_40%,transparent_70%)] blur-2xl"
        aria-hidden
      />

      {/* Header section — horizontal layout for compactness */}
      <div className="relative mb-6 flex items-center gap-4">
        {/* Icon */}
        <div className="relative shrink-0">
          <div
            className="absolute inset-0 rounded-xl bg-[linear-gradient(135deg,#015c97,#2d82b9)] opacity-40 blur-lg"
            aria-hidden
          />
          <div className="relative flex size-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#015c97,#2d82b9)] shadow-md shadow-[#015c97]/25">
            <Icon className="size-5.5 text-white" aria-hidden />
          </div>
        </div>
        {/* Title + subtitle */}
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
          <p className="mt-0.5 text-sm text-white/50">{subtitle}</p>
        </div>
      </div>

      <div className="relative">{children}</div>
    </div>
  )
}
