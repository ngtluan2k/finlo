import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type AuthCardProps = {
  icon: LucideIcon
  title: string
  subtitle: string
  accent?: 'emerald' | 'cyan'
  children: React.ReactNode
}

const accentStyles = {
  emerald: {
    ring: 'from-emerald-400/30 to-cyan-400/20',
    icon: 'from-emerald-400 to-emerald-500',
    glow: 'shadow-emerald-500/20',
  },
  cyan: {
    ring: 'from-cyan-400/30 to-violet-400/20',
    icon: 'from-cyan-400 to-violet-500',
    glow: 'shadow-cyan-500/20',
  },
} as const

export function AuthCard({
  icon: Icon,
  title,
  subtitle,
  accent = 'emerald',
  children,
}: AuthCardProps) {
  const styles = accentStyles[accent]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl',
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-linear-to-br before:from-white/8 before:to-transparent',
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-linear-to-br opacity-60 blur-3xl',
          styles.ring,
        )}
        aria-hidden
      />

      <div className="relative mb-8 space-y-4 text-center">
        <div className="relative mx-auto w-fit">
          <div
            className={cn(
              'absolute inset-0 rounded-2xl bg-linear-to-br opacity-40 blur-xl',
              styles.icon,
            )}
            aria-hidden
          />
          <div
            className={cn(
              'relative flex size-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg',
              styles.icon,
              styles.glow,
            )}
          >
            <Icon className="size-7 text-zinc-950" aria-hidden />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          <p className="mt-1.5 text-sm text-zinc-400">{subtitle}</p>
        </div>
      </div>

      <div className="relative">{children}</div>
    </div>
  )
}
