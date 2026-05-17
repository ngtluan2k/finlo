import { getTranslations } from 'next-intl/server'
import { FinloLogo } from '@/components/brand/finlo-logo'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { AuthBrandPanel } from '@/components/auth/auth-brand-panel'

export async function AuthShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('auth.shell')

  return (
    <div className="relative flex min-h-full flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[#030712]" aria-hidden>
        <div className="auth-aurora" />
        <div className="auth-orb auth-orb-1 absolute -left-32 top-1/4 size-112 rounded-full bg-emerald-500/25 blur-[100px]" />
        <div className="auth-orb auth-orb-2 absolute -right-24 top-0 size-128 rounded-full bg-cyan-500/20 blur-[110px]" />
        <div className="auth-orb auth-orb-3 absolute bottom-0 left-1/3 size-96 rounded-full bg-violet-500/15 blur-[90px]" />
        <div className="auth-particle auth-particle-1" />
        <div className="auth-particle auth-particle-2" />
        <div className="auth-particle auth-particle-3" />
        <div className="auth-particle auth-particle-4" />
        <div className="auth-grid absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_60%_at_50%_40%,#000_40%,transparent)]" />
        <div className="auth-top-glow absolute inset-0 bg-[radial-gradient(ellipse_at_top,#10b98118,transparent_55%)]" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="auth-shimmer-beam" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#030712_75%)]" />
      </div>

      <div className="auth-chrome-enter absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
        <ThemeSwitcher variant="glass" />
        <LocaleSwitcher variant="glass" />
      </div>

      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        <AuthBrandPanel tagline={t('tagline')} features={t.raw('features') as string[]} />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-8 lg:py-12">
          <div className="auth-reveal mb-8 lg:hidden">
            <FinloLogo variant="full" className="h-9" priority />
          </div>
          <div className="auth-content-enter w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}
