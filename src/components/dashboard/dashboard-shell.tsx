'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardShellCorner } from '@/components/dashboard/dashboard-shell-corner'
import { DashboardSidebarToggle } from '@/components/dashboard/dashboard-sidebar-toggle'
import { cn } from '@/lib/utils'

type DashboardShellProps = {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    permissions?: string[]
    isSuperAdmin?: boolean
  }
  children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-dvh overflow-hidden bg-[linear-gradient(135deg,#002b45_0%,#003f66_45%,#015c97_100%)] dark:bg-[linear-gradient(135deg,#020810_0%,#06111d_45%,#0f1c2b_100%)]">
      <DashboardSidebar open={sidebarOpen} user={user} />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-[#002b45]/60 lg:hidden dark:bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-visible">
        <div className="relative shrink-0 overflow-visible">
          <DashboardHeader 
            user={user} 
            sidebarOpen={sidebarOpen} 
            onToggleSidebar={() => setSidebarOpen((value) => !value)} 
          />
        </div>

        <main
          className={cn(
            'flex-1 overflow-y-auto p-4 sm:p-6',
            'bg-[#f5f9fc] dark:bg-[#08131f]',
            'rounded-tl-[2rem] border-t border-l border-white/20 dark:border-[#1E293B]',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
