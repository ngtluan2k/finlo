import { getTranslations } from 'next-intl/server'
import { FinloLogo } from '@/components/brand/finlo-logo'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { AuthBrandPanel } from '@/components/auth/auth-brand-panel'

export async function AuthShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('auth.shell')

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-y-auto overflow-x-hidden">
      {/* Background Layer */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#001a2e_0%,#002b45_25%,#003f66_50%,#015c97_75%,#2d82b9_100%)] dark:bg-[linear-gradient(135deg,#000d1a_0%,#001a2e_30%,#002b45_60%,#003f66_100%)]" />

        {/* Floating orbs */}
        <div className="auth-orb auth-orb-1 absolute -left-32 top-1/4 size-112 rounded-full bg-[#54a4d7]/20 blur-[100px]" />
        <div className="auth-orb auth-orb-2 absolute -right-24 top-0 size-128 rounded-full bg-[#2d82b9]/15 blur-[110px]" />
        <div className="auth-orb auth-orb-3 absolute bottom-0 left-1/3 size-96 rounded-full bg-[#c0e8fb]/10 blur-[90px]" />

        {/* Floating particles */}
        <div className="auth-particle auth-particle-1" />
        <div className="auth-particle auth-particle-2" />
        <div className="auth-particle auth-particle-3" />
        <div className="auth-particle auth-particle-4" />

        {/* Grid pattern */}
        <div className="auth-grid absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_60%_at_50%_40%,#000_40%,transparent)]" />

        {/* Top glow */}
        <div className="auth-top-glow absolute inset-0 bg-[radial-gradient(ellipse_at_top,#54a4d714,transparent_55%)]" />

        {/* Shimmer beam */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="auth-shimmer-beam" />
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#001a2e80_75%)]" />
      </div>

      {/* Top-right controls */}
      <div className="auth-chrome-enter absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
        <ThemeSwitcher />
        <LocaleSwitcher />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen w-full flex-col lg:flex-row">
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
