'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import {
  X, Wallet, Landmark, CreditCard, Coins, HelpCircle,
  CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { WalletItem } from '@/components/wallets/wallets-client'

type WalletType = WalletItem['type']
type WalletStatus = WalletItem['status']

interface WalletFormData {
  name: string
  type: WalletType
  balance: string
  status: WalletStatus
  description: string
  metadata: Record<string, string>
}

interface WalletFormErrors {
  name?: string
  balance?: string
  general?: string
}

interface WalletFormModalProps {
  open: boolean
  wallet?: WalletItem | null   // null/undefined = create mode, WalletItem = edit mode
  onClose: () => void
  onSuccess: (wallet: WalletItem) => void
}

const TYPE_ICONS: Record<WalletType, React.ElementType> = {
  CASH: Coins,
  BANK: Landmark,
  E_WALLET: Wallet,
  CREDIT_CARD: CreditCard,
  OTHER: HelpCircle,
}

const TYPE_COLORS: Record<WalletType, string> = {
  CASH:        'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400',
  BANK:        'text-blue-600   bg-blue-50   dark:bg-blue-500/15   dark:text-blue-400',
  E_WALLET:    'text-violet-600 bg-violet-50 dark:bg-violet-500/15 dark:text-violet-400',
  CREDIT_CARD: 'text-amber-600  bg-amber-50  dark:bg-amber-500/15  dark:text-amber-400',
  OTHER:       'text-zinc-600   bg-zinc-100  dark:bg-slate-700     dark:text-zinc-300',
}

const EMPTY_FORM: WalletFormData = {
  name: '',
  type: 'CASH',
  balance: '',
  status: 'ACTIVE',
  description: '',
  metadata: {},
}

export function WalletFormModal({ open, wallet, onClose, onSuccess }: WalletFormModalProps) {
  const t = useTranslations('wallets')
  const [form, setForm] = useState<WalletFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<WalletFormErrors>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const isEdit = !!wallet

  // Populate form in edit mode or reset in create mode
  useEffect(() => {
    if (open) {
      if (wallet) {
        setForm({
          name:        wallet.name,
          type:        wallet.type,
          balance:     wallet.balance,
          status:      wallet.status,
          description: '',
          metadata:    wallet.metadata || {},
        })
      } else {
        setForm(EMPTY_FORM)
      }
      setErrors({})
      setToast(null)
      // Focus name after animation
      setTimeout(() => nameRef.current?.focus(), 120)
    }
  }, [open, wallet])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const validate = useCallback((): boolean => {
    const errs: WalletFormErrors = {}
    if (!form.name.trim()) errs.name = t('form.errors.nameRequired')
    if (form.balance !== '' && isNaN(parseFloat(form.balance))) {
      errs.balance = t('form.errors.balanceInvalid')
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [form, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    setToast(null)
    try {
      const url  = isEdit ? `/api/wallets/${wallet!.id}` : '/api/wallets'
      const method = isEdit ? 'PATCH' : 'POST'
      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    form.name.trim(),
          type:    form.type,
          balance: form.balance === '' ? '0' : form.balance,
          status:  form.status,
          metadata: Object.keys(form.metadata).length > 0 ? form.metadata : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? t('form.errors.saveFailed'))
      }

      const saved: WalletItem = await res.json()
      setToast({ type: 'success', msg: t('form.success') })
      setTimeout(() => {
        onSuccess(saved)
        onClose()
      }, 900)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('form.errors.saveFailed')
      setToast({ type: 'error', msg })
    } finally {
      setSaving(false)
    }
  }

  const set = <K extends keyof WalletFormData>(key: K, val: WalletFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const setMeta = (key: string, val: string) =>
    setForm(prev => ({ ...prev, metadata: { ...prev.metadata, [key]: val } }))

  const typeOptions = (['CASH', 'BANK', 'E_WALLET', 'CREDIT_CARD', 'OTHER'] as WalletType[]).map(v => {
    const Icon = TYPE_ICONS[v]
    return {
      value: v,
      label: t(`form.typeOptions.${v}` as Parameters<typeof t>[0]),
      icon: <Icon className="size-4" />,
    }
  })

  const statusOptions = [
    { value: 'ACTIVE',   label: t('form.statusOptions.ACTIVE') },
    { value: 'INACTIVE', label: t('form.statusOptions.INACTIVE') },
  ]

  const CurrentTypeIcon = TYPE_ICONS[form.type]

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm transition-all duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Slide-over panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-[700px] flex-col bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 dark:border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className={cn('flex size-10 items-center justify-center rounded-2xl shrink-0', TYPE_COLORS[form.type])}>
              <CurrentTypeIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {isEdit ? t('form.editTitle') : t('form.addTitle')}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">
                {isEdit ? t('form.editSubtitle') : t('form.addSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-slate-800 dark:hover:text-zinc-200 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          id="wallet-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-thin"
        >
          {/* Type selector — visual card grid */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('form.type')}
            </span>
            <div className="grid grid-cols-5 gap-2">
              {typeOptions.map(opt => {
                const Icon = TYPE_ICONS[opt.value as WalletType]
                const color = TYPE_COLORS[opt.value as WalletType]
                const active = form.type === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('type', opt.value as WalletType)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-2xl border py-3 px-1 transition-all duration-200',
                      active
                        ? 'border-[#015C97] bg-blue-50/60 dark:bg-blue-500/10 ring-2 ring-[#015C97]/20'
                        : 'border-zinc-200 dark:border-slate-700 hover:border-zinc-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50'
                    )}
                  >
                    <div className={cn('flex size-8 items-center justify-center rounded-xl', color)}>
                      <Icon className="size-4" />
                    </div>
                    <span className={cn(
                      'text-[10px] font-bold text-center leading-tight',
                      active ? 'text-[#015C97] dark:text-blue-400' : 'text-zinc-500 dark:text-slate-400'
                    )}>
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Name */}
          <Input
            ref={nameRef}
            label={t('form.name')}
            placeholder={t('form.namePlaceholder')}
            value={form.name}
            onChange={e => set('name', e.target.value)}
            error={errors.name}
          />

          {/* Balance + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider block">
                {t('form.initialBalance')}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-bold text-zinc-400 pointer-events-none select-none">₫</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder={t('form.initialBalancePlaceholder')}
                  value={form.balance}
                  onChange={e => set('balance', e.target.value)}
                  className={cn(
                    'w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-4 py-3 outline-none transition-all duration-300 font-semibold text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:border-zinc-800 dark:bg-[#0c0c0e] focus:border-[#015C97] focus:ring-4 focus:ring-[#015C97]/10',
                    errors.balance && 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                  )}
                />
              </div>
              {errors.balance && (
                <p className="text-xs font-semibold text-red-500 dark:text-red-400 animate-in fade-in duration-200">
                  {errors.balance}
                </p>
              )}
            </div>

            <Select
              label={t('form.status')}
              value={form.status}
              options={statusOptions}
              onChange={v => set('status', v as WalletStatus)}
            />
          </div>

          {/* Type-specific metadata fields */}
          {form.type === 'BANK' && (
            <div className="space-y-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-500/5 p-4">
              <Input
                label={t('form.metadata.bankName')}
                placeholder={t('form.metadata.bankNamePlaceholder')}
                value={form.metadata.bankName || ''}
                onChange={e => setMeta('bankName', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('form.metadata.accountNumber')}
                  placeholder={t('form.metadata.accountNumberPlaceholder')}
                  value={form.metadata.accountNumber || ''}
                  onChange={e => setMeta('accountNumber', e.target.value)}
                />
                <Input
                  label={t('form.metadata.accountName')}
                  placeholder={t('form.metadata.accountNamePlaceholder')}
                  value={form.metadata.accountName || ''}
                  onChange={e => setMeta('accountName', e.target.value)}
                />
              </div>
            </div>
          )}

          {form.type === 'E_WALLET' && (
            <div className="space-y-4 rounded-2xl border border-violet-100 dark:border-violet-900/50 bg-violet-50/30 dark:bg-violet-500/5 p-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('form.metadata.provider')}
                  placeholder={t('form.metadata.providerPlaceholder')}
                  value={form.metadata.provider || ''}
                  onChange={e => setMeta('provider', e.target.value)}
                />
                <Input
                  label={t('form.metadata.phoneNumber')}
                  placeholder={t('form.metadata.phoneNumberPlaceholder')}
                  value={form.metadata.phoneNumber || ''}
                  onChange={e => setMeta('phoneNumber', e.target.value)}
                />
              </div>
            </div>
          )}

          {form.type === 'CREDIT_CARD' && (
            <div className="space-y-4 rounded-2xl border border-amber-100 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-500/5 p-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('form.metadata.bankName')}
                  placeholder={t('form.metadata.bankNamePlaceholder')}
                  value={form.metadata.bankName || ''}
                  onChange={e => setMeta('bankName', e.target.value)}
                />
                <Input
                  label={t('form.metadata.cardNumber')}
                  placeholder={t('form.metadata.cardNumberPlaceholder')}
                  value={form.metadata.cardNumber || ''}
                  maxLength={4}
                  onChange={e => setMeta('cardNumber', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t('form.metadata.creditLimit')}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-sm font-bold text-zinc-400 pointer-events-none select-none">₫</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder={t('form.metadata.creditLimitPlaceholder')}
                    value={form.metadata.creditLimit || ''}
                    onChange={e => setMeta('creditLimit', e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-4 py-3 outline-none transition-all duration-300 font-semibold text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:border-zinc-800 dark:bg-[#0c0c0e] focus:border-[#015C97] focus:ring-4 focus:ring-[#015C97]/10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('form.metadata.statementDate')}
                  placeholder={t('form.metadata.statementDatePlaceholder')}
                  type="number"
                  min={1}
                  max={31}
                  value={form.metadata.statementDate || ''}
                  onChange={e => setMeta('statementDate', e.target.value)}
                />
                <Input
                  label={t('form.metadata.paymentDueDate')}
                  placeholder={t('form.metadata.paymentDueDatePlaceholder')}
                  type="number"
                  min={1}
                  max={31}
                  value={form.metadata.paymentDueDate || ''}
                  onChange={e => setMeta('paymentDueDate', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <Textarea
            label={t('form.description')}
            placeholder={t('form.descriptionPlaceholder')}
            rows={3}
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />

          {/* Preview card */}
          <div className="rounded-2xl border border-zinc-100 dark:border-slate-800 bg-zinc-50/70 dark:bg-slate-800/40 p-4">
            <p className="text-[10px] font-bold text-zinc-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Preview
            </p>
            <div className="flex items-center gap-3">
              <div className={cn('flex size-10 items-center justify-center rounded-2xl shrink-0', TYPE_COLORS[form.type])}>
                <CurrentTypeIcon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {form.name || <span className="text-zinc-400 dark:text-slate-500 italic">Wallet name...</span>}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-slate-400 mt-0.5">
                  {typeOptions.find(o => o.value === form.type)?.label}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {form.balance ? parseInt(form.balance, 10).toLocaleString() : '0'} ₫
                </p>
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold mt-0.5',
                  form.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-slate-700 dark:text-zinc-400'
                )}>
                  <span className={cn('size-1.5 rounded-full', form.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-zinc-400')} />
                  {statusOptions.find(s => s.value === form.status)?.label}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Toast notification */}
        {toast && (
          <div className={cn(
            'mx-6 mb-2 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300',
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
              : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400 border border-red-100 dark:border-red-500/20'
          )}>
            {toast.type === 'success'
              ? <CheckCircle2 className="size-4 shrink-0" />
              : <AlertCircle className="size-4 shrink-0" />}
            {toast.msg}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            {t('form.cancel')}
          </button>
          <button
            type="submit"
            form="wallet-form"
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#015C97] to-[#0172B2] px-6 py-2.5 text-sm font-bold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t('form.saving')}
              </>
            ) : (
              t('form.save')
            )}
          </button>
        </div>
      </div>
    </>
  )
}
