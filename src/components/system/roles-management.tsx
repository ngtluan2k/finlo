'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
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
import { toCode } from '@/lib/string'

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
  const t = useTranslations('system.roles')
  const tCommon = useTranslations('system.common')
  const locale = useLocale()

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
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false)
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
  const [createCheckedPermissionIds, setCreateCheckedPermissionIds] = useState<string[]>([])
  const [createSearchQuery, setCreateSearchQuery] = useState('')
  const [quickSelectOpen, setQuickSelectOpen] = useState(false)
  const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false)
  const [createForm, setCreateForm] = useState({
    code: '',
    name: '',
    description: '',
    level: 10,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
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
      toast.error(t('messages.fetchFailed'))
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
      toast.error(t('messages.fetchLogsFailed'))
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
      wallet: { label: t('drawer.modules.wallet'), permissions: [] },
      transaction: { label: t('drawer.modules.transaction'), permissions: [] },
      budget: { label: t('drawer.modules.budget'), permissions: [] },
      category: { label: t('drawer.modules.category'), permissions: [] },
      user: { label: t('drawer.modules.user'), permissions: [] },
      role: { label: t('drawer.modules.role'), permissions: [] },
      permission: { label: t('drawer.modules.permission'), permissions: [] },
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
      toast.success(t('messages.updateSuccess'))
      fetchAllRolesAndPermissions(false)
    } catch {
      toast.error(t('messages.updateFailed'))
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
      toast.success(t('messages.updateMatrixSuccess'))
      fetchAllRolesAndPermissions(false)
    } catch {
      toast.error(t('messages.updateMatrixFailed'))
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

  // Slugify helper using unified utility library
  const slugifyRoleName = toCode

  // Open Create Modal and reset all states cleanly
  const handleOpenCreateModal = () => {
    setCreateForm({
      code: '',
      name: '',
      description: '',
      level: 10,
      status: 'ACTIVE',
    })
    setCreateCheckedPermissionIds([])
    setCreateSearchQuery('')
    setIsCodeManuallyEdited(false)
    setCreateModalOpen(true)
  }

  // Localized name/description mapper helper for permissions
  const getPermissionLocaleInfo = (code: string, originalName: string) => {
    const enMap: Record<string, { name: string; desc: string }> = {
      'wallet:read': { name: 'View Overview', desc: 'View financial overview dashboard information' },
      'wallet:create': { name: 'Create Wallets', desc: 'Create new wallet accounts' },
      'wallet:update': { name: 'Update Wallets', desc: 'Update existing wallet information' },
      'wallet:delete': { name: 'Delete Wallets', desc: 'Remove wallets from the system' },
      'category:read': { name: 'View Categories', desc: 'View list of income/expense categories' },
      'category:create': { name: 'Create Categories', desc: 'Create new categories' },
      'category:update': { name: 'Update Categories', desc: 'Modify existing category details' },
      'category:delete': { name: 'Delete Categories', desc: 'Delete custom categories' },
      'transaction:read': { name: 'View Cashflow', desc: 'View list of cashflow transactions' },
      'transaction:create': { name: 'Create Transactions', desc: 'Record new income or expense transactions' },
      'transaction:update': { name: 'Update Transactions', desc: 'Edit existing cashflow records' },
      'transaction:delete': { name: 'Delete Transactions', desc: 'Delete cashflow transactions' },
      'budget:read': { name: 'View Reports & Budgets', desc: 'View budget configurations and financial reports' },
      'budget:create': { name: 'Create Budgets', desc: 'Configure spending budgets' },
      'budget:update': { name: 'Update Budgets', desc: 'Update budget targets' },
      'budget:delete': { name: 'Delete Budgets', desc: 'Remove budget setups' },
      'profile:read': { name: 'View Profile', desc: 'View personal user profile details' },
      'profile:update': { name: 'Update Profile', desc: 'Modify personal profile information' },
      'attachment:read': { name: 'View Attachments', desc: 'View files, receipts, and invoices' },
      'attachment:create': { name: 'Upload Attachments', desc: 'Upload new receipts and bills' },
      'attachment:delete': { name: 'Delete Attachments', desc: 'Delete uploaded attachment files' },
      'user:read': { name: 'View Members', desc: 'View administrative list of system members' },
      'user:manage': { name: 'Manage Members', desc: 'Perform administrative user operations (create, lock, role changes)' },
      'role:read': { name: 'View Roles', desc: 'View security roles and matrices' },
      'role:manage': { name: 'Manage Roles', desc: 'Create, update permission configurations, and delete roles' },
      'permission:read': { name: 'View System Settings', desc: 'View detailed security permissions configurations' }
    }

    const viMap: Record<string, { name: string; desc: string }> = {
      'wallet:read': { name: 'Xem tổng quan', desc: 'Xem thông tin tổng quan tài chính' },
      'wallet:create': { name: 'Tạo ví', desc: 'Tạo tài khoản ví mới' },
      'wallet:update': { name: 'Sửa ví', desc: 'Cập nhật thông tin ví' },
      'wallet:delete': { name: 'Xóa ví', desc: 'Xóa ví khỏi hệ thống' },
      'category:read': { name: 'Xem danh mục', desc: 'Xem danh sách danh mục thu chi' },
      'category:create': { name: 'Thêm danh mục', desc: 'Thêm danh mục mới' },
      'category:update': { name: 'Sửa danh mục', desc: 'Chỉnh sửa danh mục' },
      'category:delete': { name: 'Xóa danh mục', desc: 'Xóa danh mục' },
      'transaction:read': { name: 'Xem thu chi', desc: 'Xem danh sách thu chi' },
      'transaction:create': { name: 'Thêm thu chi', desc: 'Tạo mới giao dịch thu chi' },
      'transaction:update': { name: 'Sửa thu chi', desc: 'Chỉnh sửa giao dịch thu chi' },
      'transaction:delete': { name: 'Xóa thu chi', desc: 'Xóa giao dịch thu chi' },
      'budget:read': { name: 'Xem báo cáo & ngân sách', desc: 'Xem các báo cáo tài chính và ngân sách' },
      'budget:create': { name: 'Thiết lập ngân sách', desc: 'Tạo mới ngân sách chi tiêu' },
      'budget:update': { name: 'Cập nhật ngân sách', desc: 'Chỉnh sửa ngân sách' },
      'budget:delete': { name: 'Xóa ngân sách', desc: 'Xóa ngân sách chi tiêu' },
      'profile:read': { name: 'Xem hồ sơ', desc: 'Xem hồ sơ cá nhân của người dùng' },
      'profile:update': { name: 'Cập nhật hồ sơ', desc: 'Thay đổi thông tin hồ sơ' },
      'attachment:read': { name: 'Xem tệp đính kèm', desc: 'Xem hóa đơn chứng từ đính kèm' },
      'attachment:create': { name: 'Tải lên tệp đính kèm', desc: 'Tải lên tài liệu chứng từ mới' },
      'attachment:delete': { name: 'Xóa tệp đính kèm', desc: 'Xóa tệp chứng từ khỏi hệ thống' },
      'user:read': { name: 'Xem thành viên', desc: 'Xem danh sách thành viên hệ thống' },
      'user:manage': { name: 'Quản lý thành viên', desc: 'Thao tác phê duyệt, khóa, gán vai trò người dùng' },
      'role:read': { name: 'Xem vai trò', desc: 'Xem thông tin vai trò bảo mật' },
      'role:manage': { name: 'Quản lý vai trò', desc: 'Tạo mới, sửa đổi ma trận quyền hạn, xóa vai trò' },
      'permission:read': { name: 'Xem phân quyền hệ thống', desc: 'Xem danh sách quyền hạn chi tiết' }
    }

    const localeMap = locale === 'vi' ? viMap : enMap
    return localeMap[code] || { name: originalName, desc: '' }
  }

  // Get index position for checkboxes in matrix (Xem, Thêm, Sửa, Xóa, Xuất)
  const getActionColumnIndex = (action: string) => {
    switch (action.toLowerCase()) {
      case 'read':
        return 0
      case 'create':
        return 1
      case 'update':
        return 2
      case 'delete':
        return 3
      default:
        return 4 // export, approve, manage, etc.
    }
  }

  // Group and search permissions inside modal
  const getGroupedPermissionsForModal = () => {
    const modules: Record<string, { label: string; icon: any; permissions: Permission[] }> = {
      wallet: { label: locale === 'vi' ? 'Tổng quan' : 'Overview', icon: Shield, permissions: [] },
      transaction: { label: locale === 'vi' ? 'Thu chi' : 'Cashflow', icon: RefreshCw, permissions: [] },
      budget: { label: locale === 'vi' ? 'Báo cáo & Ngân sách' : 'Reports & Budgets', icon: SlidersHorizontal, permissions: [] },
      category: { label: locale === 'vi' ? 'Danh mục' : 'Categories', icon: SlidersHorizontal, permissions: [] },
      attachment: { label: locale === 'vi' ? 'Đính kèm' : 'Attachments', icon: SlidersHorizontal, permissions: [] },
      user: { label: locale === 'vi' ? 'Thành viên' : 'Members', icon: Users, permissions: [] },
      role: { label: locale === 'vi' ? 'Vai trò & Quyền' : 'Roles & Permissions', icon: ShieldCheck, permissions: [] },
      permission: { label: locale === 'vi' ? 'Hệ thống' : 'System Settings', icon: SlidersHorizontal, permissions: [] },
      profile: { label: locale === 'vi' ? 'Hồ sơ cá nhân' : 'Personal Profile', icon: SlidersHorizontal, permissions: [] },
    }

    permissions.forEach((p) => {
      if (createSearchQuery) {
        const info = getPermissionLocaleInfo(p.code, p.name)
        const match =
          info.name.toLowerCase().includes(createSearchQuery.toLowerCase()) ||
          info.desc.toLowerCase().includes(createSearchQuery.toLowerCase()) ||
          p.code.toLowerCase().includes(createSearchQuery.toLowerCase())
        if (!match) return
      }

      if (modules[p.module]) {
        modules[p.module].permissions.push(p)
      } else {
        if (!modules[p.module]) {
          modules[p.module] = { label: p.module.toUpperCase(), icon: SlidersHorizontal, permissions: [] }
        }
        modules[p.module].permissions.push(p)
      }
    })

    return Object.entries(modules).filter(([_, group]) => group.permissions.length > 0)
  }

  // Toggle single permission for new role creation
  const handleToggleCreatePermission = (id: string) => {
    setCreateCheckedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Toggle all visible/filtered permissions in modal
  const handleToggleAllCreatePermissions = () => {
    const filteredPermissions = getGroupedPermissionsForModal().flatMap(([_, group]) => group.permissions)
    const filteredIds = filteredPermissions.map((p) => p.id)
    const isAllChecked = filteredIds.every((id) => createCheckedPermissionIds.includes(id))

    if (isAllChecked) {
      setCreateCheckedPermissionIds((prev) => prev.filter((id) => !filteredIds.includes(id)))
    } else {
      setCreateCheckedPermissionIds((prev) => {
        const newChecked = [...prev]
        filteredIds.forEach((id) => {
          if (!newChecked.includes(id)) newChecked.push(id)
        })
        return newChecked
      })
    }
  }

  // Quick select helper in modal
  const handleQuickSelect = (type: 'all' | 'none' | 'readOnly') => {
    setQuickSelectOpen(false)
    if (type === 'all') {
      setCreateCheckedPermissionIds(permissions.map((p) => p.id))
      toast.success(locale === 'vi' ? 'Đã chọn toàn bộ quyền hạn!' : 'Selected all permissions!')
    } else if (type === 'none') {
      setCreateCheckedPermissionIds([])
      toast.success(locale === 'vi' ? 'Đã hủy chọn toàn bộ!' : 'Cleared all permissions!')
    } else if (type === 'readOnly') {
      const readOnlyIds = permissions.filter((p) => p.action.toLowerCase() === 'read').map((p) => p.id)
      setCreateCheckedPermissionIds(readOnlyIds)
      toast.success(locale === 'vi' ? 'Đã kích hoạt chế độ chỉ xem!' : 'Activated read-only privileges!')
    }
  }

  // Create new Role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/system/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          permissionIds: createCheckedPermissionIds,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'ROLE_CODE_EXISTS') {
          toast.error(t('messages.codeExists'))
        } else {
          toast.error(t('messages.createFailed'))
        }
        return
      }
      toast.success(t('messages.createSuccess'))
      setCreateModalOpen(false)
      setCreateForm({ code: '', name: '', description: '', level: 10, status: 'ACTIVE' })
      setCreateCheckedPermissionIds([])
      setCreateSearchQuery('')
      setIsCodeManuallyEdited(false)
      fetchAllRolesAndPermissions(true)
    } catch {
      toast.error(t('messages.systemError'))
    } finally {
      setCreating(false)
    }
  }

  // Delete Role
  const handleDeleteRole = async (role: Role) => {
    setActionMenuOpen(null)
    if (PREDEFINED_SYSTEM_ROLES.includes(role.code)) {
      toast.error(t('messages.protectedRole', { name: translateRoleName(role.code, role.name) }))
      return
    }

    if (role.userCount > 0) {
      toast.error(t('messages.assignedMembers', { count: role.userCount }))
      return
    }

    if (!confirm(t('messages.confirmDelete', { name: translateRoleName(role.code, role.name) }))) {
      return
    }

    try {
      const res = await fetch(`/api/system/roles/${role.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error()
      toast.success(t('messages.deleteSuccess'))
      if (editingRole?.id === role.id) {
        setDrawerOpen(false)
        setEditingRole(null)
      }
      fetchAllRolesAndPermissions(true)
    } catch {
      toast.error(t('messages.deleteFailed'))
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

  // Translate role name
  const translateRoleName = (code: string, fallbackName: string) => {
    return tCommon.has(`roles.${code}`) ? tCommon(`roles.${code}`) : fallbackName
  }

  // Format activity action nicely
  const formatAction = (action: string) => {
    return tCommon.has(`actions.${action}`) ? tCommon(`actions.${action}`) : action
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
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="relative hidden md:block w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
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
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow transition cursor-pointer"
          >
            <Plus className="size-4" />
            {t('addRole')}
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
          {t('tabList')}
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
          {t('tabLogs')}
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
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('stats.total')}</p>
            <h3 className="text-2xl font-bold mt-0.5">{stats.total}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">{t('stats.totalDesc')}</p>
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] flex items-center gap-4 transition hover:shadow-md">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('stats.active')}</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 mt-0.5">{stats.active}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">{t('stats.activeDesc')}</p>
          </div>
        </div>

        {/* Card 3: System Roles */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] flex items-center gap-4 transition hover:shadow-md">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
            <Lock className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('stats.system')}</p>
            <h3 className="text-2xl font-bold mt-0.5 text-amber-600 dark:text-amber-550">{stats.system}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">{t('stats.systemDesc')}</p>
          </div>
        </div>

        {/* Card 4: Custom Roles */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] flex items-center gap-4 transition hover:shadow-md">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 dark:bg-purple-500/20">
            <UserPlus className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('stats.custom')}</p>
            <h3 className="text-2xl font-bold mt-0.5 text-purple-600 dark:text-purple-400">{stats.custom}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">{t('stats.customDesc')}</p>
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
                placeholder={t('searchPlaceholder')}
                value={rolesSearch}
                onChange={(e) => {
                  setRolesSearch(e.target.value)
                  setRolesPage(1)
                }}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                  className="flex items-center justify-between gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-[#0c0c0e] text-zinc-700 dark:text-zinc-300 select-none cursor-pointer"
                >
                  <span>
                    {rolesStatusFilter === 'ALL' && tCommon('statuses.all')}
                    {rolesStatusFilter === 'ACTIVE' && tCommon('statuses.ACTIVE')}
                    {rolesStatusFilter === 'INACTIVE' && tCommon('statuses.INACTIVE')}
                  </span>
                  <ChevronDown className="size-4 text-zinc-400 shrink-0 ml-0.5" />
                </button>

                {isStatusFilterOpen && (
                  <>
                    <div
                      onClick={() => setIsStatusFilterOpen(false)}
                      className="fixed inset-0 z-30"
                    />
                    <div className="absolute z-40 left-0 mt-1 min-w-[140px] rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl dark:border-zinc-850 dark:bg-[#0c0c0e] animate-in fade-in slide-in-from-top-1 duration-150">
                      {[
                        { val: 'ALL', label: tCommon('statuses.all') },
                        { val: 'ACTIVE', label: tCommon('statuses.ACTIVE') },
                        { val: 'INACTIVE', label: tCommon('statuses.INACTIVE') }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            setRolesStatusFilter(item.val as any)
                            setRolesPage(1)
                            setIsStatusFilterOpen(false)
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-left text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex items-center justify-between cursor-pointer",
                            rolesStatusFilter === item.val
                              ? "text-blue-600 bg-blue-50/20 dark:text-blue-400 dark:bg-blue-950/20"
                              : "text-zinc-700 dark:text-zinc-300"
                          )}
                        >
                          <span>{item.label}</span>
                          {rolesStatusFilter === item.val && <Check className="size-4 text-blue-600 dark:text-blue-400" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#0c0c0e] dark:text-zinc-300 dark:hover:bg-zinc-900/40">
                <SlidersHorizontal className="size-4" />
                {tCommon('filter')}
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
                    <th className="p-4 pl-6">{t('table.name')}</th>
                    <th className="p-4">{t('table.description')}</th>
                    <th className="p-4">{t('table.type')}</th>
                    <th className="p-4">{t('table.userCount', { count: '' }).replace('()', '').trim()}</th>
                    <th className="p-4">{t('table.status')}</th>
                    <th className="p-4 text-center pr-6">{t('table.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <Loader2 className="size-6 animate-spin text-zinc-400 mx-auto" />
                        <p className="text-sm text-zinc-500 mt-2">{t('table.loading')}</p>
                      </td>
                    </tr>
                  ) : paginatedRoles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-sm text-zinc-500">
                        {t('table.noRecords')}
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
                                  {translateRoleName(role.code, role.name)}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5 block">
                                  {role.code}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Description */}
                          <td className="p-4 text-zinc-650 dark:text-zinc-400 max-w-xs truncate">
                            {role.description || tCommon('noDetails')}
                          </td>

                          {/* Role Type Tag */}
                          <td className="p-4">
                            <span className={cn(
                              "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border shadow-inner",
                              isSys
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-550/20 dark:text-blue-400"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400"
                            )}>
                              {isSys ? tCommon('roles.system') : tCommon('roles.custom')}
                            </span>
                          </td>

                          {/* User Count */}
                          <td className="p-4 text-zinc-700 dark:text-zinc-300 font-medium">
                            {t('table.userCount', { count: role.userCount })}
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
                              {isAct ? tCommon('statuses.ACTIVE') : tCommon('statuses.INACTIVE')}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-4 text-center pr-6" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-block text-left">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleOpenDrawer(role, 'permissions')}
                                  title={t('table.matrixTooltip')}
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
                                    {t('table.viewDetail')}
                                  </button>
                                  <button
                                    onClick={() => handleOpenDrawer(role, 'permissions')}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20 transition"
                                  >
                                    <ShieldAlert className="size-3.5" />
                                    {t('table.setPermissions')}
                                  </button>
                                  {!isSys && (
                                    <button
                                      onClick={() => handleDeleteRole(role)}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 border-t border-zinc-100 dark:border-zinc-800/80 transition"
                                    >
                                      <Trash2 className="size-3.5" />
                                      {t('table.deleteRole')}
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
                  {t('table.pagination', {
                    start: Math.min(totalRolesCount, (rolesPage - 1) * rolesLimit + 1),
                    end: Math.min(totalRolesCount, rolesPage * rolesLimit),
                    total: totalRolesCount,
                  })}
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
                placeholder={t('logs.searchPlaceholder')}
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
                    <th className="p-4 pl-6">{t('logs.table.user')}</th>
                    <th className="p-4">{t('logs.table.action')}</th>
                    <th className="p-4">{t('logs.table.details')}</th>
                    <th className="p-4">{t('logs.table.ip')}</th>
                    <th className="p-4 pr-6">{t('logs.table.time')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {logsLoading ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <Loader2 className="size-6 animate-spin text-zinc-400 mx-auto" />
                        <p className="text-sm text-zinc-500 mt-2">{t('logs.table.loading')}</p>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-sm text-zinc-500">
                        {t('logs.table.noRecords')}
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
                          <td className="p-4 text-zinc-650 dark:text-zinc-450 max-w-sm truncate">
                            {log.details || tCommon('noDetails')}
                          </td>

                          {/* IP Address */}
                          <td className="p-4 text-xs font-mono text-zinc-500">
                            {log.ipAddress || '—'}
                          </td>

                          {/* Timestamp */}
                          <td className="p-4 pr-6 text-zinc-550 dark:text-zinc-400 text-xs">
                            {new Date(log.createdAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
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
                  {t('logs.table.pagination', {
                    start: Math.min(logsTotal, (logsPage - 1) * logsLimit + 1),
                    end: Math.min(logsTotal, logsPage * logsLimit),
                    total: logsTotal,
                  })}
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
                    {translateRoleName(editingRole.code, editingRole.name)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                      {t('drawer.code', { code: editingRole.code })}
                    </span>
                    <span className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <span className={cn(
                      "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border leading-none shadow-inner",
                      isSystemRole(editingRole.code)
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-550/20 dark:text-blue-400"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-550/20 dark:text-emerald-450"
                    )}>
                      {isSystemRole(editingRole.code) ? tCommon('roles.system') : tCommon('roles.custom')}
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
                  {editingRole.status === 'ACTIVE' ? tCommon('statuses.ACTIVE') : tCommon('statuses.INACTIVE')}
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
                {t('drawer.tabInfo')}
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
                {t('drawer.tabMatrix')}
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
                      <label className="text-xs font-semibold text-zinc-500 mb-1 block dark:text-zinc-400">{t('drawer.form.name')}</label>
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
                        <label className="text-xs font-semibold text-zinc-500 mb-1 block dark:text-zinc-400">{t('drawer.form.level')}</label>
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
                          {t('drawer.form.levelDesc')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 mb-1 block dark:text-zinc-400">{t('drawer.form.description')}</label>
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
                        <span className="font-bold block">{t('drawer.form.userCount', { count: editingRole.userCount })}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{t('drawer.form.userCountDesc')}</span>
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
                        {t('drawer.form.saveInfo')}
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                /* TAB 2: PERMISSION MATRIX EDIT GRID */
                <div className="space-y-6 flex flex-col h-full">
                  <div className="flex items-center justify-between shrink-0">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t('drawer.matrix.subtitle')}
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
                      {t('drawer.matrix.save')}
                    </button>
                  </div>

                  {editingRole.code === 'SUPER_ADMIN' ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-indigo-500/30 rounded-2xl bg-indigo-500/5 text-center mt-4">
                      <ShieldAlert className="size-12 text-indigo-500 mb-3 animate-pulse" />
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{t('drawer.matrix.superAdminTitle')}</h4>
                      <p className="text-xs text-zinc-500 text-center max-w-sm mt-1 leading-relaxed">
                        {t('drawer.matrix.superAdminDesc')}
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
                                {isAllChecked ? t('drawer.matrix.uncheckAll') : t('drawer.matrix.checkAll')}
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
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Content container */}
          <form
            onSubmit={handleCreateRole}
            className="relative z-10 w-full max-w-6xl h-[90vh] max-h-[850px] flex flex-col rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#0c0c0e] animate-in zoom-in-95 duration-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-150 dark:border-zinc-800 shrink-0 bg-zinc-50/50 dark:bg-[#09090b]/50">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                  {locale === 'vi' ? 'Thêm vai trò mới' : 'Add New Role'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {locale === 'vi' ? 'Tạo vai trò và thiết lập quyền hạn cho vai trò này' : 'Create role and configure its specific permission privileges'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-150 dark:hover:bg-zinc-800 text-zinc-450 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable layout with two columns) */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 min-h-0 bg-white dark:bg-[#0c0c0e]">
              {/* LEFT COLUMN: Role Information Form */}
              <div className="lg:col-span-4 space-y-5 flex flex-col pr-0 lg:pr-2 lg:border-r lg:border-zinc-100 dark:lg:border-zinc-800/50">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800/50 pb-2 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-blue-500" />
                  {locale === 'vi' ? 'Thông tin vai trò' : 'Role Information'}
                </h4>

                <div className="space-y-4">
                  {/* Role Name */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 mb-1.5 block dark:text-zinc-400">
                      {locale === 'vi' ? 'Tên vai trò' : 'Role Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => {
                        const newName = e.target.value
                        setCreateForm((prev) => {
                          const updated = { ...prev, name: newName }
                          // Auto-slugify if code is not manually edited
                          if (!isCodeManuallyEdited) {
                            updated.code = slugifyRoleName(newName)
                          }
                          return updated
                        })
                      }}
                      placeholder={locale === 'vi' ? 'Nhập tên vai trò' : 'Enter role name'}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-[#0c0c0e] focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      {locale === 'vi' ? 'VD: Kế toán, Thủ quỹ, Nhân viên...' : 'e.g. Accountant, Cashier, Staff...'}
                    </span>
                  </div>

                  {/* Role Code */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 mb-1.5 block dark:text-zinc-400">
                      {locale === 'vi' ? 'Mã vai trò' : 'Role Code'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.code}
                      onChange={(e) => {
                        setIsCodeManuallyEdited(true)
                        setCreateForm({ ...createForm, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })
                      }}
                      placeholder={locale === 'vi' ? 'Nhập mã vai trò' : 'Enter role code'}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-[#0c0c0e] focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      {locale === 'vi' ? 'VD: CHIEF_ACCOUNTANT, CASHIER...' : 'e.g. CHIEF_ACCOUNTANT, CASHIER...'}
                    </span>
                  </div>

                  {/* Level & Description */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 mb-1.5 block dark:text-zinc-400">
                        {locale === 'vi' ? 'Cấp độ bảo mật' : 'Role Level'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        required
                        value={createForm.level}
                        onChange={(e) => setCreateForm({ ...createForm, level: parseInt(e.target.value, 10) })}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-[#0c0c0e]"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <span className="text-[10px] text-zinc-400 italic block leading-tight mb-1">
                        {locale === 'vi' ? '* Cấp độ càng cao, quyền hạn vai trò càng lớn.' : '* Higher level denotes superior security authority.'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 mb-1.5 block dark:text-zinc-400">
                      {locale === 'vi' ? 'Mô tả vai trò' : 'Description'}
                    </label>
                    <div className="relative">
                      <textarea
                        value={createForm.description}
                        onChange={(e) => {
                          if (e.target.value.length <= 200) {
                            setCreateForm({ ...createForm, description: e.target.value })
                          }
                        }}
                        placeholder={locale === 'vi' ? 'Nhập mô tả vai trò' : 'Enter role description'}
                        rows={3}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-[#0c0c0e] resize-none pr-12 focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="absolute bottom-2 right-3 text-[9px] text-zinc-400 font-bold">
                        {createForm.description.length}/200
                      </span>
                    </div>
                  </div>

                  {/* Status Selection Card Row */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 mb-2 block dark:text-zinc-400">
                      {locale === 'vi' ? 'Trạng thái' : 'Status'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Active Status Card */}
                      <div
                        onClick={() => setCreateForm({ ...createForm, status: 'ACTIVE' })}
                        className={cn(
                          "flex flex-col p-3 rounded-xl border cursor-pointer select-none transition shadow-sm",
                          createForm.status === 'ACTIVE'
                            ? "border-blue-500 bg-blue-50/10 text-zinc-950 dark:bg-blue-950/10 dark:text-zinc-50"
                            : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-600 dark:border-zinc-800 dark:bg-[#0c0c0e] dark:text-zinc-400"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{locale === 'vi' ? 'Kích hoạt' : 'Active'}</span>
                          <span className={cn(
                            "size-3 rounded-full border flex items-center justify-center",
                            createForm.status === 'ACTIVE' ? "border-blue-500 bg-blue-500" : "border-zinc-300 dark:border-zinc-700"
                          )}>
                            {createForm.status === 'ACTIVE' && <span className="size-1 bg-white rounded-full" />}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 block leading-tight">
                          {locale === 'vi' ? 'Vai trò có thể sử dụng' : 'Role is active'}
                        </span>
                      </div>

                      {/* Inactive Status Card */}
                      <div
                        onClick={() => setCreateForm({ ...createForm, status: 'INACTIVE' })}
                        className={cn(
                          "flex flex-col p-3 rounded-xl border cursor-pointer select-none transition shadow-sm",
                          createForm.status === 'INACTIVE'
                            ? "border-blue-500 bg-blue-50/10 text-zinc-950 dark:bg-blue-950/10 dark:text-zinc-50"
                            : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-600 dark:border-zinc-800 dark:bg-[#0c0c0e] dark:text-zinc-400"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{locale === 'vi' ? 'Vô hiệu hóa' : 'Disabled'}</span>
                          <span className={cn(
                            "size-3 rounded-full border flex items-center justify-center",
                            createForm.status === 'INACTIVE' ? "border-blue-500 bg-blue-500" : "border-zinc-300 dark:border-zinc-700"
                          )}>
                            {createForm.status === 'INACTIVE' && <span className="size-1 bg-white rounded-full" />}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 block leading-tight">
                          {locale === 'vi' ? 'Tạm thời ngừng sử dụng' : 'Temporarily suspended'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Members (0) Card */}
                  <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/20 space-y-3">
                    <span className="text-xs font-bold text-zinc-750 dark:text-zinc-350 block">
                      {locale === 'vi' ? 'Thành viên (0)' : 'Members (0)'}
                    </span>
                    <p className="text-[10px] text-zinc-400 text-center py-2 leading-relaxed">
                      {locale === 'vi' ? 'Chưa có người dùng nào được gán vào vai trò này' : 'No users are currently assigned to this role'}
                    </p>
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 px-3 py-2 text-[10px] font-semibold transition cursor-not-allowed text-center"
                    >
                      + {locale === 'vi' ? 'Thêm thành viên' : 'Add member'}
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Permission Matrix grid */}
              <div className="lg:col-span-8 flex flex-col min-h-0">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2 shrink-0">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-blue-500" />
                      {locale === 'vi' ? 'Thiết lập quyền' : 'Configure Permissions'}
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {locale === 'vi' ? 'Chọn các quyền mà vai trò này được phép thực hiện' : 'Configure specific action privileges for this role'}
                    </p>
                  </div>

                  {/* Toolbar */}
                  <div className="flex items-center gap-2 relative">
                    {/* Quick Select Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setQuickSelectOpen(!quickSelectOpen)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 text-[10px] font-bold text-zinc-600 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-white dark:bg-[#0c0c0e] shadow-sm select-none transition cursor-pointer"
                      >
                        {locale === 'vi' ? 'Chọn nhanh' : 'Quick select'}
                        <ChevronDown className="size-3" />
                      </button>
                      
                      {quickSelectOpen && (
                        <>
                          <div
                            onClick={() => setQuickSelectOpen(false)}
                            className="fixed inset-0 z-10"
                          />
                          <div className="absolute right-0 mt-1 z-20 w-44 rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl dark:border-zinc-850 dark:bg-[#0c0c0e] animate-in fade-in slide-in-from-top-1 duration-150">
                            <button
                              type="button"
                              onClick={() => handleQuickSelect('all')}
                              className="w-full px-3 py-2 text-left text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/50 flex items-center gap-2 cursor-pointer"
                            >
                              <ShieldCheck className="size-3.5 text-blue-500" />
                              {locale === 'vi' ? 'Chọn tất cả' : 'Select all'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickSelect('readOnly')}
                              className="w-full px-3 py-2 text-left text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/50 flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="size-3.5 text-blue-500" />
                              {locale === 'vi' ? 'Chỉ xem' : 'Read-only'}
                            </button>
                            <hr className="my-1 border-zinc-100 dark:border-zinc-850" />
                            <button
                              type="button"
                              onClick={() => handleQuickSelect('none')}
                              className="w-full px-3 py-2 text-left text-[11px] font-semibold text-red-500 hover:bg-red-50/20 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer"
                            >
                              <X className="size-3.5" />
                              {locale === 'vi' ? 'Hủy chọn tất cả' : 'Clear all'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-toolbar: search and select all check */}
                <div className="flex items-center gap-4 py-3 border-b border-zinc-100 dark:border-zinc-850 shrink-0">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 size-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder={locale === 'vi' ? 'Tìm quyền...' : 'Search permissions...'}
                      value={createSearchQuery}
                      onChange={(e) => setCreateSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-8 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-[#0c0c0e] focus:ring-1 focus:ring-blue-500"
                    />
                    {createSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCreateSearchQuery('')}
                        className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>

                  {/* Select All Checkbox */}
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 select-none cursor-pointer">
                    <div
                      onClick={handleToggleAllCreatePermissions}
                      className="size-4 flex items-center justify-center rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0c0c0e] transition shadow-sm cursor-pointer"
                    >
                      {getGroupedPermissionsForModal().flatMap(([_, g]) => g.permissions).map(p => p.id).every(id => createCheckedPermissionIds.includes(id)) && (
                        <Check className="size-3 text-blue-600 dark:text-blue-500 font-extrabold" />
                      )}
                    </div>
                    {locale === 'vi' ? 'Chọn tất cả' : 'Select all'}
                  </label>
                </div>

                {/* MATRIX HEADERS TABLE ROW */}
                <div className="grid grid-cols-12 gap-2 text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 py-2.5 px-4 bg-zinc-50/50 dark:bg-[#09090b]/30 shrink-0 border-b border-zinc-100 dark:border-zinc-850">
                  <div className="col-span-7">{locale === 'vi' ? 'Hành động / Quyền' : 'Action / Scope'}</div>
                  <div className="col-span-1 text-center">{locale === 'vi' ? 'Xem' : 'View'}</div>
                  <div className="col-span-1 text-center">{locale === 'vi' ? 'Thêm' : 'Add'}</div>
                  <div className="col-span-1 text-center">{locale === 'vi' ? 'Sửa' : 'Edit'}</div>
                  <div className="col-span-1 text-center">{locale === 'vi' ? 'Xóa' : 'Delete'}</div>
                  <div className="col-span-1 text-center">{locale === 'vi' ? 'Xuất' : 'Export'}</div>
                </div>

                {/* SCROLLABLE MATRIX GRID BODY */}
                <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 py-3">
                  {getGroupedPermissionsForModal().length === 0 ? (
                    <div className="text-center text-zinc-400 text-xs py-8">
                      {tCommon('noRecords')}
                    </div>
                  ) : (
                    getGroupedPermissionsForModal().map(([moduleKey, group]) => {
                      const IconComponent = group.icon
                      return (
                        <div key={moduleKey} className="space-y-1">
                          {/* Module Accordion Section header */}
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-50/30 dark:bg-zinc-900/10 rounded-lg select-none">
                            <IconComponent className="size-3.5 text-zinc-400 dark:text-zinc-550 shrink-0" />
                            <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-350 uppercase tracking-wider">
                              {group.label}
                            </span>
                          </div>

                          {/* Row items */}
                          <div className="divide-y divide-zinc-100/50 dark:divide-zinc-800/30">
                            {group.permissions.map((p) => {
                              const isChecked = createCheckedPermissionIds.includes(p.id)
                              const targetColIndex = getActionColumnIndex(p.action)
                              const info = getPermissionLocaleInfo(p.code, p.name)

                              return (
                                <div
                                  key={p.id}
                                  className="grid grid-cols-12 gap-2 py-3 px-4 items-center hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 rounded-xl transition duration-150"
                                >
                                  {/* Scope Column */}
                                  <div className="col-span-7 pr-2">
                                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block leading-tight">
                                      {info.name}
                                    </span>
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 mt-0.5 block">
                                      {p.code}
                                    </span>
                                    {info.desc && (
                                      <span className="text-[9.5px] text-zinc-500 dark:text-zinc-500 mt-0.5 block leading-normal italic">
                                        {info.desc}
                                      </span>
                                    )}
                                  </div>

                                  {/* Render checkboxes / dashes under Columns */}
                                  {[0, 1, 2, 3, 4].map((colIndex) => {
                                    const isTarget = colIndex === targetColIndex
                                    return (
                                      <div
                                        key={colIndex}
                                        className="col-span-1 flex items-center justify-center"
                                      >
                                        {isTarget ? (
                                          <div
                                            onClick={() => handleToggleCreatePermission(p.id)}
                                            className={cn(
                                              "size-4 flex items-center justify-center rounded border transition shadow-sm cursor-pointer select-none",
                                              isChecked
                                                ? "border-blue-500 bg-blue-500 text-white"
                                                : "border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-[#0c0c0e] dark:hover:border-zinc-650"
                                            )}
                                          >
                                            {isChecked && <Check className="size-3 text-white font-extrabold" />}
                                          </div>
                                        ) : (
                                          <span className="text-zinc-300 dark:text-zinc-750 font-medium select-none">-</span>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-150 dark:border-zinc-800 shrink-0 bg-zinc-50/50 dark:bg-[#09090b]/50">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold hover:bg-zinc-100 text-zinc-700 transition cursor-pointer dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-zinc-350"
              >
                {locale === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold shadow transition cursor-pointer disabled:opacity-50"
              >
                {creating && <Loader2 className="size-3.5 animate-spin" />}
                {locale === 'vi' ? 'Lưu vai trò' : 'Save Role'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
