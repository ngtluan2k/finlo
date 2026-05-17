/**
 * Remove Vietnamese accents/diacritics and convert to standard Latin characters
 */
export function removeVietnameseTones(str: string): string {
  let result = str.normalize('NFD') // Decompose combined accent marks
  
  // Remove combining diacritical marks
  result = result.replace(/[\u0300-\u036f]/g, '')
  
  // Manual overrides for specific Vietnamese-only characters (đ, Đ)
  result = result.replace(/[đ]/g, 'd')
  result = result.replace(/[Đ]/g, 'D')
  
  // Extra guard mapping for any edge-case Unicode normalized characters
  result = result
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[ÌÍỊỈĨ]/g, 'I')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/[ỲÝỴỶỸ]/g, 'Y')
    
  return result
}

/**
 * Format string as lowercase hyphenated slug (e.g. 'thu-chi-thang-5')
 */
export function toSlug(str: string): string {
  return removeVietnameseTones(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphen
    .replace(/^-+|-+$/g, '')     // Trim leading/trailing hyphens
}

/**
 * Format string as uppercase underscored code (e.g. 'CHIEF_ACCOUNTANT')
 */
export function toCode(str: string): string {
  return removeVietnameseTones(str)
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, '_') // Replace non-alphanumeric chars with underscore
    .replace(/^_+|_+$/g, '')      // Trim leading/trailing underscores
}

/**
 * Format string as snake_case (e.g. 'role_name_description')
 */
export function toSnakeCase(str: string): string {
  return removeVietnameseTones(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_') // Replace non-alphanumeric chars with underscore
    .replace(/^_+|_+$/g, '')      // Trim leading/trailing underscores
}

/**
 * Format string as camelCase (e.g. 'accountantOfficerRole')
 */
export function toCamelCase(str: string): string {
  const words = removeVietnameseTones(str)
    .trim()
    .replace(/[^a-zA-Z0-9\s]+/g, '')
    .split(/\s+/)
  
  if (words.length === 0 || !words[0]) return ''
  
  return words
    .map((word, idx) => {
      const cleaned = word.toLowerCase()
      if (idx === 0) return cleaned
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    })
    .join('')
}

/**
 * Automatically transforms a source input field to a target code or slug value
 * 
 * @example
 * // Title -> Slug: 'Giới thiệu về Finlo!' -> 'gioi-thieu-ve-finlo'
 * const slug = autoRenderCode('Giới thiệu về Finlo!', 'slug')
 * 
 * // Role Name -> Role Code: 'Thủ quỹ chi nhánh' -> 'THU_QUY_CHI_NHANH'
 * const code = autoRenderCode('Thủ quỹ chi nhánh', 'code')
 * 
 * @param sourceValue The raw string value from the source field (e.g. title, name_role)
 * @param targetType The target code formatting type ('slug' | 'code' | 'snake' | 'camel')
 */
export function autoRenderCode(
  sourceValue: string,
  targetType: 'slug' | 'code' | 'snake' | 'camel'
): string {
  if (!sourceValue) return ''
  
  switch (targetType) {
    case 'slug':
      return toSlug(sourceValue)
    case 'code':
      return toCode(sourceValue)
    case 'snake':
      return toSnakeCase(sourceValue)
    case 'camel':
      return toCamelCase(sourceValue)
    default:
      return sourceValue
  }
}

/**
 * Get initials from a name or email (e.g. 'Luan Nguyen' -> 'LN')
 */
export function getInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}
