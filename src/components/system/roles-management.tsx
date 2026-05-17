'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Shield,
  Plus,
  X,
  ShieldAlert,
  Loader2,
  Trash2,
  Users,
  CheckSquare,
  Square,
  Save,
  ChevronDown,
  Info,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  MoreVertical,
  Bell,
  Search,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserPlus,
  Check,
  Edit3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Permission = {
  id: string
  code: string
  name: string
  module: string
  action: string
}

type Role = {
  id: string
  code: string
  name: string
  description: string | null
  level: number
  status: 'ACTIVE' | 'INACTIVE'
  userCount: number
  permissions: Permission[]
}

type ActivityLog = {
  id: string
  action: string
  details: string | null
  ipAddress: string | null
  createdAt: string
  user: {
    email: string
    username: string
    profile: {
      firstName: string
      lastName: string
      displayName: string | null
      avatarUrl: string | null
    } | null
  }
}

const PREDEFINED_SYSTEM_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'CASHIER', 'USER']

export function RolesManagement() {
  // Tabs & Navigation
  const [activeTab, setActiveTab] = useState<'roles' | 'logs'>('roles')

  // Core Data
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [savingPermissions, setSavingPermissions] = useState(false)

  // Filtering & Pagination (Roles Tab)
  const [rolesSearch, setRolesSearch] = useState('')
  const [rolesStatusFilter, setRolesStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [rolesPage, setRolesPage] = useState(1)
  const [rolesLimit] = useState(10)

  // Activity Logs Tab
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [logsSearch, setLogsSearch] = useState('')
  const [logsPage, setLogsPage] = useState(1)
  const [logsLimit] = useState(10)
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsLoading, setLogsLoading] = useState(false)

  // Drawer (View Detail / Matrix Permission editing)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [drawerTab, setDrawerTab] = useState<'info' | 'permissions'>('info')
  const [checkedPermissionIds, setCheckedPermissionIds] = useState<string[]>([])
  const [savingRoleDetails, setSavingRoleDetails] = useState(false)
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    level: 10,
  })

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    code: '',
    name: '',
    description: '',
    level: 10,
  })

  // Action Menu Dropdown (Three dots menu on table row)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  // Fetch Roles and Permissions
  const fetchAllRolesAndPermissions = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch('/api/system/roles'),
        fetch('/api/system/permissions'),
      ])

      if (!rolesRes.ok || !permsRes.ok) throw new Error('Failed to load data')

      const rolesData = await rolesRes.json()
      const permsData = await permsRes.json()

      setRoles(rolesData)
      setPermissions(permsData)

      // If drawer is currently open, keep editing role refreshed with fresh count/permissions
      if (editingRole) {
        const freshEditing = rolesData.find((r: Role) => r.id === editingRole.id)
        if (freshEditing) {
          setEditingRole(freshEditing)
        }
      }
    } catch (error) {
      toast.error('Không thể tải danh sách vai trò hoặc quyền')
      console.error(error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Fetch Activity Logs
  const fetchActivityLogs = async () => {
    setLogsLoading(true)
    try {
      const params = new URLSearchParams({
        query: logsSearch,
        page: logsPage.toString(),
        limit: logsLimit.toString(),
      })
      const res = await fetch(`/api/system/activity-log?${params}`)
      if (!res.ok) throw new Error('Logs fetch failed')
      const data = await res.json()
      setLogs(data.logs || [])
      setLogsTotal(data.totalCount || 0)
    } catch (error) {
      toast.error('Không thể tải nhật ký hoạt động')
      console.error(error)
    } finally {
      setLogsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllRolesAndPermissions()
  }, [])

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchActivityLogs()
    }
  }, [activeTab, logsSearch, logsPage])

  // Open Drawer Detail
  const handleOpenDrawer = (role: Role, tab: 'info' | 'permissions' = 'info') => {
    setEditingRole(role)
    setCheckedPermissionIds(role.permissions.map((p) => p.id))
    setRoleForm({
      name: role.name,
      description: role.description || '',
      level: role.level,
    })
    setDrawerTab(tab)
    setDrawerOpen(true)
    setActionMenuOpen(null)
  }

  // Group permissions by module
  const getGroupedPermissions = () => {
    const modules: Record<string, { label: string; permissions: Permission[] }> = {
      wallet: { label: 'Tổng quan (Dashboard)', permissions: [] },
      transaction: { label: 'Thu chi (Transactions)', permissions: [] },
      budget: { label: 'Báo cáo (Reports & Budgets)', permissions: [] },
      category: { label: 'Danh mục (Categories)', permissions: [] },
      user: { label: 'Người dùng (System Users)', permissions: [] },
      role: { label: 'Vai trò & Quyền (RBAC Roles)', permissions: [] },
      permission: { label: 'Hệ thống (Platform Settings)', permissions: [] },
    }

    permissions.forEach((p) => {
      if (modules[p.module]) {
        modules[p.module].permissions.push(p)
      } else {
        if (!modules[p.module]) {
          modules[p.module] = { label: p.module.toUpperCase(), permissions: [] }
        }
        modules[p.module].permissions.push(p)
      }
    })

    return Object.entries(modules).filter(([_, group]) => group.permissions.length > 0)
  }

  // Save changes to Role Details (Name, Description, Level)
  const handleSaveRoleDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRole) return
    setSavingRoleDetails(true)
    try {
      const res = await fetch(`/api/system/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm),
      })
      if (!res.ok) throw new Error()
      toast.success('Cập nhật thông tin vai trò thành công!')
      fetchAllRolesAndPermissions(false)
    } catch {
      toast.error('Cập nhật thông tin vai trò thất bại')
    } finally {
      setSavingRoleDetails(false)
    }
  }

  // Save changes to Role Permission Matrix
  const handleSaveRolePermissions = async () => {
    if (!editingRole) return
    setSavingPermissions(true)
    try {
      const res = await fetch(`/api/system/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: checkedPermissionIds }),
      })
      if (!res.ok) throw new Error()
      toast.success('Cập nhật ma trận phân quyền thành công!')
      fetchAllRolesAndPermissions(false)
    } catch {
      toast.error('Cập nhật quyền hạn thất bại')
    } finally {
      setSavingPermissions(false)
    }
  }

  // Toggle single permission check
  const handleTogglePermission = (permissionId: string) => {
    setCheckedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  // Create new Role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/system/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'ROLE_CODE_EXISTS') {
          toast.error('Mã vai trò đã tồn tại trong hệ thống')
        } else {
          toast.error('Tạo vai trò thất bại')
        }
        return
      }
      toast.success('Tạo vai trò mới thành công!')
      setCreateModalOpen(false)
      setCreateForm({ code: '', name: '', description: '', level: 10 })
      fetchAllRolesAndPermissions(true)
    } catch {
      toast.error('Lỗi hệ thống khi tạo vai trò')
    } finally {
      setCreating(false)
    }
  }

  // Delete Role
  const handleDeleteRole = async (role: Role) => {
    setActionMenuOpen(null)
    if (PREDEFINED_SYSTEM_ROLES.includes(role.code)) {
      toast.error(`Vai trò hệ thống "${role.name}" được bảo vệ và không thể xóa.`)
      return
    }

    if (role.userCount > 0) {
      toast.error(
        `Không thể xóa vai trò này vì đang có ${role.userCount} thành viên được gán. Vui lòng chuyển vai trò của họ trước.`
      )
      return
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}" khỏi hệ thống?`)) {
      return
    }

    try {
      const res = await fetch(`/api/system/roles/${role.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error()
      toast.success('Xóa vai trò thành công')
      if (editingRole?.id === role.id) {
        setDrawerOpen(false)
        setEditingRole(null)
      }
      fetchAllRolesAndPermissions(true)
    } catch {
      toast.error('Xóa vai trò thất bại')
    }
  }

  // Helper: check if role is predefined
  const isSystemRole = (code: string) => PREDEFINED_SYSTEM_ROLES.includes(code)

  // Dynamic calculations for Stats Cards
  const stats = {
    total: roles.length,
    active: roles.filter((r) => r.status === 'ACTIVE').length,
    system: roles.filter((r) => isSystemRole(r.code)).length,
    custom: roles.filter((r) => !isSystemRole(r.code)).length,
  }

  // Filters for Roles List
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(rolesSearch.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(rolesSearch.toLowerCase())) ||
      role.code.toLowerCase().includes(rolesSearch.toLowerCase())

    const matchesStatus =
      rolesStatusFilter === 'ALL' ||
      (rolesStatusFilter === 'ACTIVE' && role.status === 'ACTIVE') ||
      (rolesStatusFilter === 'INACTIVE' && role.status === 'INACTIVE')

    return matchesSearch && matchesStatus
  })

  // Paginated roles
  const totalRolesCount = filteredRoles.length
  const paginatedRoles = filteredRoles.slice(
    (rolesPage - 1) * rolesLimit,
    rolesPage * rolesLimit
  )

  // Get Initials for User Avatar in Logs
  const getUserInitials = (user: any) => {
    if (user.profile) {
      return `${user.profile.lastName.charAt(0)}${user.profile.firstName.charAt(0)}`.toUpperCase()
    }
    return user.username.slice(0, 2).toUpperCase()
  }

  // Format activity action nicely
  const formatAction = (action: string) => {
    const actionTranslations: Record<string, string> = {
      LOGIN: 'Đăng nhập',
      UPDATE_PROFILE: 'Cập nhật hồ sơ',
      UPDATE_USER_STATUS: 'Đổi trạng thái tài khoản',
      CHANGE_ROLE: 'Đổi vai trò',
      CREATE_USER: 'Tạo tài khoản',
      DELETE_USER: 'Xóa tài khoản',
      EXPORT_REPORT: 'Xuất báo cáo',
      APPROVE_BUDGET: 'Duyệt ngân sách',
      CREATE_TRANSACTION: 'Ghi nhận giao dịch',
      CREATE_ROLE: 'Tạo vai trò',
      UPDATE_ROLE_PERMISSIONS: 'Cấu hình quyền',
      DELETE_ROLE: 'Xóa vai trò',
    }
    return actionTranslations[action] || action
  }

  // Role Badge Styling
  const getRoleIconDetails = (code: string) => {
    switch (code) {
      case 'SUPER_ADMIN':
        return { color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20 dark:text-indigo-400 dark:bg-indigo-950/20', iconColor: 'bg-indigo-500' }
      case 'ADMIN':
        return { color: 'text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400 dark:bg-blue-950/20', iconColor: 'bg-blue-500' }
      case 'CHIEF_ACCOUNTANT':
        return { color: 'text-sky-600 bg-sky-500/10 border-sky-500/20 dark:text-sky-400 dark:bg-sky-950/20', iconColor: 'bg-sky-550' }
      case 'ACCOUNTANT':
        return { color: 'text-teal-600 bg-teal-500/10 border-teal-500/20 dark:text-teal-400 dark:bg-teal-950/20', iconColor: 'bg-teal-500' }
      case 'CASHIER':
        return { color: 'text-purple-600 bg-purple-500/10 border-purple-500/20 dark:text-purple-400 dark:bg-purple-950/20', iconColor: 'bg-purple-500' }
      default:
        return { color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-950/20', iconColor: 'bg-emerald-500' }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 text-zinc-900 dark:text-zinc-50 pb-10">
      {/* 1. Header (Redesigned matching premium mockup) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vai trò & quyền</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Quản lý các vai trò và phân quyền trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="relative hidden md:block w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm kiếm vai trò..."
              value={rolesSearch}
              onChange={(e) => {
                setRolesSearch(e.target.value)
                setRolesPage(1)
              }}
              className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-[#0c0c0e]"
            />
          </div>
          <button className="flex size-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950 transition dark:border-zinc-800 dark:bg-[#0c0c0e] dark:text-zinc-400 dark:hover:text-zinc-100">
            <Bell className="size-4" />
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow transition cursor-pointer"
          >
            <Plus className="size-4" />
            Thêm vai trò
          </button>
        </div>
      </div>

      {/* 2. Tabs Switcher */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('roles')}
          className={cn(
            "pb-3 relative transition",
            activeTab === 'roles'
              ? "text-blue-600 dark:text-blue-400"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          )}
        >
          Danh sách vai trò
          {activeTab === 'roles' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={cn(
            "pb-3 relative transition",
            activeTab === 'logs'
              ? "text-blue-600 dark:text-blue-400"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          )}
        >
          Nhật ký thay đổi
          {activeTab === 'logs' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
        </button>
      </div>

      {/* 3. Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] flex items-center gap-4 transition hover:shadow-md">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 dark:bg-blue-500/20">
            <Users className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tổng số vai trò</p>
            <h3 className="text-2xl font-bold mt-0.5">{stats.total}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Vai trò trong hệ thống</p>
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] flex items-center gap-4 transition hover:shadow-md">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Vai trò đang hoạt động</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 mt-0.5">{stats.active}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Đang được sử dụng</p>
          </div>
        </div>

        {/* Card 3: System Roles */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] flex items-center gap-4 transition hover:shadow-md">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
            <Lock className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Vai trò hệ thống</p>
            <h3 className="text-2xl font-bold mt-0.5 text-amber-600 dark:text-amber-550">{stats.system}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Không thể xóa</p>
          </div>
        </div>

        {/* Card 4: Custom Roles */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] flex items-center gap-4 transition hover:shadow-md">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 dark:bg-purple-500/20">
            <UserPlus className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Vai trò tùy chỉnh</p>
            <h3 className="text-2xl font-bold mt-0.5 text-purple-600 dark:text-purple-400">{stats.custom}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Có thể chỉnh sửa, xóa</p>
          </div>
        </div>
      </div>

      {activeTab === 'roles' ? (
        <>
          {/* 4. Toolbar: Search & Advanced Filters (Roles View) */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên vai trò, mô tả..."
                value={rolesSearch}
                onChange={(e) => {
                  setRolesSearch(e.target.value)
                  setRolesPage(1)
                }}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={rolesStatusFilter}
                onChange={(e) => {
                  setRolesStatusFilter(e.target.value as any)
                  setRolesPage(1)
                }}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-[#0c0c0e] text-zinc-700 dark:text-zinc-300"
              >
                <option value="ALL">Trạng thái: Tất cả</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Đã tắt</option>
              </select>

              <button className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#0c0c0e] dark:text-zinc-300 dark:hover:bg-zinc-900/40">
                <SlidersHorizontal className="size-4" />
                Bộ lọc
              </button>

              <button
                onClick={() => fetchAllRolesAndPermissions(true)}
                className="flex size-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-950 transition dark:border-zinc-800 dark:bg-[#0c0c0e] dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <RefreshCw className="size-4" />
              </button>
            </div>
          </div>

          {/* 5. Roles Table List */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <th className="p-4 pl-6">Tên vai trò</th>
                    <th className="p-4">Mô tả</th>
                    <th className="p-4">Loại vai trò</th>
                    <th className="p-4">Số người dùng</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center pr-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <Loader2 className="size-6 animate-spin text-zinc-400 mx-auto" />
                        <p className="text-sm text-zinc-500 mt-2">Đang tải cấu hình vai trò & quyền hạn...</p>
                      </td>
                    </tr>
                  ) : paginatedRoles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-sm text-zinc-500">
                        Không tìm thấy vai trò nào khớp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    paginatedRoles.map((role) => {
                      const isSys = isSystemRole(role.code)
                      const isAct = role.status === 'ACTIVE'
                      const styling = getRoleIconDetails(role.code)

                      return (
                        <tr
                          key={role.id}
                          onClick={() => handleOpenDrawer(role, 'info')}
                          className="group hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 cursor-pointer transition"
                        >
                          {/* Role Icon and Name */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "size-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner",
                                styling.iconColor
                              )}>
                                <Shield className="size-5" />
                              </div>
                              <div>
                                <span className="font-semibold text-zinc-950 dark:text-zinc-50 block leading-tight">
                                  {role.name}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5 block">
                                  {role.code}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Description */}
                          <td className="p-4 text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                            {role.description || 'Không có mô tả chi tiết'}
                          </td>

                          {/* Role Type Tag */}
                          <td className="p-4">
                            <span className={cn(
                              "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border shadow-inner",
                              isSys
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-550/20 dark:text-blue-400"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400"
                            )}>
                              {isSys ? 'Hệ thống' : 'Tùy chỉnh'}
                            </span>
                          </td>

                          {/* User Count */}
                          <td className="p-4 text-zinc-700 dark:text-zinc-300 font-medium">
                            {role.userCount} người dùng
                          </td>

                          {/* Status Badge */}
                          <td className="p-4">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border",
                              isAct
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-550/20 dark:text-emerald-400"
                                : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:bg-zinc-500/20 dark:text-zinc-400"
                            )}>
                              <span className={cn(
                                "size-1.5 rounded-full shrink-0",
                                isAct ? "bg-emerald-500 dark:bg-emerald-450" : "bg-zinc-400"
                              )} />
                              {isAct ? 'Đang hoạt động' : 'Đã tắt'}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-4 text-center pr-6" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-block text-left">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleOpenDrawer(role, 'permissions')}
                                  title="Quản lý ma trận quyền hạn"
                                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                                >
                                  <Eye className="size-4" />
                                </button>
                                <button
                                  onClick={() => setActionMenuOpen(actionMenuOpen === role.id ? null : role.id)}
                                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                                >
                                  <MoreVertical className="size-4" />
                                </button>
                              </div>

                              {actionMenuOpen === role.id && (
                                <div className="absolute right-0 mt-1 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-[#0c0c0e] z-50 animate-in fade-in slide-in-from-top-1">
                                  <button
                                    onClick={() => handleOpenDrawer(role, 'info')}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-zinc-750 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                                  >
                                    <Info className="size-3.5" />
                                    Xem chi tiết
                                  </button>
                                  <button
                                    onClick={() => handleOpenDrawer(role, 'permissions')}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20 transition"
                                  >
                                    <ShieldAlert className="size-3.5" />
                                    Phân quyền
                                  </button>
                                  {!isSys && (
                                    <button
                                      onClick={() => handleDeleteRole(role)}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 border-t border-zinc-100 dark:border-zinc-800/80 transition"
                                    >
                                      <Trash2 className="size-3.5" />
                                      Xóa vai trò
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
            {totalRolesCount > rolesLimit && (
              <div className="flex items-center justify-between border-t border-zinc-200 p-4 dark:border-zinc-800">
                <span className="text-xs text-zinc-500">
                  Hiển thị {Math.min(totalRolesCount, (rolesPage - 1) * rolesLimit + 1)} - {Math.min(totalRolesCount, rolesPage * rolesLimit)} trong {totalRolesCount} vai trò
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={rolesPage === 1}
                    onClick={() => setRolesPage(rolesPage - 1)}
                    className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="text-xs font-bold bg-blue-600 text-white rounded-md size-7 flex items-center justify-center shadow">
                    {rolesPage}
                  </span>
                  <button
                    disabled={rolesPage * rolesLimit >= totalRolesCount}
                    onClick={() => setRolesPage(rolesPage + 1)}
                    className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition cursor-pointer"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* 6. Activity Logs Tab Interface */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Tìm theo người dùng, hành động..."
                value={logsSearch}
                onChange={(e) => {
                  setLogsSearch(e.target.value)
                  setLogsPage(1)
                }}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
              />
            </div>
            <button
              onClick={() => fetchActivityLogs()}
              className="flex size-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-950 transition dark:border-zinc-800 dark:bg-[#0c0c0e] dark:text-zinc-400 dark:hover:text-zinc-100 self-end sm:self-center"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <th className="p-4 pl-6">Người thực hiện</th>
                    <th className="p-4">Hành động</th>
                    <th className="p-4">Chi tiết thay đổi</th>
                    <th className="p-4">Địa chỉ IP</th>
                    <th className="p-4 pr-6">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {logsLoading ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <Loader2 className="size-6 animate-spin text-zinc-400 mx-auto" />
                        <p className="text-sm text-zinc-500 mt-2">Đang tải nhật ký hoạt động...</p>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-sm text-zinc-500">
                        Không tìm thấy nhật ký hoạt động nào.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const profile = log.user?.profile
                      const name = profile ? `${profile.lastName} ${profile.firstName}` : log.user?.username
                      
                      return (
                        <tr key={log.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition">
                          {/* User Avatar + Info */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center font-bold text-xs text-white shadow-inner">
                                {getUserInitials(log.user)}
                              </div>
                              <div>
                                <span className="font-semibold text-zinc-950 dark:text-zinc-50 block leading-tight">
                                  {name}
                                </span>
                                <span className="text-xs text-zinc-500 mt-0.5 block">
                                  {log.user?.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Action Tag */}
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 text-xs font-bold dark:bg-zinc-850 dark:text-zinc-200 dark:border-zinc-800">
                              <Clock className="size-3 shrink-0 text-zinc-500" />
                              {formatAction(log.action)}
                            </span>
                          </td>

                          {/* Details */}
                          <td className="p-4 text-zinc-600 dark:text-zinc-450 max-w-sm truncate">
                            {log.details || 'Không có mô tả chi tiết'}
                          </td>

                          {/* IP Address */}
                          <td className="p-4 text-xs font-mono text-zinc-500">
                            {log.ipAddress || '—'}
                          </td>

                          {/* Timestamp */}
                          <td className="p-4 pr-6 text-zinc-550 dark:text-zinc-400 text-xs">
                            {new Date(log.createdAt).toLocaleString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Logs Pagination */}
            {logsTotal > logsLimit && (
              <div className="flex items-center justify-between border-t border-zinc-200 p-4 dark:border-zinc-800">
                <span className="text-xs text-zinc-500">
                  Hiển thị {Math.min(logsTotal, (logsPage - 1) * logsLimit + 1)} - {Math.min(logsTotal, logsPage * logsLimit)} trong {logsTotal} bản ghi nhật ký
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={logsPage === 1}
                    onClick={() => setLogsPage(logsPage - 1)}
                    className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="text-xs font-bold bg-blue-600 text-white rounded-md size-7 flex items-center justify-center shadow">
                    {logsPage}
                  </span>
                  <button
                    disabled={logsPage * logsLimit >= logsTotal}
                    onClick={() => setLogsPage(logsPage + 1)}
                    className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition cursor-pointer"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* =========================================================
          SLIDE-OVER DRAWER (MATRIX PERMISSIONS AND DETAIL VIEW)
          ========================================================= */}
      {drawerOpen && editingRole && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop blur */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Slide-over drawer container */}
          <div className="relative z-10 w-full max-w-xl h-full bg-white dark:bg-[#0c0c0e] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col p-6 overflow-hidden animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-zinc-150 pb-4 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "size-12 rounded-full flex items-center justify-center font-bold text-white shadow",
                  getRoleIconDetails(editingRole.code).iconColor
                )}>
                  <Shield className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    {editingRole.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                      Mã: {editingRole.code}
                    </span>
                    <span className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <span className={cn(
                      "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border leading-none shadow-inner",
                      isSystemRole(editingRole.code)
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-550/20 dark:text-blue-400"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400"
                    )}>
                      {isSystemRole(editingRole.code) ? 'Hệ thống' : 'Tùy chỉnh'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                  editingRole.status === 'ACTIVE'
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-550/20 dark:text-emerald-400"
                    : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:bg-zinc-500/20 dark:text-zinc-400"
                )}>
                  {editingRole.status === 'ACTIVE' ? 'Hoạt động' : 'Tắt'}
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Drawer Tab Switcher */}
            <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800/60 mt-4 text-xs font-bold uppercase tracking-wider text-zinc-500 pb-2 shrink-0">
              <button
                onClick={() => setDrawerTab('info')}
                className={cn(
                  "pb-1 relative transition",
                  drawerTab === 'info'
                    ? "text-blue-600 dark:text-blue-400"
                    : "hover:text-zinc-950 dark:hover:text-zinc-100"
                )}
              >
                Thông tin vai trò
                {drawerTab === 'info' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setDrawerTab('permissions')}
                className={cn(
                  "pb-1 relative transition",
                  drawerTab === 'permissions'
                    ? "text-blue-600 dark:text-blue-400"
                    : "hover:text-zinc-950 dark:hover:text-zinc-100"
                )}
              >
                Ma trận quyền hạn
                {drawerTab === 'permissions' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto mt-4 pr-1">
              {drawerTab === 'info' ? (
                /* TAB 1: BASIC DETAILS AND METADATA EDIT */
                <form onSubmit={handleSaveRoleDetails} className="space-y-5">
                  <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/20 space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 mb-1 block dark:text-zinc-400">Tên vai trò</label>
                      <input
                        type="text"
                        required
                        disabled={isSystemRole(editingRole.code)}
                        value={roleForm.name}
                        onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-zinc-100/60 dark:border-zinc-800 dark:bg-[#0c0c0e] dark:disabled:bg-zinc-900/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-zinc-500 mb-1 block dark:text-zinc-400">Cấp bậc (Level)</label>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          required
                          disabled={isSystemRole(editingRole.code)}
                          value={roleForm.level}
                          onChange={(e) => setRoleForm({ ...roleForm, level: parseInt(e.target.value, 10) })}
                          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-zinc-100/60 dark:border-zinc-800 dark:bg-[#0c0c0e] dark:disabled:bg-zinc-900/50"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[10px] text-zinc-400 italic leading-tight mt-3 block">
                          * Level dùng để so sánh quyền hạn. Chỉ vai trò cấp cao mới gán được vai trò cấp dưới.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 mb-1 block dark:text-zinc-400">Mô tả chi tiết</label>
                      <textarea
                        disabled={isSystemRole(editingRole.code)}
                        value={roleForm.description}
                        onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                        rows={4}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none disabled:bg-zinc-100/60 dark:border-zinc-800 dark:bg-[#0c0c0e] dark:disabled:bg-zinc-900/50"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-blue-500/5 border-blue-500/10 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                      <Users className="size-5 shrink-0" />
                      <div>
                        <span className="font-bold block">{editingRole.userCount} thành viên</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Đang được gán vai trò này</span>
                      </div>
                    </div>
                  </div>

                  {!isSystemRole(editingRole.code) && (
                    <div className="flex justify-end pt-3">
                      <button
                        type="submit"
                        disabled={savingRoleDetails}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow transition disabled:opacity-50 cursor-pointer"
                      >
                        {savingRoleDetails ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Edit3 className="size-3.5" />
                        )}
                        Lưu thông tin vai trò
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                /* TAB 2: PERMISSION MATRIX EDIT GRID */
                <div className="space-y-6 flex flex-col h-full">
                  <div className="flex items-center justify-between shrink-0">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Tích chọn các ô dưới đây để gán quyền thao tác cụ thể cho vai trò này.
                    </p>
                    <button
                      onClick={handleSaveRolePermissions}
                      disabled={savingPermissions || editingRole.code === 'SUPER_ADMIN'}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow transition disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {savingPermissions ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Save className="size-3.5" />
                      )}
                      Lưu cấu hình
                    </button>
                  </div>

                  {editingRole.code === 'SUPER_ADMIN' ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-indigo-500/30 rounded-2xl bg-indigo-500/5 text-center mt-4">
                      <ShieldAlert className="size-12 text-indigo-500 mb-3 animate-pulse" />
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Đặc quyền Super Admin tối cao</h4>
                      <p className="text-xs text-zinc-500 text-center max-w-sm mt-1 leading-relaxed">
                        Vai trò <strong>Super Administrator</strong> sở hữu toàn bộ các đặc quyền của hệ thống nhằm bảo toàn tính toàn vẹn của nền tảng và không thể bị sửa đổi.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5 pb-6">
                      {getGroupedPermissions().map(([moduleKey, group]) => {
                        const groupCodes = group.permissions.map((p) => p.id)
                        const isAllChecked = groupCodes.every((id) => checkedPermissionIds.includes(id))

                        const handleToggleGroup = () => {
                          if (isAllChecked) {
                            setCheckedPermissionIds((prev) => prev.filter((id) => !groupCodes.includes(id)))
                          } else {
                            setCheckedPermissionIds((prev) => {
                              const newChecked = [...prev]
                              groupCodes.forEach((id) => {
                                if (!newChecked.includes(id)) newChecked.push(id)
                              })
                              return newChecked
                            })
                          }
                        }

                        return (
                          <div
                            key={moduleKey}
                            className="space-y-2 border border-zinc-150 dark:border-zinc-800/80 rounded-xl p-4 bg-zinc-50/40 dark:bg-zinc-900/10"
                          >
                            {/* Module Header */}
                            <div className="flex items-center justify-between border-b border-zinc-150/70 pb-2 dark:border-zinc-800/60">
                              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                                {group.label}
                              </span>
                              <button
                                onClick={handleToggleGroup}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 uppercase tracking-wider"
                              >
                                {isAllChecked ? 'Hủy chọn tất cả' : 'Chọn tất cả'}
                              </button>
                            </div>

                            {/* Permission Items Checkboxes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              {group.permissions.map((p) => {
                                const isChecked = checkedPermissionIds.includes(p.id)
                                return (
                                  <div
                                    key={p.id}
                                    onClick={() => handleTogglePermission(p.id)}
                                    className={cn(
                                      "flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition shadow-sm",
                                      isChecked
                                        ? "border-blue-500 bg-blue-50/10 text-zinc-950 dark:bg-blue-950/10 dark:text-zinc-50"
                                        : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-600 dark:border-zinc-800 dark:bg-[#0c0c0e] dark:text-zinc-400 dark:hover:border-zinc-700"
                                    )}
                                  >
                                    {isChecked ? (
                                      <CheckSquare className="size-4 shrink-0 text-blue-600 dark:text-blue-500" />
                                    ) : (
                                      <Square className="size-4 shrink-0 text-zinc-300 dark:text-zinc-650" />
                                    )}
                                    <div>
                                      <span className="text-xs font-semibold block leading-tight">
                                        {p.name}
                                      </span>
                                      <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 mt-0.5 block">
                                        {p.code}
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          CREATE ROLE MODAL
          ========================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setCreateModalOpen(false)}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-[#0c0c0e] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-4 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">Thêm vai trò hệ thống mới</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1 block dark:text-zinc-400">Tên vai trò</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Kế toán trưởng"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1 block dark:text-zinc-400">Mã vai trò (IN HOA)</label>
                <input
                  type="text"
                  required
                  value={createForm.code}
                  onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                  placeholder="CHIEF_ACCOUNTANT"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1 block dark:text-zinc-400">Cấp bậc (Level)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={createForm.level}
                    onChange={(e) => setCreateForm({ ...createForm, level: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <span className="text-[10px] text-zinc-400 italic block mb-1">
                    * Cấp bậc cao hơn có thể quản lý được cấp bậc thấp hơn.
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1 block dark:text-zinc-400">Mô tả vai trò</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Vai trò quản lý phê duyệt ngân sách và đối soát thu chi."
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-150 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition cursor-pointer dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold shadow transition cursor-pointer disabled:opacity-50"
                >
                  {creating && <Loader2 className="size-4 animate-spin" />}
                  Tạo vai trò
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
