'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
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
  Search,
  Settings,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  FileText,
  Send,
  Trash2,
  Wallet
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Pagination } from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'

// Types
type Notification = {
  id: string
  type: 'SYSTEM' | 'TRANSACTION' | 'BUDGET' | 'WALLET' | 'SECURITY' | 'REMINDER'
  status: 'UNREAD' | 'READ' | 'ARCHIVED'
  title: string
  message: string
  createdAt: string
  readAt: string | null
  data?: any
}

type Summary = {
  all: number
  unread: number
  transaction: number
  budget: number
  system: number
  promotion: number
}

type TabKey = 'all' | 'unread' | 'TRANSACTION' | 'BUDGET' | 'SYSTEM' | 'REMINDER'

export function NotificationsClient({
  initialNotifications,
  initialSummary,
  initialTotalCount,
  limit,
}: {
  initialNotifications: Notification[]
  initialSummary: Summary
  initialTotalCount: number
  limit: number
}) {
  const t = useTranslations('notifications')
  const locale = useLocale()

  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [summary, setSummary] = useState<Summary>(initialSummary)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const isFirstRender = useRef(true)

  const fetchNotifications = async (currentPage: number, currentTab: TabKey) => {
    setLoading(true)
    try {
      const url = new URL('/api/notifications', window.location.origin)
      url.searchParams.set('page', currentPage.toString())
      url.searchParams.set('limit', limit.toString())
      if (currentTab === 'unread') {
        url.searchParams.set('status', 'UNREAD')
      } else if (currentTab !== 'all') {
        url.searchParams.set('type', currentTab)
      }

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setSummary(data.summary)
        setTotalCount(data.pagination.totalCount)
        setSelectedId(null) // Reset selection when changing pages/tabs
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    void fetchNotifications(page, activeTab)
  }, [page, activeTab])

  // Mark specific notification as read
  const handleMarkAsRead = async (id: string, currentStatus: string) => {
    if (currentStatus === 'READ') return

    // Optimistic
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() } : n))
    )
    setSummary((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }))

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch (error) {
      console.error(error)
      void fetchNotifications(page, activeTab)
    }
  }

  const handleMarkAllRead = async () => {
    if (summary.unread === 0) return

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: 'READ' as const, readAt: new Date().toISOString() }))
    )
    setSummary((prev) => ({ ...prev, unread: 0 }))

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
    } catch (error) {
      console.error(error)
      void fetchNotifications(page, activeTab)
    }
  }

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setSelectedId(null)

    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      void fetchNotifications(page, activeTab) // Refresh to keep limit consistent
    } catch (error) {
      console.error(error)
    }
  }

  // Icon mapping
  const getNotificationIcon = (type: Notification['type'], notifTitle?: string) => {
    switch (type) {
      case 'SYSTEM':
        return {
          icon: Landmark,
          colorClass: 'text-purple-500 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/20',
        }
      case 'TRANSACTION':
        if (notifTitle?.toLowerCase().includes('chi tiêu')) {
          return {
            icon: ArrowRightLeft,
            colorClass: 'text-rose-500 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/20',
          }
        }
        return {
          icon: ArrowDown,
          colorClass: 'text-emerald-500 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/20',
        }
      case 'BUDGET':
        return {
          icon: PieChart,
          colorClass: 'text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/20',
        }
      case 'WALLET':
        return {
          icon: Wallet,
          colorClass: 'text-purple-500 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/20',
        }
      case 'SECURITY':
        return {
          icon: ShieldCheck,
          colorClass: 'text-blue-500 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/20',
        }
      case 'REMINDER':
        return {
          icon: Clock,
          colorClass: 'text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/20',
        }
    }
  }

  const formatTime = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleTimeString(locale === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString)
    const datePart = d.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const timePart = d.toLocaleTimeString(locale === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    return `${datePart} • ${timePart}`
  }

  const tabs: { key: TabKey; label: string; count: number; icon?: any }[] = [
    { key: 'all', label: t('all'), count: summary.all },
    { key: 'unread', label: t('unreadOnly'), count: summary.unread, icon: Bell },
    { key: 'TRANSACTION', label: t('types.TRANSACTION'), count: summary.transaction, icon: ArrowRightLeft },
    { key: 'BUDGET', label: t('types.BUDGET'), count: summary.budget, icon: PieChart },
    { key: 'SYSTEM', label: t('types.SYSTEM'), count: summary.system, icon: Landmark },
    { key: 'REMINDER', label: t('types.REMINDER'), count: summary.promotion, icon: Clock },
  ]

  const groupedNotifications = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const groups: { label: string; items: Notification[] }[] = [
      { label: t('group.today'), items: [] },
      { label: t('group.yesterday'), items: [] },
      { label: t('group.older'), items: [] },
    ]

    notifications.forEach((n) => {
      if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !n.message.toLowerCase().includes(searchQuery.toLowerCase())) {
        return
      }
      const d = new Date(n.createdAt)
      if (d >= today) {
        groups[0].items.push(n)
      } else if (d >= yesterday && d < today) {
        groups[1].items.push(n)
      } else {
        groups[2].items.push(n)
      }
    })

    return groups.filter((g) => g.items.length > 0)
  }, [notifications, searchQuery, t])

  const selectedNotif = notifications.find(n => n.id === selectedId)
  const totalPages = Math.ceil(totalCount / limit) || 1

  return (
    <div className="mx-auto flex w-full flex-col gap-6 text-zinc-900 dark:text-zinc-50 pb-10">
      
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('title')}</h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block w-64">
            <Input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="size-4" />}
            />
          </div>
          <button className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-zinc-600 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-700 transition shadow-sm">
            <Filter className="size-4" />
          </button>
          <button 
            onClick={handleMarkAllRead}
            className="flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 text-[14px] font-bold text-zinc-700 dark:text-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-700 transition shadow-sm"
          >
            <CheckCheck className="size-4 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden sm:inline">{t('markAllRead')}</span>
          </button>
          <button className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-zinc-600 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-700 transition shadow-sm">
            <Settings className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex h-full w-full flex-col lg:flex-row gap-8 min-h-0">
        
        {/* Left Column: Tabs, List */}
        <div className="flex w-full lg:flex-1 flex-col min-w-0">
        
        {/* Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-none shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setPage(1)
                }}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[100px] shrink-0 rounded-[14px] border px-3 py-2.5 transition-all cursor-pointer bg-white dark:bg-slate-900",
                  isActive 
                    ? "border-blue-600 dark:border-blue-500 shadow-sm"
                    : "border-zinc-200 hover:bg-zinc-50 dark:border-slate-800 dark:hover:bg-slate-800"
                )}
              >
                <div className={cn(
                  "flex items-center gap-2 text-[13px] font-bold",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-700 dark:text-zinc-300"
                )}>
                  {tab.icon && <tab.icon className="size-4" />}
                  {tab.label}
                </div>
                <span className={cn(
                  "mt-1 text-[13px] font-bold",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-slate-500"
                )}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Notifications List */}
        <div className="flex-1 flex flex-col space-y-8 pb-10">
          
          {loading && notifications.length === 0 && (
            <div className="flex items-center justify-center py-20 text-zinc-400">
              {t('loading')}
            </div>
          )}

            {!loading && groupedNotifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-slate-500">
                <Bell className="size-12 mb-4 opacity-20" />
                <p>{t('noNotifications')}</p>
              </div>
            )}

            {groupedNotifications.map((group, gIdx) => (
              <div key={gIdx}>
                <h3 className="mb-3 text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider pl-2">
                  {group.label}
                </h3>
                <div className="flex flex-col gap-2">
                  {group.items.map((n) => {
                    const { icon: Icon, colorClass } = getNotificationIcon(n.type, n.title)
                    const isUnread = n.status === 'UNREAD'
                    const isSelected = selectedId === n.id

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          setSelectedId(n.id)
                          handleMarkAsRead(n.id, n.status)
                        }}
                        className={cn(
                          "group relative flex items-start gap-4 rounded-[16px] p-4 transition-all duration-200 ease-out cursor-pointer",
                          isSelected 
                            ? "bg-zinc-100/80 shadow-xs border border-zinc-200 dark:bg-slate-800/50 dark:border-slate-700" 
                            : "bg-transparent border border-transparent hover:bg-zinc-50/50 hover:border-zinc-100 dark:hover:bg-slate-800/30 dark:hover:border-slate-800"
                        )}
                      >
                        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", colorClass)}>
                          <Icon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0 pr-16 pt-0.5">
                          <h4 className={cn("text-[14px] truncate", isUnread ? "font-bold text-zinc-900 dark:text-zinc-50" : "font-semibold text-zinc-700 dark:text-zinc-200")}>
                            {n.title}
                          </h4>
                          <p className="mt-1 text-[13px] leading-relaxed text-zinc-500 dark:text-slate-400 line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                        <div className="absolute right-4 top-4 flex flex-col items-end gap-2.5">
                          <span className="text-[12px] font-medium text-zinc-400 dark:text-slate-500">
                            {formatTime(n.createdAt)}
                          </span>
                          {isUnread && <div className="size-2 rounded-full bg-blue-600 shadow-xs" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

          {/* Pagination Footer */}
          <div className="mt-auto shrink-0 w-full pt-4">
            <Pagination
              page={page}
              setPage={setPage}
              limit={limit}
              totalCount={totalCount}
              totalPages={totalPages}
              locale={locale}
            />
          </div>
        </div>
      </div>

      {/* Right Column: Detail Pane */}
      <div className="hidden lg:block w-[400px] xl:w-[450px] shrink-0 h-full">
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:border-slate-800 h-full border border-zinc-100">
          {selectedNotif ? (
            <div className="flex flex-col flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("flex size-10 items-center justify-center rounded-full shadow-xs", getNotificationIcon(selectedNotif.type, selectedNotif.title)?.colorClass)}>
                    {getNotificationIcon(selectedNotif.type, selectedNotif.title)?.icon && 
                      (() => {
                        const Icon = getNotificationIcon(selectedNotif.type, selectedNotif.title)!.icon
                        return <Icon className="size-5" />
                      })()}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-blue-600"></div>
                    <span className="text-[14px] font-bold text-zinc-700 dark:text-zinc-200">
                      {t(`types.${selectedNotif.type}`)}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedId(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-700 transition"
                >
                  <X className="size-5" />
                </button>
              </div>

              <h2 className="mt-5 text-[18px] font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                {selectedNotif.title}
              </h2>
              <div className="mt-2.5 flex items-center gap-2 text-[13px] text-zinc-500 dark:text-slate-400">
                <Clock className="size-4" />
                <span>{formatDateTime(selectedNotif.createdAt)}</span>
              </div>

              <p className="mt-5 text-[14px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                {selectedNotif.message}
              </p>

              {/* Detail Card Inside */}
              {selectedNotif.type === 'TRANSACTION' ? (
                <div className="mt-6 rounded-2xl border border-zinc-100 bg-zinc-50/50 dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-zinc-500 dark:text-slate-400">{t('details.amount')}</span>
                      <span className={cn(
                        "font-bold", 
                        selectedNotif.title.toLowerCase().includes('chi tiêu') ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {selectedNotif.title.toLowerCase().includes('chi tiêu') ? '-' : '+'} {selectedNotif.title.match(/[\d.]+/)?.[0] || '0'} đ
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-zinc-500 dark:text-slate-400">{t('details.account')}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Vietcombank **** 9012</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-zinc-500 dark:text-slate-400">{t('details.time')}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatDateTime(selectedNotif.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-start text-[13px]">
                      <span className="text-zinc-500 dark:text-slate-400 mt-0.5">{t('details.content')}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right max-w-[60%]">
                        {selectedNotif.title}
                      </span>
                    </div>
                  </div>
                  {/* Balance Footer */}
                  <div className="bg-emerald-50/80 dark:bg-emerald-900/20 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-[13px]">
                      <div className="flex size-4 rounded-full border border-emerald-500 dark:border-emerald-400 items-center justify-center">
                        <ArrowDown className="size-2.5" />
                      </div>
                      {t('details.balanceAfter')}
                    </div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[13px]">--- đ</span>
                  </div>
                </div>
              ) : null}

              {/* Actions List */}
              <div className="mt-8">
                <h4 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 mb-3">{t('actions.title')}</h4>
                <div className="flex flex-col">
                  <button className="flex items-center justify-between py-3.5 border-b border-zinc-100 dark:border-slate-800 text-[14px] font-bold text-zinc-700 dark:text-zinc-200 transition">
                    <div className="flex items-center gap-3">
                      <FileText className="size-4.5 text-zinc-500" />
                      {t('actions.viewTransaction')}
                    </div>
                    <ChevronRight className="size-4.5 text-zinc-400" />
                  </button>
                  <button className="flex items-center justify-between py-3.5 border-b border-zinc-100 dark:border-slate-800 text-[14px] font-bold text-zinc-700 dark:text-zinc-200 transition">
                    <div className="flex items-center gap-3">
                      <ArrowRightLeft className="size-4.5 text-zinc-500" />
                      {t('actions.transferMoney')}
                    </div>
                    <ChevronRight className="size-4.5 text-zinc-400" />
                  </button>
                  <button className="flex items-center justify-between py-3.5 border-b border-zinc-100 dark:border-slate-800 text-[14px] font-bold text-zinc-700 dark:text-zinc-200 transition">
                    <div className="flex items-center gap-3">
                      <Send className="size-4.5 text-zinc-500" />
                      {t('actions.exportReceipt')}
                    </div>
                    <ChevronRight className="size-4.5 text-zinc-400" />
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => handleDelete(selectedNotif.id)}
                  className="flex items-center gap-2 text-[14px] font-bold text-red-500 hover:text-red-600 transition"
                >
                  <Trash2 className="size-4" />
                  {t('actions.deleteNotification')}
                </button>
              </div>

            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-zinc-400 dark:text-slate-500">
              <Bell className="size-16 mb-4 opacity-20" />
              <p className="text-sm">{t('selectToView')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
