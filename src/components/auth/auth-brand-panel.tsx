import { BarChart3, PiggyBank, Wallet } from 'lucide-react'
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
  return (
    <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-white/5 p-10 lg:flex xl:p-14">
      <header>
        <div className="auth-reveal">
          <FinloLogo variant="full" className="h-9 max-w-none" priority />
        </div>
        <p className="auth-reveal auth-reveal-delay-1 mt-8 max-w-sm text-lg leading-relaxed text-zinc-400">
          {tagline}
        </p>
      </header>

      <ul className="mt-12 space-y-5">
        {features.map((text, i) => {
          const Icon = featureIcons[i] ?? Wallet
          const delayClass = featureRevealDelays[i] ?? featureRevealDelays[2]
          return (
            <li key={text} className={`auth-reveal ${delayClass} flex items-center gap-4`}>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors duration-300 hover:border-emerald-400/30 hover:bg-emerald-400/10">
                <Icon className="size-5 text-emerald-400" aria-hidden />
              </span>
              <span className="text-sm text-zinc-300">{text}</span>
            </li>
          )
        })}
      </ul>

      <figure
        className="auth-chart-glow pointer-events-none absolute -bottom-8 -right-8 opacity-40"
        aria-hidden
      >
        <svg viewBox="0 0 200 120" className="h-40 w-64" fill="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
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
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </figure>

      <footer className="auth-reveal auth-reveal-delay-5 relative mt-auto rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <p className="text-xs font-medium uppercase tracking-widest text-emerald-400/90">
          Finlo
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          © {new Date().getUTCFullYear()}
        </p>
      </footer>
    </aside>
  )
}


