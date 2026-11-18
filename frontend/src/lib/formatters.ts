const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatMileage(km: number): string {
  return `${numberFormatter.format(km)} km`
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-')
  if (!year || !month || !day) {
    return isoDate
  }
  return `${day}/${month}/${year}`
}

export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) {
    return digits
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function brDateToIso(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim())
  if (!match) {
    return null
  }
  const [, day, month, year] = match
  const iso = `${year}-${month}-${day}`
  const parsed = new Date(`${iso}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== iso) {
    return null
  }
  return iso
}

export function normalizePlateInput(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

export function formatPlate(plate: string): string {
  const clean = normalizePlateInput(plate)
  if (clean.length === 7) {
    return `${clean.slice(0, 3)} ${clean.slice(3)}`
  }
  return clean
}

export function formatMonthShort(yearMonth: string): string {
  const [year, month] = yearMonth.split('-')
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const monthIndex = Number(month) - 1
  if (!year || monthIndex < 0 || monthIndex > 11) {
    return yearMonth
  }
  return `${months[monthIndex]}/${year.slice(2)}`
}

export function getTodayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
