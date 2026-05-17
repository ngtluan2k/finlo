'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { BudgetItem } from './budgets-client'

interface BudgetFormModalProps {
  open: boolean
  budget?: BudgetItem | null
  month: number
  year: number
  onClose: () => void
  onSuccess: (budget: BudgetItem) => void
  t: any
}

export function BudgetFormModal({ open, budget, month, year, onClose, onSuccess, t }: BudgetFormModalProps) {
  const [categories, setCategories] = useState<{ id: string, name: string, type: string }[]>([])
  const [fetchingCategories, setFetchingCategories] = useState(false)
  
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ category?: string, amount?: string }>({})
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  
  const amountRef = useRef<HTMLInputElement>(null)
  const isEdit = !!budget

  useEffect(() => {
    if (open && categories.length === 0) {
      setFetchingCategories(true)
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error(err))
        .finally(() => setFetchingCategories(false))
    }
  }, [open, categories.length])

  useEffect(() => {
    if (open) {
      if (budget) {
        setCategoryId(budget.categoryId)
        setAmount(budget.amount)
      } else {
        setCategoryId('')
        setAmount('')
      }
      setErrors({})
      setToast(null)
      setTimeout(() => amountRef.current?.focus(), 120)
    }
  }, [open, budget])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const validate = useCallback(() => {
    const errs: any = {}
    if (!categoryId) errs.category = t('form.errors.categoryRequired')
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) errs.amount = t('form.errors.amountRequired')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [categoryId, amount, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    setToast(null)
    
    try {
      const url = isEdit ? `/api/budgets/${budget.id}` : '/api/budgets'
      const method = isEdit ? 'PATCH' : 'POST'
      const payload = isEdit 
        ? { amount, status: 'ACTIVE' } 
        : { categoryId, amount, month, year }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? t('form.errors.saveFailed'))
      }

      const saved: BudgetItem = await res.json()
      // If POST, we might not get full category nested object initially in some structures, 
      // but our API does return it. Let's make sure.
      setToast({ type: 'success', msg: t('form.success') })
      setTimeout(() => {
        onSuccess(saved)
        onClose()
      }, 900)
    } catch (err: any) {
      setToast({ type: 'error', msg: err.message || 'Lỗi lưu ngân sách' })
    } finally {
      setSaving(false)
    }
  }

  const categoryOptions = categories.map(c => ({
    value: c.id,
    label: `${c.name} (${c.type === 'EXPENSE' ? 'Chi tiêu' : 'Thu nhập/Tiết kiệm'})`
  }))

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
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-[450px] flex-col bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 dark:border-slate-800 px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {isEdit ? t('form.editTitle') : t('form.addTitle')}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">
              {isEdit ? t('form.editSubtitle') : `${t('form.addSubtitle')} ${month}/${year}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-slate-800 dark:hover:text-zinc-200 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <form id="budget-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {fetchingCategories ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-6 animate-spin text-[#015C97]" />
            </div>
          ) : (
            <>
              {!isEdit && (
                <Select
                  label={t('form.category')}
                  value={categoryId}
                  options={categoryOptions}
                  onChange={(v) => setCategoryId(v as string)}
                  error={errors.category}
                />
              )}
              {isEdit && budget && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider block">
                    {t('form.category')}
                  </label>
                  <div className="rounded-2xl border border-zinc-200 dark:border-slate-800 bg-zinc-50 dark:bg-slate-800/50 px-4 py-3 font-bold text-zinc-700 dark:text-zinc-300">
                    {budget.category.name}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t('form.amount')}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-sm font-bold text-zinc-400 pointer-events-none select-none">₫</span>
                  <input
                    ref={amountRef}
                    type="number"
                    min="0"
                    step="1000"
                    placeholder={t('form.amountPlaceholder')}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className={cn(
                      'w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-4 py-3 outline-none transition-all duration-300 font-semibold text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:border-zinc-800 dark:bg-[#0c0c0e] focus:border-[#015C97] focus:ring-4 focus:ring-[#015C97]/10',
                      errors.amount && 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                    )}
                  />
                </div>
                {errors.amount && (
                  <p className="text-xs font-semibold text-red-500 dark:text-red-400">
                    {errors.amount}
                  </p>
                )}
              </div>
            </>
          )}
        </form>

        {toast && (
          <div className={cn(
            'mx-6 mb-2 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold animate-in fade-in',
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          )}>
            {toast.type === 'success' ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
            {toast.msg}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-700 transition"
          >
            {t('form.cancel')}
          </button>
          <button
            type="submit"
            form="budget-form"
            disabled={saving || fetchingCategories}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#015C97] to-[#0172B2] px-6 py-2.5 text-sm font-bold text-white hover:shadow-lg transition disabled:opacity-60"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? t('form.saving') : t('form.save')}
          </button>
        </div>
      </div>
    </>
  )
}
