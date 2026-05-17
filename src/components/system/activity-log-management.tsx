'use client'

import { useState, useEffect } from 'react'
import {
  Activity,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Key,
  Database,
  PlusCircle,
  AlertTriangle,
  LogOut,
  Calendar,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type UserProfile = {
  firstName: string
  lastName: string
  displayName: string | null
  avatarUrl: string | null
}

type User = {
  email: string
  username: string
  profile: UserProfile | null
}

type ActivityLog = {
  id: string
  action: string
  details: string | null
  ipAddress: string | null
  createdAt: string
  user: User
}

export function ActivityLogManagement() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        query: search,
        page: page.toString(),
        limit: limit.toString(),
      })
      const res = await fetch(`/api/system/activity-log?${queryParams}`)
      if (!res.ok) throw new Error('Fetch failed')
      const data = await res.json()
      setLogs(data.logs || [])
      setTotalCount(data.totalCount || 0)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [search, page])

  // Get Initials for Avatar
  const getInitials = (user: User) => {
    if (user.profile) {
      return `${user.profile.lastName.charAt(0)}${user.profile.firstName.charAt(0)}`.toUpperCase()
    }
    return user.username.slice(0, 2).toUpperCase()
  }

  // Format action text
  const formatActionName = (action: string) => {
    const map: Record<string, string> = {
      LOGIN: 'Đăng nhập',
      UPDATE_PROFILE: 'Cập nhật hồ sơ',
      UPDATE_USER_STATUS: 'Thay đổi trạng thái',
      CHANGE_ROLE: 'Thay đổi vai trò',
      CREATE_USER: 'Tạo tài khoản mới',
      DELETE_USER: 'Xóa tài khoản',
      EXPORT_REPORT: 'Xuất báo cáo tài chính',
      APPROVE_BUDGET: 'Duyệt ngân sách chi tiêu',
      CREATE_TRANSACTION: 'Ghi nhận giao dịch',
      UPDATE_ROLE_PERMISSIONS: 'Cập nhật ma trận quyền',
      CREATE_ROLE: 'Tạo vai trò mới',
      DELETE_ROLE: 'Xóa vai trò hệ thống',
    }
    return map[action] || action
  }

  // Get action style and icon based on category
  const getActionBadgeStyle = (action: string) => {
    if (action.includes('DELETE') || action.includes('LOCK')) {
      return 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400'
    }
    if (action.includes('CREATE') || action.includes('ADD') || action === 'APPROVE_BUDGET') {
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400'
    }
    if (action.includes('UPDATE') || action === 'CHANGE_ROLE') {
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400'
    }
    if (action === 'LOGIN') {
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400'
    }
    return 'bg-zinc-500/10 text-zinc-650 border-zinc-500/20 dark:bg-zinc-500/20 dark:text-zinc-400'
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 text-zinc-900 dark:text-zinc-50 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Nhật ký hoạt động</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tra cứu lịch sử kiểm toán của các quản trị viên và nhân viên. Giám sát các biến động hệ thống bảo mật thời gian thực.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo hành động, người dùng, chi tiết..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="p-4">Thành viên</th>
                <th className="p-4">Hành động</th>
                <th className="p-4">Chi tiết sự kiện</th>
                <th className="p-4">Địa chỉ IP</th>
                <th className="p-4">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="size-6 animate-spin text-zinc-400 mx-auto" />
                    <p className="text-sm text-zinc-500 mt-2">Đang tải lịch sử nhật ký...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-zinc-500">
                    Chưa ghi nhận sự kiện hoạt động nào phù hợp.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition text-sm"
                  >
                    {/* User Info Column */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-zinc-400 dark:bg-zinc-700 flex items-center justify-center font-bold text-xs text-white shadow-inner">
                          {getInitials(log.user)}
                        </div>
                        <div>
                          <span className="font-semibold block text-zinc-900 dark:text-zinc-100">
                            {log.user.profile?.lastName} {log.user.profile?.firstName}
                          </span>
                          <span className="text-[10px] text-zinc-400 block break-all">
                            {log.user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Action Badge Column */}
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold border shadow-sm",
                        getActionBadgeStyle(log.action)
                      )}>
                        <Activity className="size-3 shrink-0" />
                        {formatActionName(log.action)}
                      </span>
                    </td>

                    {/* Details Column */}
                    <td className="p-4 text-zinc-650 dark:text-zinc-300 max-w-xs break-words">
                      {log.details || 'Không có mô tả thêm.'}
                    </td>

                    {/* IP Column */}
                    <td className="p-4 font-mono text-xs text-zinc-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    {/* Timestamp Column */}
                    <td className="p-4 text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {totalCount > limit && (
          <div className="flex items-center justify-between border-t border-zinc-200 p-4 dark:border-zinc-800">
            <span className="text-xs text-zinc-500">
              Đang xem {Math.min(totalCount, (page - 1) * limit + 1)}-{Math.min(totalCount, page * limit)} trong số {totalCount} sự kiện
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm font-semibold px-2">{page}</span>
              <button
                disabled={page * limit >= totalCount}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
