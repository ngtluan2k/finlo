// Shared types for the transactions module, aligned exactly with Prisma schema

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED'
export type WalletType = 'CASH' | 'BANK' | 'E_WALLET' | 'CREDIT_CARD' | 'OTHER'
export type CategoryType = 'INCOME' | 'EXPENSE'
export type RecordStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

export interface Wallet {
  id: string
  name: string
  type: WalletType
  balance: string   // Decimal serialised as string by JSON
  status: RecordStatus
}

export interface Category {
  id: string
  name: string
  type: CategoryType
  status: RecordStatus
}

export interface TransactionCategory {
  id: string
  name: string
  type: CategoryType
}

export interface TransactionWallet {
  id: string
  name: string
  type: WalletType
  balance: string   // included from the API include
}

export interface Transaction {
  id: string
  amount: string    // Decimal serialised as string by JSON
  type: TransactionType
  status: TransactionStatus
  note: string | null
  transactionDate: string   // ISO datetime string
  category: TransactionCategory | null
  wallet: TransactionWallet
}

export interface TransactionStats {
  totalIncome: number
  totalExpense: number
  balance: number
  savingsRate: number
}

export interface TransactionPagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}
