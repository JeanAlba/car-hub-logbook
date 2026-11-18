export type WarrantyState = 'active' | 'expiring' | 'expired'

const MS_PER_DAY = 86_400_000
const EXPIRING_THRESHOLD_DAYS = 30

export function getWarrantyState(expiresAt: string): WarrantyState {
  const [year, month, day] = expiresAt.split('-').map(Number)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const expires = new Date(year, month - 1, day)
  const diffDays = Math.round((expires.getTime() - today.getTime()) / MS_PER_DAY)

  if (diffDays < 0) {
    return 'expired'
  }
  if (diffDays <= EXPIRING_THRESHOLD_DAYS) {
    return 'expiring'
  }
  return 'active'
}

export function previewWarrantyExpiration(dateIso: string, months?: number): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso) || !months || !Number.isInteger(months) || months < 1 || months > 120) {
    return null
  }
  const [year, month, day] = dateIso.split('-').map(Number)
  const target = new Date(Date.UTC(year, month - 1 + months, 1))
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate()
  const resolved = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, lastDay)),
  )
  return resolved.toISOString().slice(0, 10)
}
