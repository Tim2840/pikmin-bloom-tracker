// 好友所屬國家：存 ISO 3166-1 alpha-2 代碼，顯示時轉成旗幟 + 繁中國名
export const COUNTRY_CODES = [
  'TW', 'JP', 'KR', 'HK', 'MO', 'CN', 'SG', 'MY', 'TH', 'VN', 'PH', 'ID',
  'IN', 'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE',
  'GB', 'IE', 'FR', 'DE', 'IT', 'ES', 'PT', 'NL', 'BE', 'CH', 'AT',
  'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'GR', 'TR', 'RU', 'UA',
  'AU', 'NZ', 'AE', 'SA', 'IL', 'EG', 'ZA',
] as const

const FALLBACK_COLOR = '#6B7280'

// 國家沒有「代表色」概念，圖表/月曆仍需區分好友，改由國家代碼穩定對應一組色
const PALETTE = ['#EF4444', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F97316', '#14B8A6']

const displayNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['zh-Hant'], { type: 'region' })
    : null

export function countryFlag(code?: string): string {
  if (!code || !/^[A-Z]{2}$/.test(code)) return '🌐'
  return String.fromCodePoint(...[...code].map(c => 0x1f1e6 + c.charCodeAt(0) - 65))
}

export function countryName(code?: string): string {
  if (!code) return ''
  return displayNames?.of(code) || code
}

export function countryLabel(code?: string): string {
  return code ? `${countryFlag(code)} ${countryName(code)}` : ''
}

export function colorForCountry(code?: string): string {
  if (!code) return FALLBACK_COLOR
  const sum = [...code].reduce((n, c) => n + c.charCodeAt(0), 0)
  return PALETTE[sum % PALETTE.length]
}
