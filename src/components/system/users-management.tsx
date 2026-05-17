'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useTranslations, useLocale } from 'next-intl'
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  Search,
  Plus,
  MoreVertical,
  X,
  Calendar,
  Phone,
  Mail,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  Globe,
  Clock,
  ChevronDown,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type UserProfile = {
  firstName: string
  lastName: string
  displayName: string | null
  locale: string
  timezone: string
  avatarUrl: string | null
}

type UserRoleAssignment = {
  role: {
    id: string
    code: string
    name: string
    level: number
  }
}

type User = {
  id: string
  email: string
  phone: string | null
  username: string
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
  createdAt: string
  profile: UserProfile | null
  userRoles: UserRoleAssignment[]
}

type Role = {
  id: string
  code: string
  name: string
  description: string | null
  level: number
  permissions: any[]
}

type ActivityLog = {
  id: string
  action: string
  details: string | null
  ipAddress: string | null
  createdAt: string
}

export function UsersManagement() {
  const { data: session } = useSession()
  const currentUserEmail = session?.user?.email

  // Translations
  const t = useTranslations('system.users')
  const tCommon = useTranslations('system.common')
  const locale = useLocale()

  const translateRoleName = (code: string, fallbackName: string) => {
    return tCommon.has(`roles.${code}`) ? tCommon(`roles.${code}`) : fallbackName
  }

  // Data State
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, inactive: 0 })
  const [loading, setLoading] = useState(true)

  // Filtering & Pagination State
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Drawer & Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedUserDetail, setSelectedUserDetail] = useState<{
    user: User
    permissions: any[]
    activityLogs: ActivityLog[]
  } | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'permissions' | 'logs'>('info')
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Drawer loading states
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [roleUpdating, setRoleUpdating] = useState(false)
  
  // Custom dropdown toggle states
  const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false)
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false)
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false)
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)

  // Create form state
  const [createForm, setCreateForm] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    roleId: '',
    status: 'ACTIVE',
  })
  const [creating, setCreating] = useState(false)

  // Fetch Users & Stats
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        query: search,
        status: statusFilter,
        roleId: roleFilter,
        page: page.toString(),
        limit: limit.toString(),
      })
      const res = await fetch(`/api/system/users?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setUsers(data.users || [])
      setTotalCount(data.totalCount || 0)
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      toast.error(t('messages.fetchFailed'))
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/system/roles')
      if (res.ok) {
        const data = await res.json()
        setRoles(data)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  // Effect triggers
  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter, statusFilter, page])

  // Fetch user detailed logs/permissions for drawer
  const fetchUserDetails = async (userId: string) => {
    setDrawerLoading(true)
    try {
      const res = await fetch(`/api/system/users/${userId}`)
      if (!res.ok) throw new Error('Details not found')
      const data = await res.json()
      setSelectedUserDetail(data)
    } catch (error) {
      toast.error(t('messages.fetchDetailsFailed'))
      console.error(error)
    } finally {
      setDrawerLoading(false)
    }
  }

  const handleRowClick = (user: User) => {
    setSelectedUser(user)
    setDrawerOpen(true)
    setActiveTab('info')
    fetchUserDetails(user.id)
  }

  // Actions
  const handleUpdateStatus = async (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE') => {
    try {
      const res = await fetch(`/api/system/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(t('messages.statusSuccess'))
      fetchUsers()
      if (selectedUser?.id === userId) {
        fetchUserDetails(userId)
        setSelectedUser((prev) => prev ? { ...prev, status: newStatus } : null)
      }
    } catch {
      toast.error(t('messages.statusFailed'))
    }
    setActionMenuOpen(null)
  }

  const handleUpdateRole = async (userId: string, roleId: string) => {
    setRoleUpdating(true)
    try {
      const res = await fetch(`/api/system/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId }),
      })
      if (!res.ok) throw new Error()
      toast.success(t('messages.roleSuccess'))
      fetchUsers()
      fetchUserDetails(userId)
    } catch {
      toast.error(t('messages.roleFailed'))
    } finally {
      setRoleUpdating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('messages.confirmDelete'))) {
      return
    }

    try {
      const res = await fetch(`/api/system/users/${userId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        if (err.code === 'CANNOT_DELETE_SELF') {
          toast.error(t('messages.deleteSelfError'))
          return
        }
        throw new Error()
      }
      toast.success(t('messages.deleteSuccess'))
      setDrawerOpen(false)
      fetchUsers()
    } catch {
      toast.error(t('messages.deleteFailed'))
    }
    setActionMenuOpen(null)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/system/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'EMAIL_EXISTS') {
          toast.error(t('messages.emailExists'))
        } else if (data.code === 'USERNAME_EXISTS') {
          toast.error(t('messages.usernameExists'))
        } else {
          toast.error(t('messages.createFailed'))
        }
        return
      }
      toast.success(t('messages.createSuccess'))
      setCreateModalOpen(false)
      setCreateForm({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        roleId: '',
        status: 'ACTIVE',
      })
      fetchUsers()
    } catch {
      toast.error(t('messages.systemError'))
    } finally {
      setCreating(false)
    }
  }

  // Get Initials for Avatar
  const getInitials = (user: User) => {
    const profile = user.profile
    if (profile) {
      return `${profile.lastName.charAt(0)}${profile.firstName.charAt(0)}`.toUpperCase()
    }
    return user.username.slice(0, 2).toUpperCase()
  }

  // Render permission status checked grid matching mockup
  const renderPermissionTree = () => {
    if (drawerLoading || !selectedUserDetail) {
      return (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-zinc-400" />
        </div>
      )
    }

    const assignedCodes = selectedUserDetail.permissions.map((p) => p.code)
    
    // Hardcoded grouped tree matching mockup
    const permissionModules = [
      {
        name: t('drawer.permissions.modules.wallet'),
        code: 'wallet',
        permissions: [
          { name: t('drawer.permissions.read'), code: 'wallet:read' },
          { name: t('drawer.permissions.create'), code: 'wallet:create' },
          { name: t('drawer.permissions.update'), code: 'wallet:update' },
          { name: t('drawer.permissions.delete'), code: 'wallet:delete' },
        ],
      },
      {
        name: t('drawer.permissions.modules.transaction'),
        code: 'transaction',
        permissions: [
          { name: t('drawer.permissions.read'), code: 'transaction:read' },
          { name: t('drawer.permissions.create'), code: 'transaction:create' },
          { name: t('drawer.permissions.update'), code: 'transaction:update' },
          { name: t('drawer.permissions.delete'), code: 'transaction:delete' },
        ],
      },
      {
        name: t('drawer.permissions.modules.budget'),
        code: 'budget',
        permissions: [
          { name: t('drawer.permissions.read'), code: 'budget:read' },
          { name: t('drawer.permissions.create'), code: 'budget:create' },
          { name: t('drawer.permissions.update'), code: 'budget:update' },
          { name: t('drawer.permissions.delete'), code: 'budget:delete' },
        ],
      },
      {
        name: t('drawer.permissions.modules.category'),
        code: 'category',
        permissions: [
          { name: t('drawer.permissions.read'), code: 'category:read' },
          { name: t('drawer.permissions.create'), code: 'category:create' },
          { name: t('drawer.permissions.update'), code: 'category:update' },
          { name: t('drawer.permissions.delete'), code: 'category:delete' },
        ],
      },
    ]

    return (
      <div className="mt-4 space-y-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900/50">
          <div className="grid grid-cols-5 border-b border-zinc-200 dark:border-zinc-800 p-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <div className="col-span-2">{t('drawer.permissions.moduleHeader')}</div>
            <div className="text-center">{t('drawer.permissions.read')}</div>
            <div className="text-center">{t('drawer.permissions.create')}</div>
            <div className="text-center">{t('drawer.permissions.update')}</div>
            <div className="text-center">{t('drawer.permissions.delete')}</div>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {permissionModules.map((module) => (
              <div key={module.code} className="grid grid-cols-5 p-3.5 items-center text-sm">
                <div className="col-span-2 font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-blue-500" />
                  {module.name}
                </div>
                {module.permissions.map((p) => {
                  const hasPerm = assignedCodes.includes(p.code)
                  return (
                    <div key={p.code} className="flex justify-center">
                      <div className={cn(
                        "size-5 rounded-md flex items-center justify-center border text-xs font-bold transition",
                        hasPerm 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400" 
                          : "bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-600 dark:border-zinc-700"
                      )}>
                        {hasPerm ? '✓' : '—'}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-zinc-500 italic mt-2">
          {t('drawer.permissions.desc')}
        </p>
      </div>
    )
  }

  // Format action text
  const formatActionName = (action: string) => {
    return tCommon.has(`actions.${action}`) ? tCommon(`actions.${action}`) : action
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 text-zinc-900 dark:text-zinc-50 pb-10">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={() => {
            if (roles.length > 0) {
              setCreateForm((prev) => ({ ...prev, roleId: roles[roles.length - 1].id })) // default user role
            }
            setCreateModalOpen(true)
          }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium shadow transition cursor-pointer"
        >
          <Plus className="size-4" />
          {t('addUser')}
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('stats.total')}</p>
              <h2 className="mt-2 text-3xl font-bold">{stats.total}</h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="size-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-500">{t('stats.totalDesc')}</div>
        </div>

        {/* Card 2: Active */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('stats.active')}</p>
              <h2 className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-500">{stats.active}</h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 animate-pulse">
              <UserCheck className="size-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-500">{t('stats.activeDesc')}</div>
        </div>

        {/* Card 3: Suspended */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('stats.suspended')}</p>
              <h2 className="mt-2 text-3xl font-bold text-amber-500 dark:text-amber-500">{stats.suspended}</h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <UserMinus className="size-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-500">{t('stats.suspendedDesc')}</div>
        </div>

        {/* Card 4: Inactive */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('stats.inactive')}</p>
              <h2 className="mt-2 text-3xl font-bold text-zinc-400 dark:text-zinc-400">{stats.inactive}</h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-500/10 text-zinc-400">
              <UserX className="size-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-500">{t('stats.inactiveDesc')}</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder={t('toolbar.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)}
              className="flex items-center justify-between gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-[#0c0c0e] text-zinc-700 dark:text-zinc-300 select-none cursor-pointer"
            >
              <span>
                {roleFilter
                  ? translateRoleName(roles.find(r => r.id === roleFilter)?.code || '', roles.find(r => r.id === roleFilter)?.name || '')
                  : t('toolbar.roleAll')}
              </span>
              <ChevronDown className="size-4 text-zinc-400 shrink-0" />
            </button>

            {isRoleFilterOpen && (
              <>
                <div
                  onClick={() => setIsRoleFilterOpen(false)}
                  className="fixed inset-0 z-30"
                />
                <div className="absolute z-40 left-0 mt-1 min-w-[200px] max-h-60 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl dark:border-zinc-850 dark:bg-[#0c0c0e] animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setRoleFilter('')
                      setPage(1)
                      setIsRoleFilterOpen(false)
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex items-center justify-between cursor-pointer",
                      roleFilter === ''
                        ? "text-blue-600 bg-blue-50/20 dark:text-blue-400 dark:bg-blue-950/20"
                        : "text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    <span>{t('toolbar.roleAll')}</span>
                    {roleFilter === '' && <Check className="size-4 text-blue-600 dark:text-blue-400" />}
                  </button>
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setRoleFilter(role.id)
                        setPage(1)
                        setIsRoleFilterOpen(false)
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex items-center justify-between cursor-pointer",
                        roleFilter === role.id
                          ? "text-blue-600 bg-blue-50/20 dark:text-blue-400 dark:bg-blue-950/20"
                          : "text-zinc-700 dark:text-zinc-300"
                      )}
                    >
                      <span>{translateRoleName(role.code, role.name)}</span>
                      {roleFilter === role.id && <Check className="size-4 text-blue-600 dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              className="flex items-center justify-between gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-[#0c0c0e] text-zinc-700 dark:text-zinc-300 select-none cursor-pointer"
            >
              <span>
                {statusFilter === 'ACTIVE' && tCommon('statuses.ACTIVE')}
                {statusFilter === 'SUSPENDED' && tCommon('statuses.SUSPENDED')}
                {statusFilter === 'INACTIVE' && tCommon('statuses.INACTIVE')}
                {statusFilter === '' && t('toolbar.statusAll')}
              </span>
              <ChevronDown className="size-4 text-zinc-400 shrink-0" />
            </button>

            {isStatusFilterOpen && (
              <>
                <div
                  onClick={() => setIsStatusFilterOpen(false)}
                  className="fixed inset-0 z-30"
                />
                <div className="absolute z-40 left-0 mt-1 min-w-[160px] rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl dark:border-zinc-850 dark:bg-[#0c0c0e] animate-in fade-in slide-in-from-top-1 duration-150">
                  {[
                    { val: '', label: t('toolbar.statusAll') },
                    { val: 'ACTIVE', label: tCommon('statuses.ACTIVE') },
                    { val: 'SUSPENDED', label: tCommon('statuses.SUSPENDED') },
                    { val: 'INACTIVE', label: tCommon('statuses.INACTIVE') }
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        setStatusFilter(item.val)
                        setPage(1)
                        setIsStatusFilterOpen(false)
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex items-center justify-between cursor-pointer",
                        statusFilter === item.val
                          ? "text-blue-600 bg-blue-50/20 dark:text-blue-400 dark:bg-blue-950/20"
                          : "text-zinc-700 dark:text-zinc-300"
                      )}
                    >
                      <span>{item.label}</span>
                      {statusFilter === item.val && <Check className="size-4 text-blue-600 dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="p-4">{t('table.user')}</th>
                <th className="p-4">{t('table.role')}</th>
                <th className="p-4">{t('table.status')}</th>
                <th className="p-4">{t('table.created')}</th>
                <th className="p-4 text-center">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="size-6 animate-spin text-zinc-400 mx-auto" />
                    <p className="text-sm text-zinc-500 mt-2">{t('table.loading')}</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-zinc-500">
                    {t('table.noRecords')}
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleObj = user.userRoles[0]?.role
                  const isCurrentUser = currentUserEmail && user.email === currentUserEmail

                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleRowClick(user)}
                      className="group hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 cursor-pointer transition"
                    >
                      {/* Name / Email Column */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "size-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-inner",
                            isCurrentUser
                              ? "bg-gradient-to-tr from-blue-600 to-sky-400"
                              : "bg-zinc-400 dark:bg-zinc-700"
                          )}>
                            {getInitials(user)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {user.profile?.lastName} {user.profile?.firstName}
                              </span>
                              {isCurrentUser && (
                                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                  {t('table.you')}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {user.email || user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge Column */}
                      <td className="p-4">
                        {roleObj ? (
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border shadow-sm",
                            roleObj.code === 'SUPER_ADMIN' && "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/25 dark:text-indigo-300",
                            roleObj.code === 'CHIEF_ACCOUNTANT' && "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/25 dark:text-blue-300",
                            roleObj.code === 'ACCOUNTANT' && "bg-teal-500/10 text-teal-600 border-teal-500/20 dark:bg-teal-500/25 dark:text-teal-300",
                            roleObj.code === 'CASHIER' && "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/25 dark:text-purple-300",
                            roleObj.code === 'USER' && "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:bg-zinc-500/25 dark:text-zinc-400"
                          )}>
                            <Shield className="size-3 shrink-0" />
                            {translateRoleName(roleObj.code, roleObj.name)}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">{t('table.noRole')}</span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="p-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border",
                          user.status === 'ACTIVE' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/25 dark:text-emerald-400",
                          user.status === 'SUSPENDED' && "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/25 dark:text-amber-400",
                          user.status === 'INACTIVE' && "bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:bg-zinc-500/25 dark:text-zinc-400"
                        )}>
                          <span className={cn(
                            "size-1.5 rounded-full shrink-0",
                            user.status === 'ACTIVE' && "bg-emerald-500 dark:bg-emerald-400",
                            user.status === 'SUSPENDED' && "bg-amber-500 dark:bg-amber-400",
                            user.status === 'INACTIVE' && "bg-zinc-400 dark:bg-zinc-500"
                          )} />
                          {user.status === 'ACTIVE' ? tCommon('statuses.ACTIVE') : user.status === 'SUSPENDED' ? tCommon('statuses.SUSPENDED') : tCommon('statuses.INACTIVE')}
                        </span>
                      </td>

                      {/* Date Column */}
                      <td className="p-4 text-sm text-zinc-500">
                        {new Date(user.createdAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                      </td>

                      {/* Actions Column */}
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                          >
                            <MoreVertical className="size-4" />
                          </button>

                          {/* Context Menu Dropdown */}
                          {actionMenuOpen === user.id && (
                            <div className="absolute right-0 mt-1 w-48 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-[#0c0c0e] z-50 animate-in fade-in slide-in-from-top-1">
                              <button
                                onClick={() => handleRowClick(user)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                              >
                                <Users className="size-3.5" />
                                {t('table.viewDetail')}
                              </button>
                              
                              {user.status === 'ACTIVE' ? (
                                <button
                                  onClick={() => handleUpdateStatus(user.id, 'SUSPENDED')}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/20 transition"
                                >
                                  <Lock className="size-3.5" />
                                  {t('table.suspend')}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateStatus(user.id, 'ACTIVE')}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/20 transition"
                                >
                                  <Unlock className="size-3.5" />
                                  {t('table.activate')}
                                </button>
                              )}

                              {!isCurrentUser && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 border-t border-zinc-100 dark:border-zinc-800/80 transition"
                                >
                                  <Trash2 className="size-3.5" />
                                  {t('table.delete')}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalCount > limit && (
          <div className="flex items-center justify-between border-t border-zinc-200 p-4 dark:border-zinc-800">
            <span className="text-xs text-zinc-500">
              {t('table.pagination', {
                start: Math.min(totalCount, (page - 1) * limit + 1),
                end: Math.min(totalCount, page * limit),
                total: totalCount
              })}
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

      {/* =========================================================
          USER DETAIL DRAWER (SLIDE FROM RIGHT)
          ========================================================= */}
      {drawerOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative z-10 w-full max-w-xl h-full bg-white dark:bg-[#0c0c0e] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col p-6 overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center font-bold text-lg text-white shadow-md">
                  {getInitials(selectedUser)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedUser.profile?.lastName} {selectedUser.profile?.firstName}
                  </h3>
                  <p className="text-xs text-zinc-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                  selectedUser.status === 'ACTIVE' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/25 dark:text-emerald-400",
                  selectedUser.status === 'SUSPENDED' && "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/25 dark:text-amber-400",
                  selectedUser.status === 'INACTIVE' && "bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:bg-zinc-500/25 dark:text-zinc-400"
                )}>
                  {selectedUser.status === 'ACTIVE' ? tCommon('statuses.ACTIVE') : selectedUser.status === 'SUSPENDED' ? tCommon('statuses.SUSPENDED') : tCommon('statuses.INACTIVE')}
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-150 mt-4 dark:border-zinc-800/80">
              <button
                onClick={() => setActiveTab('info')}
                className={cn(
                  "flex-1 py-2 text-center text-sm font-semibold border-b-2 transition cursor-pointer",
                  activeTab === 'info'
                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                )}
              >
                {t('drawer.tabInfo')}
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={cn(
                  "flex-1 py-2 text-center text-sm font-semibold border-b-2 transition cursor-pointer",
                  activeTab === 'permissions'
                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                )}
              >
                {t('drawer.tabRoles')}
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={cn(
                  "flex-1 py-2 text-center text-sm font-semibold border-b-2 transition cursor-pointer",
                  activeTab === 'logs'
                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                )}
              >
                {t('drawer.tabLogs')}
              </button>
            </div>

            {/* Tab content panel */}
            <div className="flex-1 overflow-y-auto mt-4 pr-1">
              {drawerLoading ? (
                <div className="flex h-64 flex-col items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-blue-500" />
                  <p className="text-sm text-zinc-500 mt-2">{tCommon('loading')}</p>
                </div>
              ) : (
                <>
                  {/* Tab 1: General Info */}
                  {activeTab === 'info' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Detailed Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-zinc-100 p-3.5 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">{t('drawer.info.name')}</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {selectedUser.profile?.lastName} {selectedUser.profile?.firstName}
                          </span>
                        </div>
                        <div className="rounded-xl border border-zinc-100 p-3.5 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">{t('drawer.info.username')}</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">@{selectedUser.username}</span>
                        </div>
                        <div className="rounded-xl border border-zinc-100 p-3.5 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1 mb-1">
                            <Mail className="size-3" /> {t('drawer.info.email')}
                          </span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-all">{selectedUser.email}</span>
                        </div>
                        <div className="rounded-xl border border-zinc-100 p-3.5 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1 mb-1">
                            <Phone className="size-3" /> {t('drawer.info.phone')}
                          </span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {selectedUser.phone || t('drawer.info.phoneEmpty')}
                          </span>
                        </div>
                        <div className="rounded-xl border border-zinc-100 p-3.5 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1 mb-1">
                            <Globe className="size-3" /> {t('drawer.info.language')}
                          </span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {locale === 'vi' ? 'Tiếng Việt (vi)' : 'English (en)'}
                          </span>
                        </div>
                        <div className="rounded-xl border border-zinc-100 p-3.5 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1 mb-1">
                            <Clock className="size-3" /> {t('drawer.info.timezone')}
                          </span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Asia/Ho_Chi_Minh</span>
                        </div>
                      </div>

                      {/* Edit Role card */}
                      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
                        <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
                          <ShieldCheck className="size-4 text-blue-600" />
                          {t('drawer.info.rbac')}
                        </h4>
                        <p className="text-xs text-zinc-500 mb-4">
                          {t('drawer.info.rbacDesc')}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="relative flex-1">
                            <button
                              type="button"
                              disabled={!!(roleUpdating || (currentUserEmail && selectedUser.email === currentUserEmail))}
                              onClick={() => setIsChangeRoleOpen(!isChangeRoleOpen)}
                              className="w-full flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-[#0c0c0e] text-left disabled:opacity-50 select-none cursor-pointer"
                            >
                              <span>
                                {selectedUser.userRoles[0]?.role
                                  ? `${translateRoleName(selectedUser.userRoles[0].role.code, selectedUser.userRoles[0].role.name)} (${selectedUser.userRoles[0].role.code})`
                                  : t('drawer.info.noRole')}
                              </span>
                              <ChevronDown className="size-4 text-zinc-400 shrink-0 ml-2" />
                            </button>

                            {isChangeRoleOpen && (
                              <>
                                <div
                                  onClick={() => setIsChangeRoleOpen(false)}
                                  className="fixed inset-0 z-30"
                                />
                                <div className="absolute z-40 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl dark:border-zinc-850 dark:bg-[#0c0c0e] animate-in fade-in slide-in-from-top-1 duration-150">
                                  {roles.map((role) => {
                                    const isCurrent = selectedUser.userRoles[0]?.role.id === role.id
                                    return (
                                      <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => {
                                          handleUpdateRole(selectedUser.id, role.id)
                                          setIsChangeRoleOpen(false)
                                        }}
                                        className={cn(
                                          "w-full px-3 py-2 text-left text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex items-center justify-between cursor-pointer",
                                          isCurrent
                                            ? "text-blue-600 bg-blue-50/20 dark:text-blue-400 dark:bg-blue-950/20"
                                            : "text-zinc-700 dark:text-zinc-300"
                                        )}
                                      >
                                        <span>
                                          {translateRoleName(role.code, role.name)} ({role.code})
                                        </span>
                                        {isCurrent && (
                                          <Check className="size-4 text-blue-600 dark:text-blue-400" />
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                          {roleUpdating && <Loader2 className="size-4 animate-spin text-zinc-500" />}
                        </div>
                        {currentUserEmail && selectedUser.email === currentUserEmail && (
                          <p className="text-[10px] text-amber-500 mt-2">
                            {t('drawer.info.rbacSelfWarning')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Permissions grid (Mockup style) */}
                  {activeTab === 'permissions' && (
                    <div className="animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold">{t('drawer.permissions.title')}</h4>
                        <span className="text-xs text-blue-600 font-semibold bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg">
                          {t('drawer.permissions.roleLabel', {
                            name: translateRoleName(
                              selectedUserDetail?.user.userRoles[0]?.role.code || '',
                              selectedUserDetail?.user.userRoles[0]?.role.name || ''
                            )
                          })}
                        </span>
                      </div>
                      {renderPermissionTree()}
                    </div>
                  )}

                  {/* Tab 3: Timeline logs */}
                  {activeTab === 'logs' && (
                    <div className="animate-in fade-in duration-200 space-y-4">
                      <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
                        <Activity className="size-4 text-blue-600" />
                        {t('drawer.logs.title')}
                      </h4>

                      {selectedUserDetail?.activityLogs && selectedUserDetail.activityLogs.length === 0 ? (
                        <p className="text-sm text-zinc-500 text-center py-8">{t('drawer.logs.noRecords')}</p>
                      ) : (
                        <div className="relative pl-6 border-l-2 border-zinc-100 dark:border-zinc-800 ml-3 space-y-6">
                          {selectedUserDetail?.activityLogs.map((log) => (
                            <div key={log.id} className="relative">
                              {/* Dot marker */}
                              <span className="absolute -left-[31px] top-1 flex size-4 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/60 ring-4 ring-white dark:ring-[#0c0c0e] text-blue-600">
                                <span className="size-1.5 rounded-full bg-blue-600" />
                              </span>
                              <div>
                                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                                  {formatActionName(log.action)}
                                </span>
                                <p className="text-xs text-zinc-500 mt-0.5">{log.details}</p>
                                <span className="text-[10px] text-zinc-400 mt-1 flex items-center gap-2">
                                  <span>{new Date(log.createdAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}</span>
                                  <span>•</span>
                                  <span>IP: {log.ipAddress || '127.0.0.1'}</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          CREATE USER MODAL
          ========================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setCreateModalOpen(false)}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-[#0c0c0e] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('createModal.title')}</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1 block">{t('createModal.lastName')}</label>
                  <input
                    type="text"
                    required
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    placeholder={t('createModal.lastNamePlaceholder')}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1 block">{t('createModal.firstName')}</label>
                  <input
                    type="text"
                    required
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    placeholder={t('createModal.firstNamePlaceholder')}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1 block">{t('createModal.email')}</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder={t('createModal.emailPlaceholder')}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1 block">{t('createModal.username')}</label>
                  <input
                    type="text"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    placeholder={t('createModal.usernamePlaceholder')}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1 block">{t('createModal.password')}</label>
                  <input
                    type="password"
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder={t('createModal.passwordPlaceholder')}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1 block">{t('createModal.phone')}</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder={t('createModal.phonePlaceholder')}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1 block">{t('createModal.role')}</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                      className="w-full flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-[#0c0c0e] text-left select-none cursor-pointer"
                    >
                      <span className={cn(!createForm.roleId && "text-zinc-400 dark:text-zinc-500")}>
                        {createForm.roleId
                          ? `${translateRoleName(roles.find(r => r.id === createForm.roleId)?.code || '', roles.find(r => r.id === createForm.roleId)?.name || '')} (${roles.find(r => r.id === createForm.roleId)?.code})`
                          : t('createModal.roleSelect')}
                      </span>
                      <ChevronDown className="size-4 text-zinc-400 shrink-0 ml-2" />
                    </button>

                    {isRoleDropdownOpen && (
                      <>
                        <div
                          onClick={() => setIsRoleDropdownOpen(false)}
                          className="fixed inset-0 z-30"
                        />
                        <div className="absolute z-45 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl dark:border-zinc-850 dark:bg-[#0c0c0e] animate-in fade-in slide-in-from-top-1 duration-150">
                          {roles.map((role) => (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => {
                                setCreateForm({ ...createForm, roleId: role.id })
                                setIsRoleDropdownOpen(false)
                              }}
                              className={cn(
                                "w-full px-3 py-2 text-left text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex items-center justify-between cursor-pointer",
                                createForm.roleId === role.id
                                  ? "text-blue-600 bg-blue-50/20 dark:text-blue-400 dark:bg-blue-950/20"
                                  : "text-zinc-700 dark:text-zinc-300"
                              )}
                            >
                              <span>
                                {translateRoleName(role.code, role.name)} ({role.code})
                              </span>
                              {createForm.roleId === role.id && (
                                <Check className="size-4 text-blue-600 dark:text-blue-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition cursor-pointer dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  {t('createModal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold shadow transition cursor-pointer disabled:opacity-50"
                >
                  {creating && <Loader2 className="size-4 animate-spin" />}
                  {t('createModal.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
