import { BarChart3, PiggyBank, ShieldCheck, Wallet } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { FinloLogo } from '@/components/brand/finlo-logo'

const featureIcons = [Wallet, BarChart3, PiggyBank] as const
const featureRevealDelays = [
  'auth-reveal-delay-2',
  'auth-reveal-delay-3',
  'auth-reveal-delay-4',
] as const

export async function AuthBrandPanel({
  tagline,
  features,
}: {
  tagline: string
  features: string[]
}) {
  const t = await getTranslations('auth.shell')
  const descriptions = t.raw('featureDescriptions') as string[]

  return (
    <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-white/8 p-10 lg:flex xl:p-14">
      <header>
        <div className="auth-reveal">
          <FinloLogo variant="full" className="h-9 max-w-none brightness-0 invert" priority />
        </div>
        <p className="auth-reveal auth-reveal-delay-1 mt-8 max-w-sm text-lg leading-relaxed text-white/70">
          {tagline}
        </p>
      </header>

      <ul className="mt-12 space-y-5">
        {features.map((text, i) => {
          const Icon = featureIcons[i] ?? Wallet
          const delayClass = featureRevealDelays[i] ?? featureRevealDelays[2]
          const description = descriptions[i]
          return (
            <li key={text} className={`auth-reveal ${delayClass} flex items-start gap-4`}>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/8 backdrop-blur-sm transition-colors duration-300 hover:border-[#54a4d7]/40 hover:bg-[#54a4d7]/15">
                <Icon className="size-5 text-[#8bc8f6]" aria-hidden />
              </span>
              <div>
                <span className="text-sm font-medium text-white/90">{text}</span>
                {description && (
                  <p className="mt-0.5 text-xs text-white/45">{description}</p>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {/* Decorative chart */}
      <figure
        className="auth-chart-glow pointer-events-none absolute -bottom-8 -right-8 opacity-40"
        aria-hidden
      >
        <svg viewBox="0 0 200 120" className="h-40 w-64" fill="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#54a4d7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#54a4d7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className="auth-chart-fill"
            d="M0 90 Q40 70 80 75 T160 50 T200 30 L200 120 L0 120 Z"
            fill="url(#chartGrad)"
          />
          <path
            className="auth-chart-line"
            d="M0 90 Q40 70 80 75 T160 50 T200 30"
            stroke="#54a4d7"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </figure>

      <footer className="auth-reveal auth-reveal-delay-5 relative mt-auto space-y-4">
        {/* Brand card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-widest text-[#8bc8f6]/90">
            Finlo
          </p>
          <p className="mt-1 text-sm text-white/40">
            © {new Date().getUTCFullYear()} Finlo. All rights reserved.
          </p>
        </div>

        {/* SSL badge */}
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck className="size-4 text-[#54a4d7]" aria-hidden />
          <span className="text-xs text-white/40">{t('ssl')}</span>
        </div>
      </footer>
    </aside>
  )
}
