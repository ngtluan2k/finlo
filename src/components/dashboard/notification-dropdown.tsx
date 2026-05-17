'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowDown,
  ArrowRightLeft,
  Bell,
  CheckCheck,
  Clock,
  Landmark,
  Megaphone,
  PieChart,
  Settings,
  ShieldCheck,
  Trash2,
  Wallet,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

type Notification = {
  id: string
  type: 'SYSTEM' | 'TRANSACTION' | 'BUDGET' | 'WALLET' | 'SECURITY' | 'REMINDER'
  status: 'UNREAD' | 'READ' | 'ARCHIVED'
  title: string
  message: string
  createdAt: string
  readAt: string | null
}

export function NotificationDropdown() {
  const t = useTranslations('notifications')
  const locale = useLocale()
  const menuId = useId()

  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const rootRef = useRef<HTMLDivElement>(null)

  // Relative time helper
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    
    // Fallback if time is slightly in the future due to server/client mismatch
    if (diffMs < 0) {
      return locale === 'vi' ? 'Vừa xong' : 'Just now'
    }

    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (locale === 'vi') {
      if (diffMins < 1) return 'Vừa xong'
      if (diffMins < 60) return `${diffMins} phút trước`
      if (diffHours < 24) return `${diffHours} giờ trước`
      if (diffDays === 1) return 'Hôm qua'
      return `${diffDays} ngày trước`
    } else {
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays === 1) return 'Yesterday'
      return `${diffDays}d ago`
    }
  }

  // Fetch notifications
  const fetchNotifications = async (showLoading = false) => {
    if (showLoading) setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = (await res.json()) as { notifications: Notification[]; unreadCount: number }
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Initialize and Poll
  useEffect(() => {
    void fetchNotifications(true)

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      void fetchNotifications(false)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Close dropdown on click outside or escape key
  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Mark specific notification as read
  const handleMarkAsRead = async (id: string, status: string) => {
    if (status === 'READ') return // Already read

    // Optimistic Update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      void fetchNotifications(false) // Rollback if error
    }
  }

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return

    // Optimistic Update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: 'READ' as const, readAt: new Date().toISOString() }))
    )
    setUnreadCount(0)

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      void fetchNotifications(false) // Rollback if error
    }
  }

  // Soft-delete specific notification
  const handleDeleteNotification = async (e: React.MouseEvent, id: string, wasUnread: boolean) => {
    e.stopPropagation() // Prevent triggering mark as read

    // Optimistic Update
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
      void fetchNotifications(false) // Rollback if error
    }
  }

  // Icon mapping helper
  const getNotificationIcon = (type: Notification['type'], title?: string) => {
    switch (type) {
      case 'SYSTEM':
        return {
          icon: Landmark,
          colorClass: 'text-purple-500 bg-purple-500/10 dark:text-purple-400 dark:bg-purple-500/20',
        }
      case 'TRANSACTION':
        // Try to guess based on title for mockup fidelity
        if (title?.toLowerCase().includes('chi tiêu')) {
           return {
             icon: ArrowRightLeft,
             colorClass: 'text-rose-500 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/20',
           }
        }
        return {
          icon: ArrowDown,
          colorClass: 'text-emerald-500 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20',
        }
      case 'BUDGET':
        return {
          icon: PieChart,
          colorClass: 'text-amber-500 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20',
        }
      case 'WALLET':
        return {
          icon: Wallet,
          colorClass: 'text-purple-500 bg-purple-500/10 dark:text-purple-400 dark:bg-purple-500/20',
        }
      case 'SECURITY':
        return {
          icon: ShieldCheck,
          colorClass: 'text-blue-500 bg-blue-500/10 dark:text-blue-400 dark:bg-blue-500/20',
        }
      case 'REMINDER':
        return {
          icon: Clock,
          colorClass: 'text-amber-500 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20',
        }
    }
  }

  // Use all notifications for dropdown (filters removed)
  const filteredNotifications = notifications

  return (
    <div ref={rootRef} className="relative">
      {/* Bell Button */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setOpen((prev) => !prev)
          if (!open) {
            void fetchNotifications(false) // refresh on open
          }
        }}
        className={cn(
          'relative flex size-9 items-center justify-center rounded-full border border-white/20 text-white transition duration-200 outline-hidden',
          'hover:bg-white/10 active:scale-95 cursor-pointer',
          'dark:border-[#1E293B] dark:hover:bg-[#102A43]'
        )}
        title={t('title')}
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#DC2626] text-[9px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Container */}
      <div
        id={menuId}
        role="menu"
        className={cn(
          'absolute right-0 z-50 mt-2.5 w-80 sm:w-[420px] overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/95 shadow-2xl backdrop-blur-md transition-all duration-300 ease-out transform origin-top-right',
          'dark:border-slate-700/50 dark:bg-[#0f1c2b]/95',
          open
            ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto visible'
            : 'scale-95 opacity-0 -translate-y-2 pointer-events-none invisible'
        )}
      >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-slate-800/50">
            <h3 className="text-[16px] font-bold text-zinc-900 dark:text-zinc-50">{t('title')}</h3>
            <div className="flex items-center gap-4">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[13px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition cursor-pointer"
                >
                  {t('markAllRead')}
                </button>
              )}
              <button
                type="button"
                className="text-zinc-400 hover:text-zinc-600 dark:text-slate-500 transition cursor-pointer"
                title={t('settings') || 'Settings'}
              >
                <Settings className="size-4.5" />
              </button>
            </div>
          </div>

          {/* List Area */}
          <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-slate-800">
            {loading ? (
              /* Loading State */
              <div className="flex flex-col gap-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="size-10 rounded-full bg-zinc-100 dark:bg-slate-800 shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3.5 w-1/2 rounded bg-zinc-100 dark:bg-slate-800" />
                      <div className="h-2.5 w-full rounded bg-zinc-100 dark:bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              /* Notifications List */
              <div className="divide-y divide-zinc-100 dark:divide-slate-800/40">
                {filteredNotifications.map((n) => {
                  const { icon: Icon, colorClass } = getNotificationIcon(n.type, n.title)
                  const isUnread = n.status === 'UNREAD'

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id, n.status)}
                      className={cn(
                        'group relative flex items-start gap-4 p-4 transition-all duration-200 ease-out cursor-pointer select-none',
                        'hover:bg-zinc-50/80 dark:hover:bg-slate-800/40'
                      )}
                    >
                      {/* Left Icon Badge */}
                      <div
                        className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-full',
                          colorClass
                        )}
                      >
                        <Icon className="size-5" />
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0 pr-12">
                        <h4 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-50 truncate">
                          {n.title}
                        </h4>
                        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500 dark:text-slate-400 break-words line-clamp-2">
                          {n.message}
                        </p>
                      </div>

                      {/* Right Control Actions */}
                      <div className="absolute right-4 top-4 flex flex-col items-end gap-2.5">
                        <span className="text-[11px] text-zinc-400 dark:text-slate-500">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                        {/* Unread Dot Indicator */}
                        {isUnread && (
                          <span className="size-2 rounded-full bg-blue-600 shadow-xs shrink-0" />
                        )}
                      </div>
                      
                      {/* Delete Button on Hover */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNotification(e, n.id, isUnread)}
                        className={cn(
                          'absolute right-4 bottom-4 rounded p-1 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer',
                          'dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-red-400'
                        )}
                        title={t('clear')}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-slate-900 text-zinc-300 dark:text-slate-700 mb-3 border border-zinc-150/40 dark:border-slate-800/40 shadow-xs">
                  <Bell className="size-6" />
                </div>
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{t('emptyState')}</h4>
                <p className="mt-1 text-xs text-zinc-400 dark:text-slate-500 max-w-[200px]">
                  {t('noNotifications')}
                </p>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="border-t border-zinc-100 dark:border-slate-800/50 p-4 text-center bg-white dark:bg-slate-900 rounded-b-2xl">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-[14px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              {t('viewAll')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>
        </div>
    </div>
  )
}
