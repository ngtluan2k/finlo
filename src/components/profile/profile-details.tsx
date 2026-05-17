'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { toast } from 'sonner'
import {
  User,
  Shield,
  Activity,
  Lock,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  FileText,
  UserCheck,
  CheckCircle,
  Plus,
  Loader2,
  X,
  Laptop,
  Smartphone,
  Eye,
  EyeOff,
  Edit,
  ShieldCheck,
  Key,
  Sparkles,
  Globe,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrency } from '@/hooks/use-currency'
import { SUPPORTED_CURRENCIES } from '@/lib/currency'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'


type ProfileData = {
  firstName: string
  lastName: string
  displayName: string | null
  bio: string | null
  dateOfBirth: string | null
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null
  address: string | null
  city: string | null
  country: string | null
  locale: string
  timezone: string
  avatarUrl: string | null
  updatedAt: string
}

type RoleData = {
  id: string
  code: string
  name: string
  level: number
  description: string | null
}

type UserData = {
  id: string
  email: string
  phone: string | null
  username: string
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
  createdAt: string
  lastLoginAt: string | null
  profile: ProfileData | null
  roles: RoleData[]
  permissions: string[]
}

type StatsData = {
  logins: number
  operations: number
  created: number
  updated: number
}

type ActivityLogData = {
  id: string
  action: string
  details: string | null
  ipAddress: string | null
  createdAt: string
}

export function ProfileDetails() {
  const { data: session, update: updateSession } = useSession()
  const t = useTranslations('profile')
  const tCommon = useTranslations('system.common')
  const locale = useLocale()
  const { currency, updateCurrency } = useCurrency()

  const handleCurrencyChange = async (code: string) => {
    const success = await updateCurrency(code)
    if (success) {
      toast.success(locale === 'vi' ? 'Đã cập nhật tiền tệ mặc định thành công!' : 'Default currency updated successfully!')
    } else {
      toast.error(locale === 'vi' ? 'Cập nhật tiền tệ thất bại' : 'Failed to update currency')
    }
  }


  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    user: UserData
    stats: StatsData
    activityLogs: ActivityLogData[]
  } | null>(null)

  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'logs' | 'security'>('overview')
  const [editStep, setEditStep] = useState<1 | 2 | 3>(1)
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false)
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false)
  const currencyRef = useRef<HTMLDivElement>(null)


  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)

  const openEditProfileModal = () => {
    setEditStep(1)
    setGenderDropdownOpen(false)
    setEditModalOpen(true)
  }

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    bio: '',
    dateOfBirth: '',
    gender: '' as 'MALE' | 'FEMALE' | 'OTHER' | '',
    address: '',
    city: '',
    country: '',
    phone: '',
    avatarUrl: '',
  })
  const [updatingProfile, setUpdatingProfile] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB')
      return
    }

    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (response.ok && result.avatarUrl) {
        setEditForm((prev) => ({ ...prev, avatarUrl: result.avatarUrl }))
        toast.success('Tải ảnh đại diện lên thành công!')
      } else {
        toast.error(result.code === 'INVALID_FILE_TYPE' ? 'Định dạng tệp không hợp lệ' : 'Tải tệp lên thất bại')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Đã xảy ra lỗi khi tải ảnh lên')
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  // Browser/OS detection client-side
  const [sessionInfo, setSessionInfo] = useState({
    os: 'Windows',
    browser: 'Chrome',
    deviceType: 'desktop',
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent
      let os = 'Windows'
      let browser = 'Chrome'
      let deviceType = 'desktop'

      if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS'
      else if (/iPhone|iPad/i.test(ua)) {
        os = 'iOS'
        deviceType = 'mobile'
      } else if (/Android/i.test(ua)) {
        os = 'Android'
        deviceType = 'mobile'
      } else if (/Linux/i.test(ua)) os = 'Linux'

      if (/Chrome/i.test(ua)) browser = 'Chrome'
      else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari'
      else if (/Firefox/i.test(ua)) browser = 'Firefox'
      else if (/Edg/i.test(ua)) browser = 'Edge'

      setSessionInfo({ os, browser, deviceType })
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData(json)

      // Sync form values
      if (json.user) {
        const u = json.user
        const p = u.profile || {}
        setEditForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          displayName: p.displayName || '',
          bio: p.bio || '',
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
          gender: p.gender || '',
          address: p.address || '',
          city: p.city || '',
          country: p.country || '',
          phone: u.phone || '',
          avatarUrl: p.avatarUrl || '',
        })
      }
    } catch {
      toast.error(t('messages.fetchFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleEditSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // Manually validate required fields
    if (!editForm.lastName.trim() || !editForm.firstName.trim()) {
      toast.error('Vui lòng điền đầy đủ Họ và Tên!')
      setEditStep(1)
      return
    }

    setUpdatingProfile(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          gender: editForm.gender === '' ? null : editForm.gender,
          dateOfBirth: editForm.dateOfBirth === '' ? null : editForm.dateOfBirth,
        }),
      })

      const resData = await res.json()

      if (!res.ok) {
        if (resData.code === 'PHONE_EXISTS') {
          toast.error(t('messages.phoneExists') || 'Số điện thoại đã tồn tại')
        } else {
          toast.error(t('messages.updateFailed'))
        }
        return
      }

      toast.success(t('messages.updateSuccess'))
      setEditModalOpen(false)
      fetchProfile()

      // Refresh Session so top header name updates instantly
      await updateSession()
    } catch {
      toast.error(t('messages.updateFailed'))
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('messages.passwordMismatch'))
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error(t('messages.passwordMin'))
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      })

      const resData = await res.json()

      if (!res.ok) {
        if (resData.code === 'INCORRECT_CURRENT_PASSWORD') {
          toast.error(t('messages.passwordIncorrect'))
        } else {
          toast.error(t('messages.passwordFailed'))
        }
        return
      }

      toast.success(t('messages.passwordSuccess'))
      setPasswordModalOpen(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch {
      toast.error(t('messages.passwordFailed'))
    } finally {
      setChangingPassword(false)
    }
  }

  const getInitials = (user: UserData) => {
    if (user.profile) {
      return `${user.profile.lastName.charAt(0)}${user.profile.firstName.charAt(0)}`.toUpperCase()
    }
    return user.username.slice(0, 2).toUpperCase()
  }

  const formatDisplayName = (user: UserData) => {
    if (user.profile?.displayName) return user.profile.displayName
    if (user.profile) return `${user.profile.lastName} ${user.profile.firstName}`
    return user.username
  }

  const translateRoleName = (code: string, fallbackName: string) => {
    return tCommon.has(`roles.${code}`) ? tCommon(`roles.${code}`) : fallbackName
  }

  const translateActionName = (action: string) => {
    return tCommon.has(`actions.${action}`) ? tCommon(`actions.${action}`) : action
  }

  if (loading || !data) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4">
        {/* Header Skeleton */}
        <div className="h-56 w-full animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800/60" />
        {/* Tabs Skeleton */}
        <div className="h-12 w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800/60" />
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-3xl bg-zinc-200 lg:col-span-2 dark:bg-zinc-800/60" />
          <div className="h-96 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800/60" />
        </div>
      </div>
    )
  }

  const { user, stats, activityLogs } = data
  const primaryRole = user.roles[0]

  return (
    <div className="mx-auto flex w-full flex-col gap-6 text-zinc-900 dark:text-zinc-50 pb-10">
      
      {/* Page Title & Breadcrumbs */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs text-zinc-500 font-semibold dark:text-zinc-400 select-none">
            {t('personalProfile')} &gt; {formatDisplayName(user)}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">{t('title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openEditProfileModal}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 px-4 py-2 text-sm font-semibold shadow-sm transition dark:border-zinc-800 dark:bg-[#0c0c0e] dark:hover:bg-zinc-900 select-none cursor-pointer"
          >
            <Edit className="size-4 text-zinc-500" />
            {t('editProfile')}
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-[#0c0c0e]">
        {/* Mesh Gradient Top Banner */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-700/30 via-primary-500/20 to-primary-300/30 dark:from-primary-700/20 dark:via-primary-500/10 dark:to-primary-300/20 blur-xl opacity-80" />
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 pt-10">
          
          {/* Avatar Area */}
          <div className="relative group">
            <div className="size-24 md:size-28 rounded-full border-4 border-white shadow-xl bg-gradient-to-tr from-primary-800 to-primary-500 flex items-center justify-center text-white text-3xl font-extrabold select-none dark:border-zinc-950">
              {user.profile?.avatarUrl ? (
                <img
                  src={user.profile.avatarUrl}
                  alt={formatDisplayName(user)}
                  className="size-full rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                getInitials(user)
              )}
            </div>
            <button 
              onClick={openEditProfileModal}
              className="absolute bottom-1 right-1 p-2 rounded-full bg-zinc-900 text-white hover:bg-primary-700 border-2 border-white dark:border-zinc-900 shadow-md transition cursor-pointer"
            >
              <Edit className="size-3.5" />
            </button>
          </div>

          {/* User Details Area */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2.5 justify-center md:justify-start">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {formatDisplayName(user)}
              </h2>
              <div className="flex items-center gap-1.5 justify-center md:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('active')}
                </span>
                {primaryRole && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-2.5 py-0.5 text-xs font-semibold text-primary-700 border border-primary-500/20 dark:bg-primary-500/25 dark:text-primary-300">
                    <Shield className="size-3" />
                    {translateRoleName(primaryRole.code, primaryRole.name)}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Bio */}
            {user.profile?.bio ? (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
                {user.profile.bio}
              </p>
            ) : (
              <p className="mt-2 text-sm text-zinc-400 italic dark:text-zinc-500 max-w-xl">
                Chưa cập nhật mô tả bản thân.
              </p>
            )}

            {/* Meta Metadata Grid */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80 pt-6">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail className="size-4 text-zinc-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Phone className="size-4 text-zinc-400 shrink-0" />
                <span>{user.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Calendar className="size-4 text-zinc-400 shrink-0" />
                <span>{t('info.joined')}: {new Date(user.createdAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Clock className="size-4 text-zinc-400 shrink-0" />
                <span>
                  {t('info.lastUpdated')}:{' '}
                  {user.profile?.updatedAt 
                    ? new Date(user.profile.updatedAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')
                    : 'Chưa cập nhật'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto overflow-y-hidden scrollbar-none select-none">
        {(['overview', 'roles', 'logs', 'security'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-3.5 text-sm font-bold border-b-2 -mb-px transition whitespace-nowrap cursor-pointer',
              activeTab === tab
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            )}
          >
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="mt-2">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
            
            {/* Left/Middle Column (Roles & Security Overview) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Profile Fields Details */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">Thông tin cá nhân chi tiết</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div className="flex flex-col gap-1 border-b border-zinc-50 dark:border-zinc-900 pb-2">
                    <span className="text-xs text-zinc-400 font-medium">{t('info.username')}</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{user.username}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-zinc-50 dark:border-zinc-900 pb-2">
                    <span className="text-xs text-zinc-400 font-medium">{t('info.dob')}</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {user.profile?.dateOfBirth 
                        ? new Date(user.profile.dateOfBirth).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US') 
                        : 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-zinc-50 dark:border-zinc-900 pb-2">
                    <span className="text-xs text-zinc-400 font-medium">{t('info.gender')}</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {user.profile?.gender === 'MALE' && t('info.genderMale')}
                      {user.profile?.gender === 'FEMALE' && t('info.genderFemale')}
                      {user.profile?.gender === 'OTHER' && t('info.genderOther')}
                      {!user.profile?.gender && t('info.genderNone')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-zinc-50 dark:border-zinc-900 pb-2">
                    <span className="text-xs text-zinc-400 font-medium">{t('info.address')}</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {[user.profile?.address, user.profile?.city, user.profile?.country].filter(Boolean).join(', ') || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Currency & Display Settings Card */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Tùy chọn tiền tệ & hiển thị</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Cấu hình định dạng tiền tệ mặc định hiển thị trên tất cả các trang.</p>
                  </div>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                    <Globe className="size-4" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Currency Selection */}
                  <div className="space-y-2 relative" ref={currencyRef}>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Tiền tệ hiển thị</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold transition-all duration-300 hover:border-zinc-300 focus:border-[#015C97] dark:border-zinc-800 dark:bg-[#0c0c0e] dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-100 text-left focus:outline-none flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-7 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 font-extrabold text-xs">
                            {SUPPORTED_CURRENCIES[currency]?.symbol || '$'}
                          </span>
                          <span>
                            {locale === 'vi' 
                              ? SUPPORTED_CURRENCIES[currency]?.nameVi 
                              : SUPPORTED_CURRENCIES[currency]?.nameEn}
                          </span>
                        </div>
                        <span className="text-zinc-400 text-[10px] pointer-events-none select-none transition-transform duration-300">
                          {currencyDropdownOpen ? '▲' : '▼'}
                        </span>
                      </button>

                      {/* Custom Floating Select Panel */}
                      {currencyDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-2 rounded-2xl border border-zinc-200/85 bg-white p-1.5 shadow-xl dark:border-zinc-850 dark:bg-[#0c0c0e] animate-in fade-in slide-in-from-top-2 duration-200">
                          {Object.values(SUPPORTED_CURRENCIES).map((cur) => {
                            const isSelected = currency === cur.code
                            return (
                              <button
                                key={cur.code}
                                type="button"
                                onClick={() => {
                                  handleCurrencyChange(cur.code)
                                  setCurrencyDropdownOpen(false)
                                }}
                                className={cn(
                                  "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition cursor-pointer text-left",
                                  isSelected
                                    ? "bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400"
                                    : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={cn(
                                    "flex size-7 items-center justify-center rounded-lg font-extrabold text-xs transition-colors",
                                    isSelected 
                                      ? "bg-primary-500 text-white" 
                                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-450"
                                  )}>
                                    {cur.symbol}
                                  </span>
                                  <span>
                                    {locale === 'vi' ? cur.nameVi : cur.nameEn}
                                  </span>
                                </div>
                                {isSelected && <Check className="size-4 stroke-[3]" />}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Roles & Permissions Card */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Vai trò & Quyền</h3>
                  <button onClick={() => setActiveTab('roles')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    Xem chi tiết ma trận
                  </button>
                </div>
                
                {primaryRole ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-850">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                        <Shield className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-50">
                          {translateRoleName(primaryRole.code, primaryRole.name)}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          {primaryRole.description || 'Không có mô tả chi tiết vai trò.'}
                        </p>
                      </div>
                    </div>

                    {/* Quick permission list */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-zinc-400">Các đặc quyền chính được kế thừa:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {user.permissions.slice(0, 10).map((perm) => (
                          <span
                            key={perm}
                            className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                          >
                            {perm}
                          </span>
                        ))}
                        {user.permissions.length > 10 && (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30">
                            +{user.permissions.length - 10} quyền khác
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">Không tìm thấy phân cấp vai trò.</p>
                )}
              </div>

              {/* Activity Statistics Card */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">{t('stats.title')}</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{t('stats.timeRange')}</p>
                  </div>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                    <Activity className="size-4" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Card 1: Logins */}
                  <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-150/40 dark:border-zinc-800/80">
                    <span className="text-[11px] font-semibold text-zinc-400">{t('stats.logins')}</span>
                    <h4 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">{stats.logins}</h4>
                  </div>
                  
                  {/* Card 2: Operations */}
                  <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-150/40 dark:border-zinc-800/80">
                    <span className="text-[11px] font-semibold text-zinc-400">{t('stats.operations')}</span>
                    <h4 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">{stats.operations}</h4>
                  </div>

                  {/* Card 3: Created */}
                  <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-150/40 dark:border-zinc-800/80">
                    <span className="text-[11px] font-semibold text-zinc-400">{t('stats.dataCreated')}</span>
                    <h4 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-500 mt-1">{stats.created}</h4>
                  </div>

                  {/* Card 4: Updated */}
                  <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-150/40 dark:border-zinc-800/80">
                    <span className="text-[11px] font-semibold text-zinc-400">{t('stats.dataUpdated')}</span>
                    <h4 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-500 mt-1">{stats.updated}</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Security Overview & Recent Sessions) */}
            <div className="flex flex-col gap-6">
              
              {/* Security Card */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">{t('tabs.security')}</h3>
                
                <div className="space-y-4">
                  {/* Password status */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                        <Lock className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t('security.password')}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {t('security.passwordDesc', { 
                            date: user.profile?.updatedAt 
                              ? new Date(user.profile.updatedAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US') 
                              : 'Vừa xong' 
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPasswordModalOpen(true)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline select-none cursor-pointer"
                    >
                      Thay đổi
                    </button>
                  </div>

                  {/* 2FA status */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                        <ShieldCheck className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t('security.twoFactor')}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Xác thực OTP qua di động</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      {t('security.twoFactorActive')}
                    </span>
                  </div>

                  {/* Current Session status */}
                  <div className="p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                      {t('security.currentSession')}
                    </span>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-900 shrink-0">
                          {sessionInfo.deviceType === 'mobile' ? <Smartphone className="size-4.5" /> : <Laptop className="size-4.5" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                            {sessionInfo.browser} trên {sessionInfo.os}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Địa chỉ IP: 127.0.0.1</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                        {t('security.activeBadge')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Sessions list */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">{t('security.recentSessions')}</h3>
                
                {activityLogs && activityLogs.length > 0 ? (
                  <div className="space-y-3.5">
                    {activityLogs.slice(0, 3).map((log) => {
                      const isLogin = log.action === 'LOGIN'
                      return (
                        <div key={log.id} className="flex items-center gap-3 justify-between pb-3.5 border-b border-zinc-100 last:border-0 last:pb-0 dark:border-zinc-900">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex size-9 items-center justify-center rounded-xl shrink-0 text-sm",
                              isLogin ? "bg-blue-500/10 text-blue-600" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900"
                            )}>
                              {isLogin ? <Key className="size-4" /> : <FileText className="size-4" />}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[150px]">
                                {translateActionName(log.action)}
                              </h4>
                              <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[150px]">{log.details || 'Không có chi tiết'}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-zinc-400 block">
                              {new Date(log.createdAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-semibold italic">{log.ipAddress || '127.0.0.1'}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">Chưa ghi nhận phiên làm việc nào.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Roles & Permissions detailed matrix Tab */}
        {activeTab === 'roles' && (
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1">Ma trận quyền hạn chi tiết</h3>
            <p className="text-xs text-zinc-400 mb-6">Tra cứu cấu hình thừa kế phân quyền hệ thống chi tiết cho chức danh của bạn.</p>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-850 overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="grid grid-cols-5 border-b border-zinc-200 dark:border-zinc-850 p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100/50 dark:bg-zinc-900/60">
                <div className="col-span-2">Mô đun hệ thống</div>
                <div className="text-center">Xem</div>
                <div className="text-center">Tạo</div>
                <div className="text-center">Sửa</div>
                <div className="text-center">Xóa</div>
              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-850">
                {[
                  { name: 'Tổng quan (Dashboard)', read: 'wallet:read', create: 'wallet:create', update: 'wallet:update', delete: 'wallet:delete' },
                  { name: 'Thu chi (Transactions)', read: 'transaction:read', create: 'transaction:create', update: 'transaction:update', delete: 'transaction:delete' },
                  { name: 'Báo cáo & Ngân sách (Budgets)', read: 'budget:read', create: 'budget:create', update: 'budget:update', delete: 'budget:delete' },
                  { name: 'Danh mục (Categories)', read: 'category:read', create: 'category:create', update: 'category:update', delete: 'category:delete' },
                  { name: 'Người dùng (System Users)', read: 'user:read', create: 'user:create', update: 'user:update', delete: 'user:delete' },
                  { name: 'Vai trò & Quyền (RBAC Roles)', read: 'role:read', create: 'role:create', update: 'role:update', delete: 'role:delete' },
                ].map((mod) => {
                  const check = (code: string) => user.permissions.includes(code)
                  return (
                    <div key={mod.name} className="grid grid-cols-5 p-4 items-center text-sm">
                      <div className="col-span-2 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                        <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                        {mod.name}
                      </div>
                      {[mod.read, mod.create, mod.update, mod.delete].map((code) => {
                        const hasPerm = check(code)
                        return (
                          <div key={code} className="flex justify-center">
                            <div className={cn(
                              "size-6 rounded-lg flex items-center justify-center border text-xs font-bold transition select-none",
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
                  )
                })}
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 italic mt-3.5">
              * Ghi chú: Vai trò tối cao Super Administrator bỏ qua toàn bộ các kiểm tra ma trận phân quyền và nắm đặc quyền toàn hệ thống mặc định.
            </p>
          </div>
        )}

        {/* Activity Logs timeline Tab */}
        {activeTab === 'logs' && (
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Nhật ký hoạt động của bạn</h3>
            
            {activityLogs && activityLogs.length > 0 ? (
              <div className="relative border-l border-zinc-150 dark:border-zinc-800 ml-3 pl-6 space-y-6">
                {activityLogs.map((log) => {
                  const isSuccess = true
                  return (
                    <div key={log.id} className="relative">
                      {/* Timeline Node Point */}
                      <span className={cn(
                        "absolute -left-[31px] top-1.5 flex size-4.5 items-center justify-center rounded-full border bg-white dark:bg-zinc-950 shadow-sm",
                        isSuccess ? "border-blue-500 text-blue-500" : "border-zinc-300 text-zinc-400"
                      )}>
                        <span className="size-2 rounded-full bg-blue-500" />
                      </span>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 justify-between">
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                            {translateActionName(log.action)}
                          </span>
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-400 block font-semibold">
                              {new Date(log.createdAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-850">
                          {log.details || 'Không có mô tả chi tiết sự kiện.'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-semibold text-zinc-400">
                          <MapPin className="size-3 text-zinc-400 shrink-0" />
                          <span>IP: {log.ipAddress || '127.0.0.1'}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-400 italic">Chưa ghi nhận nhật ký làm việc nào của bạn.</p>
            )}
          </div>
        )}

        {/* Security and Credentials Management Tab */}
        {activeTab === 'security' && (
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] space-y-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1">Cài đặt an toàn tài khoản</h3>
              <p className="text-xs text-zinc-400">Điều chỉnh mật khẩu, cấu hình xác thực đa nhân tố 2 lớp để bảo mật ví Finlo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password configuration card */}
              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <Lock className="size-4 text-blue-500 shrink-0" />
                    Mật khẩu đăng nhập
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                    Sử dụng mật khẩu mạnh tối thiểu 8 ký tự, kết hợp chữ cái viết hoa, viết thường, chữ số và biểu tượng đặc biệt.
                  </p>
                </div>
                <button
                  onClick={() => setPasswordModalOpen(true)}
                  className="mt-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-xs transition cursor-pointer self-start select-none"
                >
                  {t('changePassword')}
                </button>
              </div>

              {/* 2FA configuration card */}
              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <ShieldCheck className="size-4.5 text-emerald-500 shrink-0" />
                    Xác thực 2 lớp (2FA)
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                    Tăng cường bảo vệ bằng cách yêu cầu mã OTP bảo mật mỗi khi thực hiện thao tác nhạy cảm hoặc đăng nhập.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 self-start bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 select-none">
                  <CheckCircle className="size-4" />
                  Đã được kích hoạt mặc định
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal Dialog */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Overlay Blur Background */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={() => setEditModalOpen(false)} />
          
          {/* Main Widescreen Pro Wizard Modal */}
          <div className="relative w-full max-w-3xl max-h-[92vh] md:max-h-[88vh] rounded-3xl border border-zinc-200/80 bg-white/95 p-5 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:border-zinc-800/80 dark:bg-[#0c0c0e]/95 dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col gap-5 z-10 text-zinc-800 dark:text-zinc-150">
            
            {/* Dynamic Mesh Glow Backgrounds */}
            <div className="absolute -top-40 -right-40 size-80 rounded-full bg-gradient-to-tr from-blue-600/20 to-indigo-500/20 blur-3xl pointer-events-none select-none opacity-60 dark:opacity-40" />
            <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-gradient-to-tr from-sky-500/10 to-indigo-600/10 blur-3xl pointer-events-none select-none opacity-60 dark:opacity-40" />

            {/* Modal Header */}
            <div className="relative flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-[0_8px_16px_rgba(59,130,246,0.25)] select-none">
                  <Sparkles className="size-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    {t('editModal.title')}
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 select-none">
                      PRO WIZARD
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {t('editModal.step', { step: editStep, total: 3 })} <span className="font-bold text-blue-600 dark:text-blue-400">
                      {editStep === 1 && t('editModal.step1Title')}
                      {editStep === 2 && t('editModal.step2Title')}
                      {editStep === 3 && t('editModal.step3Title')}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition dark:bg-zinc-900/50 dark:hover:bg-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Horizontal Progress Wizard Indicators */}
            <div className="relative flex items-center justify-between px-6 md:px-16 select-none shrink-0 pt-2 pb-14">
              
              {/* Perfect Connecting Line Container */}
              <div className="absolute top-7 left-11 right-11 md:left-21 md:right-21 h-1 z-[-1] pointer-events-none">
                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-800 to-primary-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(1,92,151,0.5)]"
                  style={{ width: `${((editStep - 1) / 2) * 100}%` }}
                />
              </div>

              {/* Steps Nodes */}
              {[
                { step: 1, label: t('editModal.step1Label'), sub: t('editModal.step1Sub') },
                { step: 2, label: t('editModal.step2Label'), sub: t('editModal.step2Sub') },
                { step: 3, label: t('editModal.step3Label'), sub: t('editModal.step3Sub') }
              ].map((s) => {
                const isActive = editStep === s.step
                const isCompleted = editStep > s.step
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setEditStep(s.step as 1 | 2 | 3)}
                    className="relative flex flex-col items-center z-10 focus:outline-none group cursor-pointer"
                  >
                    <div className={cn(
                      "size-10 rounded-2xl border-2 flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-md relative z-10",
                      isActive 
                        ? "border-primary-700 text-primary-700 bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:bg-primary-950 scale-110 ring-4 ring-primary-700/10 dark:ring-primary-400/20 shadow-[0_0_20px_rgba(1,92,151,0.3)]" 
                        : isCompleted
                          ? "border-emerald-500 text-white bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                          : "border-zinc-200 text-zinc-400 dark:border-zinc-800 dark:text-zinc-500 bg-white dark:bg-[#0c0c0e]"
                    )}>
                      {isCompleted ? <Check className="size-4 stroke-[3]" /> : s.step}
                    </div>
                    
                    {/* Absolute Text Labels Centered Below */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 text-center pointer-events-none">
                      <span className={cn(
                        "text-xs font-black tracking-tight transition-all duration-300 block",
                        isActive
                          ? "text-primary-700 dark:text-primary-400"
                          : isCompleted
                            ? "text-emerald-500"
                            : "text-zinc-400 dark:text-zinc-500"
                      )}>
                        {s.label}
                      </span>
                      <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 hidden md:block mt-0.5">
                        {s.sub}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Step Wizard Content Block */}
            <div className="flex-1 flex flex-col gap-4 pt-1 overflow-hidden min-h-0">
              
              {/* Form scroll card container */}
              <div className="relative flex-1 bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-900 p-5 md:p-7 rounded-3xl transition-all duration-300 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                
                {/* STEP 1: Basic Personal Information */}
                {editStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
                    <Input
                      required
                      label={t('info.lastName')}
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      placeholder={t('editModal.lastNamePlaceholder')}
                      leftIcon={<User className="size-4.5 text-zinc-400" />}
                    />

                    <Input
                      required
                      label={t('info.firstName')}
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      placeholder={t('editModal.firstNamePlaceholder')}
                      leftIcon={<User className="size-4.5 text-zinc-400" />}
                    />

                    <div className="md:col-span-2">
                      <Input
                        label={t('info.displayName')}
                        value={editForm.displayName ?? ''}
                        onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                        placeholder={t('editModal.displayNamePlaceholder')}
                        leftIcon={<Sparkles className="size-4.5 text-zinc-400" />}
                      />
                    </div>

                    <DatePicker
                      label={t('info.dob')}
                      value={editForm.dateOfBirth ?? ''}
                      onChange={(val) => setEditForm({ ...editForm, dateOfBirth: val })}
                      locale={locale}
                    />

                    <Select
                      label={t('info.gender')}
                      value={editForm.gender ?? ''}
                      searchable={false}
                      options={[
                        { value: '', label: t('info.genderNone'), icon: <UserCheck className="size-4.5 text-zinc-400" /> },
                        { value: 'MALE', label: t('info.genderMale'), icon: <UserCheck className="size-4.5 text-zinc-400" /> },
                        { value: 'FEMALE', label: t('info.genderFemale'), icon: <UserCheck className="size-4.5 text-zinc-400" /> },
                        { value: 'OTHER', label: t('info.genderOther'), icon: <UserCheck className="size-4.5 text-zinc-400" /> }
                      ]}
                      onChange={(val) => setEditForm({ ...editForm, gender: (val || null) as any })}
                    />
                  </div>
                )}

                {/* STEP 2: Contacts & Geography */}
                {editStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
                    <div className="md:col-span-2">
                      <Input
                        type="tel"
                        label={t('info.phone')}
                        value={editForm.phone ?? ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder={t('editModal.phonePlaceholder')}
                        leftIcon={<Phone className="size-4.5 text-zinc-400" />}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Input
                        label={t('info.address')}
                        value={editForm.address ?? ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        placeholder={t('editModal.addressPlaceholder')}
                        leftIcon={<MapPin className="size-4.5 text-zinc-400" />}
                      />
                    </div>

                    <Input
                      label={t('info.city')}
                      value={editForm.city ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      placeholder={t('editModal.cityPlaceholder')}
                      leftIcon={<Globe className="size-4.5 text-zinc-400" />}
                    />

                    <Input
                      label={t('info.country')}
                      maxLength={2}
                      value={editForm.country ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value.toUpperCase() })}
                      placeholder={t('editModal.countryPlaceholder')}
                      leftIcon={<Globe className="size-4.5 text-zinc-400" />}
                    />
                  </div>
                )}

                {/* STEP 3: Personalization & Avatars */}
                {editStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 animate-in fade-in duration-300">
                    
                    {/* Left: Premium Avatar Selector Panel */}
                    <div className="md:col-span-3 flex flex-col gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-900 shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Ảnh đại diện chuyên nghiệp</span>
                      
                      <div className="flex items-center gap-4">
                        {/* Live Avatar Preview with dynamic gradient glow */}
                        <div className="relative shrink-0 select-none group">
                          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 opacity-80 blur-sm group-hover:opacity-100 transition duration-300" />
                          <div className="relative size-18 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-800 dark:text-white text-xl font-extrabold shadow-md overflow-hidden border-2 border-white dark:border-zinc-950">
                            {editForm.avatarUrl ? (
                              <img
                                src={editForm.avatarUrl}
                                alt="Preview"
                                className="size-full object-cover group-hover:scale-105 transition duration-300"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              `${editForm.lastName.charAt(0)}${editForm.firstName.charAt(0)}`.toUpperCase() || 'U'
                            )}
                          </div>
                        </div>

                        {/* Preset Buttons Grid with animation */}
                        <div className="flex-1">
                          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 block mb-1.5">Mẫu chân dung Unsplash Premium</span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
                              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80',
                              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
                              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80',
                              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&q=80',
                            ].map((url, i) => {
                              const isSelected = editForm.avatarUrl === url
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setEditForm({ ...editForm, avatarUrl: url })}
                                  className={cn(
                                    "size-8 rounded-full border-2 transition-all duration-300 hover:scale-110 active:scale-95 shrink-0 overflow-hidden cursor-pointer",
                                    isSelected 
                                      ? "border-blue-600 scale-105 shadow-[0_0_12px_rgba(59,130,246,0.5)] ring-2 ring-blue-500/20" 
                                      : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-800"
                                  )}
                                >
                                  <img src={url} alt={`Preset ${i}`} className="size-full object-cover" />
                                </button>
                              )
                            })}
                            
                            {/* Revert Avatar Button */}
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, avatarUrl: '' })}
                              className="size-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 flex items-center justify-center text-[9px] font-black text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition hover:scale-105 shrink-0 cursor-pointer select-none"
                              title="Dùng chữ cái viết tắt của bạn"
                            >
                              XÓA
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Upload & Custom Url Actions */}
                      <div className="mt-2.5 space-y-3.5">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 block">{t('editModal.uploadLocal')}</span>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            className="flex w-fit items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-3.5 py-1.5 text-xs font-bold text-zinc-750 transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer select-none"
                          >
                            {uploadingAvatar ? (
                              <Loader2 className="size-3.5 animate-spin text-primary-700" />
                            ) : (
                              <Upload className="size-3.5 text-primary-700" />
                            )}
                            {t('editModal.uploadLocal')}
                          </button>
                        </div>

                        <Input
                          type="url"
                          label={t('editModal.orCustomUrl')}
                          value={editForm.avatarUrl ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/photo-..."
                          leftIcon={<Globe className="size-4 text-zinc-400" />}
                        />
                      </div>
                    </div>

                    {/* Right: Bio Area Card */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block ml-1">{t('info.bio')}</label>
                        <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mr-1">
                          {(editForm.bio ?? '').length} / 500
                        </span>
                      </div>
                      
                      <Textarea
                        maxLength={500}
                        value={editForm.bio ?? ''}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder={t('editModal.bioPlaceholder')}
                        className="flex-1 min-h-[148px]"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Wizard Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-850 shrink-0">
                {/* Previous Button */}
                <div>
                  {editStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setEditStep((prev) => (prev - 1) as 1 | 2 | 3)}
                      className="flex items-center gap-1.5 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 px-5 py-2.5 text-xs font-bold text-zinc-700 shadow-sm transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 select-none cursor-pointer"
                    >
                      <ChevronLeft className="size-4" />
                      {t('editModal.back')}
                    </button>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Right Controls: Cancel & Next / Submit */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="rounded-2xl border border-transparent bg-transparent hover:bg-zinc-100/50 px-5 py-2.5 text-xs font-bold text-zinc-500 transition-all duration-300 dark:text-zinc-400 dark:hover:bg-zinc-900 cursor-pointer select-none"
                  >
                    {t('editModal.cancel')}
                  </button>

                  {editStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setEditStep((prev) => (prev + 1) as 1 | 2 | 3)}
                      className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary-800 to-primary-600 hover:from-primary-700 hover:to-primary-500 text-white font-extrabold px-6 py-2.5 text-xs transition-all duration-300 shadow-[0_4px_12px_rgba(1,92,151,0.2)] hover:shadow-[0_6px_20px_rgba(1,92,151,0.35)] cursor-pointer select-none"
                    >
                      {t('editModal.next')}
                      <ChevronRight className="size-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEditSubmit()}
                      disabled={updatingProfile}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-800 to-primary-600 hover:from-primary-700 hover:to-primary-500 text-white font-extrabold px-6 py-2.5 text-xs transition-all duration-300 shadow-[0_4px_12px_rgba(1,92,151,0.2)] hover:shadow-[0_6px_20px_rgba(1,92,151,0.35)] cursor-pointer select-none disabled:opacity-50"
                    >
                      {updatingProfile ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4 stroke-[3]" />
                      )}
                      {t('editModal.submit')}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal Dialog */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPasswordModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-[#0c0c0e] animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setPasswordModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition"
            >
              <X className="size-4" />
            </button>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-850 pb-3">
              {t('passwordModal.title')}
            </h3>

            <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
              
              {/* Current password field */}
              {/* Current password field */}
              <Input
                type={showCurrentPass ? 'text' : 'password'}
                required
                label={t('passwordModal.currentPassword')}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder={t('passwordModal.currentPasswordPlaceholder')}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="text-zinc-400 hover:text-zinc-600 transition flex items-center justify-center"
                  >
                    {showCurrentPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              />

              {/* New password field */}
              <Input
                type={showNewPass ? 'text' : 'password'}
                required
                label={t('passwordModal.newPassword')}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder={t('passwordModal.newPasswordPlaceholder')}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="text-zinc-400 hover:text-zinc-600 transition flex items-center justify-center"
                  >
                    {showNewPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              />

              {/* Confirm new password field */}
              <Input
                type={showConfirmPass ? 'text' : 'password'}
                required
                label={t('passwordModal.confirmPassword')}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder={t('passwordModal.confirmPasswordPlaceholder')}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="text-zinc-400 hover:text-zinc-600 transition flex items-center justify-center"
                  >
                    {showConfirmPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 px-4 py-2 text-xs font-bold transition dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 select-none cursor-pointer"
                >
                  {t('passwordModal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 text-xs transition cursor-pointer select-none disabled:opacity-50"
                >
                  {changingPassword && <Loader2 className="size-3.5 animate-spin" />}
                  {t('passwordModal.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
