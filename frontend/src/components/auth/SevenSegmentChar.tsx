import { cn } from '@/lib/utils'

type SegmentId = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
export type DisplayChar = 'C' | 'A' | 'r' | 'H' | 'U' | 'b' | '8' | '0' | ' '

const SEGMENT_POLYGONS: Record<SegmentId, string> = {
  a: '11,4 45,4 39,13 17,13',
  b: '49,8 51,13 51,42 46,47 41,42 41,15',
  c: '41,54 46,49 51,54 51,83 49,88 41,81',
  d: '17,83 39,83 45,92 11,92',
  e: '5,54 10,49 15,54 15,81 7,88 5,83',
  f: '7,8 15,15 15,42 10,47 5,42 5,13',
  g: '12,48 17,43 39,43 44,48 39,53 17,53',
}

const CHAR_SEGMENTS: Record<DisplayChar, SegmentId[]> = {
  C: ['a', 'd', 'e', 'f'],
  A: ['a', 'b', 'c', 'e', 'f', 'g'],
  r: ['e', 'g'],
  H: ['b', 'c', 'e', 'f', 'g'],
  U: ['b', 'c', 'd', 'e', 'f'],
  b: ['c', 'd', 'e', 'f', 'g'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  ' ': [],
}

const ALL_SEGMENTS: SegmentId[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g']

interface SevenSegmentCharProps {
  char: DisplayChar
  size?: 'sm' | 'lg'
}

export function SevenSegmentChar({ char, size = 'lg' }: SevenSegmentCharProps) {
  const active = CHAR_SEGMENTS[char]

  return (
    <svg
      viewBox="0 0 56 96"
      className={cn('overflow-visible', size === 'sm' ? 'h-6 w-3.5' : 'h-24 w-14')}
      aria-hidden="true"
    >
      {ALL_SEGMENTS.map((id) => {
        const isLit = active.includes(id)
        return (
          <polygon
            key={id}
            points={SEGMENT_POLYGONS[id]}
            fill={isLit ? 'var(--brand)' : '#1a1711'}
            style={isLit ? { filter: 'drop-shadow(0 0 6px var(--brand-glow))' } : undefined}
          />
        )
      })}
    </svg>
  )
}

const WORDMARK_LEFT: DisplayChar[] = ['C', 'A', 'r']
const WORDMARK_RIGHT: DisplayChar[] = ['H', 'U', 'b']

export function SevenSegmentWordmark() {
  return (
    <div className="flex -skew-x-6 items-center gap-1" aria-label="car-hub">
      {WORDMARK_LEFT.map((char, index) => (
        <SevenSegmentChar key={`brand-l-${index}`} char={char} size="sm" />
      ))}
      <span className="w-1.5" />
      {WORDMARK_RIGHT.map((char, index) => (
        <SevenSegmentChar key={`brand-r-${index}`} char={char} size="sm" />
      ))}
    </div>
  )
}
