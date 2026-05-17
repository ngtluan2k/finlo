'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardShellCorner } from '@/components/dashboard/dashboard-shell-corner'
import { DashboardSidebarToggle } from '@/components/dashboard/dashboard-sidebar-toggle'
import { cn } from '@/lib/utils'

type DashboardShellProps = {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-dvh overflow-hidden bg-zinc-100 dark:bg-zinc-900">
      <DashboardSidebar open={sidebarOpen} />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-visible">
        <div className="relative shrink-0 overflow-visible">
          <DashboardShellCorner />
          <DashboardSidebarToggle
            open={sidebarOpen}
            onToggle={() => setSidebarOpen((value) => !value)}
            className="absolute bottom-0 left-0 z-50 -translate-x-1/2 translate-y-1/2"
          />
          <DashboardHeader user={user} />
        </div>

        <main
          className={cn(
            'flex-1 overflow-y-auto bg-zinc-50 p-4 sm:p-6',
            'dark:bg-zinc-950',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
