// Supported currencies configuration for Finlo

export interface CurrencyInfo {
  code: string
  symbol: string
  nameVi: string
  nameEn: string
  locale: string
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  VND: { code: 'VND', symbol: 'đ', nameVi: 'Việt Nam Đồng (VND)', nameEn: 'Vietnamese Dong (VND)', locale: 'vi-VN' },
  USD: { code: 'USD', symbol: '$', nameVi: 'Đô la Mỹ (USD)', nameEn: 'US Dollar (USD)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', nameVi: 'Euro (EUR)', nameEn: 'Euro (EUR)', locale: 'de-DE' },
  JPY: { code: 'JPY', symbol: '¥', nameVi: 'Yên Nhật (JPY)', nameEn: 'Japanese Yen (JPY)', locale: 'ja-JP' },
  GBP: { code: 'GBP', symbol: '£', nameVi: 'Bảng Anh (GBP)', nameEn: 'British Pound (GBP)', locale: 'en-GB' },
}

export const DEFAULT_CURRENCY = 'VND'

/**
 * Formats a numeric amount based on the selected currency code and standard formats
 */
export function formatCurrency(amount: string | number, currencyCode: string = DEFAULT_CURRENCY): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numericAmount)) return '0 đ'

  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY]

  if (currency.code === 'VND') {
    // Round to integer for VND as it has no subunit denominations in standard use
    return Math.round(numericAmount).toLocaleString('vi-VN') + ' đ'
  }

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
    }).format(numericAmount)
  } catch {
    // Safe fallback formatting
    return `${currency.symbol}${numericAmount.toLocaleString()}`
  }
}
