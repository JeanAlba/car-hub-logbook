const MS_PER_DAY = 86_400_000;

export const roundMoney = (value: number): number => Math.round(value * 100) / 100;

export function toUtcIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addUtcDays(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

export function diffUtcDays(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00.000Z`).getTime();
  const to = new Date(`${toIso}T00:00:00.000Z`).getTime();
  return Math.round((to - from) / MS_PER_DAY);
}

export function getRecentMonthKeys(referenceDate: Date, count = 12): string[] {
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth();
  const keys: string[] = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(year, month - offset, 1));
    keys.push(date.toISOString().slice(0, 7));
  }

  return keys;
}
