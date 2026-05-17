import React from 'react'
import { X, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Loader2 } from 'lucide-react'
import type { Wallet, Category, TransactionType } from './types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'

const WALLET_TYPE_LABELS: Record<string, string> = {
  CASH: 'Tiền mặt', BANK: 'Ngân hàng', E_WALLET: 'Ví điện tử',
  CREDIT_CARD: 'Thẻ tín dụng', OTHER: 'Khác',
}

interface WizardProps {
  showAddModal: boolean
  setShowAddModal: (v: boolean) => void
  modalStep: number
  setModalStep: (v: number) => void
  isSubmitting: boolean
  // form fields
  newTxType: TransactionType
  setNewTxType: (v: TransactionType) => void
  newTxAmount: string
  setNewTxAmount: (v: string) => void
  newTxWalletId: string
  setNewTxWalletId: (v: string) => void
  newTxToWalletId: string
  setNewTxToWalletId: (v: string) => void
  newTxCategoryId: string
  setNewTxCategoryId: (v: string) => void
  newTxDate: string
  setNewTxDate: (v: string) => void
  newTxNote: string
  setNewTxNote: (v: string) => void
  wallets: Wallet[]
  categories: Category[]
  handleAddSubmit: () => void
  formatMoney: (v: string | number) => string
  t: any
  locale: string
}

export function TransactionWizardModal(props: WizardProps) {
  const {
    showAddModal, setShowAddModal,
    modalStep, setModalStep,
    isSubmitting,
    newTxType, setNewTxType,
    newTxAmount, setNewTxAmount,
    newTxWalletId, setNewTxWalletId,
    newTxToWalletId, setNewTxToWalletId,
    newTxCategoryId, setNewTxCategoryId,
    newTxDate, setNewTxDate,
    newTxNote, setNewTxNote,
    wallets, categories,
    handleAddSubmit,
    formatMoney, t, locale,
  } = props

  if (!showAddModal) return null

  // Categories filtered by selected type (TRANSFER has no category)
  const filteredCategories = categories.filter((c) =>
    newTxType === 'TRANSFER' ? false : c.type === newTxType
  )

  const walletLabel = (w: Wallet) =>
    `${w.name} · ${WALLET_TYPE_LABELS[w.type] ?? w.type} · ${formatMoney(w.balance)}`

  const selectedWallet = wallets.find((w) => w.id === newTxWalletId)
  const selectedToWallet = wallets.find((w) => w.id === newTxToWalletId)
  const selectedCategory = categories.find((c) => c.id === newTxCategoryId)

  const walletOptions = wallets.map((w) => ({
    value: w.id,
    label: w.name,
    subLabel: `${WALLET_TYPE_LABELS[w.type] ?? w.type} · ${formatMoney(w.balance)}`,
  }))

  const categoryOptions = [
    { value: '', label: locale === 'vi' ? '— Không chọn —' : '— None —' },
    ...filteredCategories.map((c) => ({
      value: c.id,
      label: c.name,
    }))
  ]

  const typeOptions: { type: TransactionType; icon: React.ReactNode; label: string; sub: string; ring: string }[] = [
    { type: 'EXPENSE',  icon: <ArrowUpCircle   className="size-8 text-red-500"     />, label: t('filters.expense'),  sub: 'Tiền chi ra từ Ví',      ring: 'border-red-500     bg-red-500/5     ring-red-500'     },
    { type: 'INCOME',   icon: <ArrowDownCircle className="size-8 text-emerald-500" />, label: t('filters.income'),   sub: 'Tiền thu vào Ví',        ring: 'border-emerald-500 bg-emerald-500/5 ring-emerald-500' },
    { type: 'TRANSFER', icon: <ArrowLeftRight  className="size-8 text-blue-500"    />, label: t('filters.transfer'), sub: 'Chuyển giữa hai Ví',     ring: 'border-blue-500    bg-blue-500/5    ring-blue-500'    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#0c0c0e] animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5 dark:border-zinc-900 shrink-0">
          <h3 className="text-lg font-bold">{t('modal.title')}</h3>
          <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-900 shrink-0">
          <div className="relative mx-auto max-w-md">
            {/* Background line connecting the centers of the step circles */}
            <div className="absolute left-[16px] right-[16px] top-4 h-[2px] -translate-y-1/2 bg-zinc-200 dark:bg-zinc-800" />
            
            {/* Active progress line */}
            <div
              className="absolute left-[16px] top-4 h-[2px] -translate-y-1/2 bg-[#015C97] transition-all duration-500 ease-in-out"
              style={{
                width: modalStep === 1 
                  ? '0px' 
                  : modalStep === 2 
                  ? 'calc(50% - 16px)' 
                  : 'calc(100% - 32px)'
              }}
            />

            <div className="relative flex items-center justify-between">
              {[
                { num: 1, label: locale === 'vi' ? 'Loại' : 'Type' },
                { num: 2, label: locale === 'vi' ? 'Số tiền & Ví' : 'Amount & Wallet' },
                { num: 3, label: locale === 'vi' ? 'Hoàn tất' : 'Confirm' },
              ].map(({ num, label }) => {
                const isActive = modalStep >= num
                const isCurrent = modalStep === num
                return (
                  <div key={num} className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (num === 1) setModalStep(1)
                        if (num === 2 && newTxAmount) setModalStep(2)
                        if (num === 3 && newTxAmount && newTxWalletId) setModalStep(3)
                      }}
                      className={`relative z-10 flex size-8 items-center justify-center rounded-full text-xs font-black transition-all duration-550 ease-in-out border select-none cursor-pointer ${
                        isActive
                          ? 'bg-[#015C97] border-[#015C97] text-white shadow-lg shadow-blue-500/20 scale-110'
                          : 'border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-[#0c0c0e] hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {isActive && !isCurrent && num < modalStep ? (
                        <svg className="size-4 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        num
                      )}
                    </button>
                    <span className={`text-[10px] font-bold tracking-wide transition-colors duration-500 whitespace-nowrap sm:text-xs ${
                      isActive ? 'text-[#015C97] dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500'
                    }`}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">

          {/* Step 1 — Transaction type */}
          {modalStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-zinc-500">{t('modal.typeSelection')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {typeOptions.map(({ type, icon, label, sub, ring }) => (
                  <div
                    key={type}
                    onClick={() => setNewTxType(type)}
                    className={`flex flex-row sm:flex-col items-center gap-3.5 sm:gap-2.5 rounded-2xl border p-3.5 sm:p-4 text-left sm:text-center cursor-pointer transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 ${
                      newTxType === type ? `${ring} ring-2` : 'border-zinc-200 bg-white dark:border-zinc-850 dark:bg-[#0c0c0e]'
                    }`}
                  >
                    <div className="flex size-11 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 shrink-0">
                      {icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-800 dark:text-zinc-100">{label}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Amount, wallet, category, date */}
          {modalStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-zinc-500">{t('modal.amountWallet')}</p>

              {/* Amount */}
              <Input
                type="number"
                min="0"
                step="1000"
                label={`${t('modal.amount')} *`}
                placeholder={t('modal.amountPlaceholder')}
                value={newTxAmount}
                onChange={(e) => setNewTxAmount(e.target.value)}
              />

              {/* TRANSFER — two wallet pickers */}
              {newTxType === 'TRANSFER' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    label={locale === 'vi' ? 'Tài khoản nguồn *' : 'From wallet *'}
                    value={newTxWalletId}
                    options={walletOptions}
                    onChange={(val) => setNewTxWalletId(val)}
                  />
                  <Select
                    label={locale === 'vi' ? 'Tài khoản đích *' : 'To wallet *'}
                    value={newTxToWalletId}
                    options={walletOptions}
                    onChange={(val) => setNewTxToWalletId(val)}
                  />
                </div>
              ) : (
                /* INCOME / EXPENSE — wallet + category */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    label={`${t('modal.wallet')} *`}
                    value={newTxWalletId}
                    options={walletOptions}
                    onChange={(val) => setNewTxWalletId(val)}
                  />
                  <Select
                    label={t('modal.category')}
                    value={newTxCategoryId}
                    options={categoryOptions}
                    onChange={(val) => setNewTxCategoryId(val)}
                  />
                </div>
              )}

              {/* Transaction date */}
              <DatePicker
                label={`${t('modal.date')} *`}
                value={newTxDate}
                onChange={(val) => setNewTxDate(val)}
                locale={locale}
              />
            </div>
          )}

          {/* Step 3 — Review + note */}
          {modalStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-zinc-500">{t('modal.descComplete')}</p>

              {/* Summary card */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/20 text-sm space-y-2.5">
                <Row label={locale === 'vi' ? 'Loại' : 'Type'} value={t(`filters.${newTxType.toLowerCase()}`)} />
                <Row label={locale === 'vi' ? 'Số tiền' : 'Amount'} value={formatMoney(newTxAmount)} highlight />
                <Row label={locale === 'vi' ? 'Tài khoản' : 'Wallet'} value={selectedWallet?.name ?? '—'} />
                {newTxType === 'TRANSFER'
                  ? <Row label={locale === 'vi' ? 'Chuyển sang' : 'To wallet'} value={selectedToWallet?.name ?? '—'} />
                  : <Row label={locale === 'vi' ? 'Danh mục' : 'Category'} value={selectedCategory?.name ?? (locale === 'vi' ? 'Không có' : 'None')} />
                }
                <Row label={locale === 'vi' ? 'Ngày' : 'Date'} value={newTxDate} />
              </div>

              {/* Note — maps to nullable `note` field in schema */}
              <Textarea
                label={t('modal.note')}
                placeholder={t('modal.notePlaceholder')}
                value={newTxNote}
                onChange={(e) => setNewTxNote(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 px-6 py-5 dark:border-zinc-900 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => modalStep > 1 ? setModalStep(modalStep - 1) : setShowAddModal(false)}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-colors"
          >
            {modalStep === 1 ? t('modal.cancel') : t('modal.back')}
          </button>

          {modalStep < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (modalStep === 2 && (!newTxAmount || Number(newTxAmount) <= 0)) return
                setModalStep(modalStep + 1)
              }}
              className="rounded-xl bg-[#015C97] hover:bg-[#003F66] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200"
            >
              {t('modal.next')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting
                ? <><Loader2 className="size-4 animate-spin" /><span>{locale === 'vi' ? 'Đang lưu…' : 'Saving…'}</span></>
                : <span>{t('modal.submit')}</span>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-zinc-400 text-xs">{label}:</span>
      <span className={`font-bold text-sm ${highlight ? 'text-emerald-500 text-base' : ''}`}>{value}</span>
    </div>
  )
}
