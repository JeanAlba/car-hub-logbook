import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { brDateToIso, formatDate, formatDateInput, getTodayIso } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface DateInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function parseYearMonth(isoDate: string | null, fallbackIso: string): { year: number; month: number } {
  const source = isoDate ?? fallbackIso
  const [year, month] = source.split('-').map(Number)
  return { year, month: month - 1 }
}

function buildIso(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function DateInput({ id, value, onChange, onBlur }: DateInputProps) {
  const todayIso = getTodayIso()
  const selectedIso = brDateToIso(value)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => parseYearMonth(selectedIso, todayIso))

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setView(parseYearMonth(selectedIso, todayIso))
    }
    setOpen(nextOpen)
  }

  function stepMonth(delta: number) {
    setView((current) => {
      const target = new Date(Date.UTC(current.year, current.month + delta, 1))
      return { year: target.getUTCFullYear(), month: target.getUTCMonth() }
    })
  }

  function selectIso(iso: string) {
    onChange(formatDate(iso))
    setOpen(false)
  }

  const firstWeekday = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate()
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          maxLength={10}
          placeholder="dd/mm/aaaa"
          className="tabular pr-9 placeholder:font-sans"
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(formatDateInput(event.target.value))}
        />
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            aria-label="Abrir calendário"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Calendar className="size-4" />
          </button>
        </PopoverPrimitive.Trigger>
      </div>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={6}
          className="z-50 w-68 rounded-md border bg-popover p-3 text-popover-foreground shadow-lg outline-none"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <button
              type="button"
              aria-label="Mês anterior"
              onClick={() => stepMonth(-1)}
              className="flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs font-semibold">
              {MONTH_NAMES[view.month]} {view.year}
            </span>
            <button
              type="button"
              aria-label="Próximo mês"
              onClick={() => stepMonth(1)}
              className="flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
            {WEEKDAYS.map((day, index) => (
              <span key={index} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, index) => {
              if (day === null) {
                return <span key={`empty-${index}`} />
              }

              const iso = buildIso(view.year, view.month, day)
              const isSelected = iso === selectedIso
              const isToday = iso === todayIso

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => selectIso(iso)}
                  className={cn(
                    'tabular flex h-8 items-center justify-center rounded-sm text-xs transition-colors',
                    isSelected
                      ? 'bg-brand font-semibold text-primary-foreground'
                      : isToday
                        ? 'border border-brand/60 text-brand hover:bg-accent'
                        : 'text-foreground hover:bg-accent',
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <div className="mt-2.5 flex justify-end border-t border-border/70 pt-2">
            <button
              type="button"
              onClick={() => selectIso(todayIso)}
              className="text-xs font-medium text-brand hover:underline"
            >
              Hoje
            </button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
