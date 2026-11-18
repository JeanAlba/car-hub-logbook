import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  AuxBarRow,
  BatteryIcon,
  CheckEngineIcon,
  FuelIcon,
  OilIcon,
  TempIcon,
} from '@/components/auth/AuxBarRow'
import { RightTachometer, TACH_COUNT } from '@/components/auth/RightTachometer'
import {
  SevenSegmentChar,
  SevenSegmentWordmark,
  type DisplayChar,
} from '@/components/auth/SevenSegmentChar'
import { cn } from '@/lib/utils'

interface MonzaAuthClusterProps {
  mode: 'login' | 'register'
  children: ReactNode
  revBoost: number
  isSubmitting: boolean
  hasError: boolean
}

const SPEEDO_TEST: DisplayChar[] = ['8', '8', '8']
const SPEEDO_PARKED: DisplayChar[] = [' ', ' ', '0']

const TOTAL_ODO_DIGITS = ['0', '0', '4', '3', '6', '1']
const TRIP_ODO_DIGITS = ['0', '0', '1', '2']

const OIL_HEIGHTS = [42, 58, 76, 92, 100, 100, 100, 100, 100, 100, 100, 100]
const BATTERY_HEIGHTS = Array.from({ length: 14 }, () => 100)
const TEMP_HEIGHTS = [38, 52, 68, 84, 96, 100, 100, 100, 100, 100, 100, 100]
const FUEL_HEIGHTS = Array.from({ length: 14 }, (_, index) => Math.round(32 + (index / 13) * 68))

const IDLE_OFFSETS = [0, 1, 0, -1]
const OIL_BASE = 8
const BATTERY_BASE = 10

function stepAux(current: number, base: number): number {
  if (current <= base - 1) {
    return current + 1
  }
  if (current >= base + 1) {
    return current - 1
  }
  return current + (Math.random() < 0.5 ? -1 : 1)
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function MechanicalOdometer({ digits, decimalLast = false }: { digits: string[]; decimalLast?: boolean }) {
  return (
    <div className="inline-flex overflow-hidden rounded-[2px] border border-[#2a2418] bg-[#040404] p-[2px]">
      {digits.map((digit, index) => {
        const isLastDecimal = decimalLast && index === digits.length - 1
        return (
          <span
            key={index}
            className={cn(
              'tabular flex h-5 w-4 items-center justify-center border-r border-[#1f1b13] text-[11px] font-semibold last:border-r-0',
              isLastDecimal ? 'bg-[#1a150b] text-brand' : 'bg-[#0b0a08] text-[#cbb07a]',
            )}
          >
            {digit}
          </span>
        )
      })}
    </div>
  )
}

export function MonzaAuthCluster({
  mode,
  children,
  revBoost,
  isSubmitting,
  hasError,
}: MonzaAuthClusterProps) {
  const [ignitionStep, setIgnitionStep] = useState<'test' | 'settle' | 'running'>(() =>
    prefersReducedMotion() ? 'running' : 'test',
  )
  const [idleIndex, setIdleIndex] = useState(0)
  const [auxValues, setAuxValues] = useState<{ oil: number; battery: number }>({
    oil: OIL_BASE,
    battery: BATTERY_BASE,
  })

  function handleInputCapture() {
    if (prefersReducedMotion()) {
      return
    }
    setAuxValues((prev) => ({
      oil: stepAux(revBoost > 0 ? prev.oil : OIL_BASE, OIL_BASE),
      battery: stepAux(revBoost > 0 ? prev.battery : BATTERY_BASE, BATTERY_BASE),
    }))
  }

  useEffect(() => {
    if (prefersReducedMotion()) {
      return
    }

    const settleTimer = window.setTimeout(() => setIgnitionStep('settle'), 420)
    const runTimer = window.setTimeout(() => setIgnitionStep('running'), 900)

    return () => {
      window.clearTimeout(settleTimer)
      window.clearTimeout(runTimer)
    }
  }, [])

  useEffect(() => {
    if (ignitionStep !== 'running' || prefersReducedMotion()) {
      return
    }

    const interval = window.setInterval(() => {
      setIdleIndex((prev) => (prev + 1) % IDLE_OFFSETS.length)
    }, 230)

    return () => window.clearInterval(interval)
  }, [ignitionStep])

  const idleOffset = IDLE_OFFSETS[idleIndex]
  const baseTach = 4 + idleOffset
  const liveTach = isSubmitting
    ? 22 + idleOffset
    : Math.min(26, baseTach + Math.min(14, revBoost))

  const tachLit =
    ignitionStep === 'test' ? TACH_COUNT : ignitionStep === 'settle' ? 14 : liveTach

  const oilLit =
    ignitionStep === 'test'
      ? 12
      : isSubmitting
        ? OIL_BASE + 1
        : revBoost > 0
          ? auxValues.oil
          : OIL_BASE
  const batteryLit =
    ignitionStep === 'test'
      ? 14
      : isSubmitting
        ? BATTERY_BASE + 1
        : revBoost > 0
          ? auxValues.battery
          : BATTERY_BASE
  const tempLit = ignitionStep === 'test' ? 12 : 6
  const fuelLit = ignitionStep === 'test' ? 14 : 10

  const showLampTest = ignitionStep === 'test'
  const speedoChars = showLampTest ? SPEEDO_TEST : SPEEDO_PARKED

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <header className="relative z-30 border-b border-border/60 bg-black">
        <div className="mx-auto flex h-14 w-full max-w-[1300px] items-center px-6">
          <SevenSegmentWordmark />
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-black px-6 py-6">
        <div
          aria-hidden="true"
          className="pointer-events-none w-full max-w-[1180px] rounded-md border border-border/50 bg-[#050607] p-6 opacity-80 select-none"
        >
          <div className="grid min-h-[430px] grid-cols-[290px_1fr_320px] items-stretch gap-8">
            <div className="flex flex-col justify-between">
              <div className="flex flex-1 flex-col justify-between py-2">
                <AuxBarRow
                  lit={oilLit}
                  total={12}
                  heights={OIL_HEIGHTS}
                  iconTone="red"
                  icon={<OilIcon />}
                />
                <AuxBarRow
                  lit={batteryLit}
                  total={14}
                  heights={BATTERY_HEIGHTS}
                  iconTone="red"
                  icon={<BatteryIcon />}
                  scaleLabels={['9', '12', '15']}
                />
                <AuxBarRow
                  lit={tempLit}
                  total={12}
                  redFrom={10}
                  heights={TEMP_HEIGHTS}
                  iconTone="red"
                  icon={<TempIcon />}
                />
                <AuxBarRow
                  lit={fuelLit}
                  total={14}
                  heights={FUEL_HEIGHTS}
                  iconTone="amber"
                  icon={<FuelIcon />}
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors',
                    hasError || showLampTest ? 'glow text-brand' : 'text-[#553c16]',
                  )}
                >
                  <CheckEngineIcon />
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-10">
              <div className="flex items-end gap-3">
                <div className="flex -skew-x-6 items-center gap-3">
                  {speedoChars.map((char, index) => (
                    <SevenSegmentChar key={`spd-${index}`} char={char} size="lg" />
                  ))}
                </div>
                <span className="mb-2 font-mono text-xs italic text-brand">km/h</span>
              </div>

              <div className="flex items-center gap-8">
                <MechanicalOdometer digits={TOTAL_ODO_DIGITS} />
                <MechanicalOdometer digits={TRIP_ODO_DIGITS} decimalLast />
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div className="flex flex-1 items-center justify-center">
                <RightTachometer litSegments={tachLit} />
              </div>

              <div className="flex justify-end pr-3 pt-2">
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-[2px] border font-mono text-xs font-bold transition-colors',
                    hasError || showLampTest
                      ? 'border-destructive bg-[#dc2626] text-white shadow-[0_0_12px_rgb(220_38_38/0.6)]'
                      : isSubmitting
                        ? 'border-border/50 bg-[#1a1010] text-[#4d2626]'
                        : 'border-redline/80 bg-redline/70 text-foreground',
                  )}
                >
                  (P)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-[1px]">
          <div className="my-auto w-full max-w-sm overflow-hidden rounded-md border border-border bg-card shadow-2xl">
            <div className="grid grid-cols-2 border-b border-border bg-display">
              <Link
                to="/login"
                className={cn(
                  '-mb-px border-b-2 py-2.5 text-center text-xs font-medium transition-colors',
                  mode === 'login'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className={cn(
                  '-mb-px border-b-2 py-2.5 text-center text-xs font-medium transition-colors',
                  mode === 'register'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                Cadastrar
              </Link>
            </div>

            <div className="p-5" onInputCapture={handleInputCapture}>
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
