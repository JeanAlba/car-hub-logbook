interface TachSegment {
  index: number
  path: string
  isRedline: boolean
}

interface TachLabel {
  value: string
  x: number
  y: number
}

export const TACH_COUNT = 28
const TACH_CX = 232
const TACH_CY = 224
const TACH_INNER_R = 136
const TACH_OUTER_R = 176
const TACH_START_DEG = 178
const TACH_END_DEG = 276
const TACH_STEP_DEG = (TACH_END_DEG - TACH_START_DEG) / TACH_COUNT

const degToRad = (deg: number): number => (deg * Math.PI) / 180

const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => {
  const rad = degToRad(deg)
  return [
    Number((cx + r * Math.cos(rad)).toFixed(2)),
    Number((cy + r * Math.sin(rad)).toFixed(2)),
  ]
}

const TACH_SEGMENTS: TachSegment[] = Array.from({ length: TACH_COUNT }, (_, index) => {
  const a0 = TACH_START_DEG + index * TACH_STEP_DEG + 0.45
  const a1 = TACH_START_DEG + (index + 1) * TACH_STEP_DEG - 0.45
  const [x1, y1] = polar(TACH_CX, TACH_CY, TACH_INNER_R, a0)
  const [x2, y2] = polar(TACH_CX, TACH_CY, TACH_OUTER_R, a0)
  const [x3, y3] = polar(TACH_CX, TACH_CY, TACH_OUTER_R, a1)
  const [x4, y4] = polar(TACH_CX, TACH_CY, TACH_INNER_R, a1)

  return {
    index,
    isRedline: index >= 24,
    path: `M ${x1} ${y1} L ${x2} ${y2} A ${TACH_OUTER_R} ${TACH_OUTER_R} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${TACH_INNER_R} ${TACH_INNER_R} 0 0 0 ${x1} ${y1} Z`,
  }
})

const TACH_SCALE_POINTS: Array<{ value: string; frac: number }> = [
  { value: '5', frac: 0.02 },
  { value: '10', frac: 0.11 },
  { value: '20', frac: 0.25 },
  { value: '30', frac: 0.41 },
  { value: '40', frac: 0.57 },
  { value: '50', frac: 0.72 },
  { value: '60', frac: 0.86 },
  { value: '70', frac: 0.98 },
]

const TACH_LABELS: TachLabel[] = TACH_SCALE_POINTS.map(({ value, frac }) => {
  const deg = TACH_START_DEG + frac * (TACH_END_DEG - TACH_START_DEG)
  const [x, y] = polar(TACH_CX, TACH_CY, 198, deg)
  return { value, x, y }
})

const GUIDE_ARC_PATH = (() => {
  const [sx, sy] = polar(TACH_CX, TACH_CY, TACH_INNER_R - 7, TACH_START_DEG)
  const [ex, ey] = polar(TACH_CX, TACH_CY, TACH_INNER_R - 7, TACH_END_DEG)
  return `M ${sx} ${sy} A ${TACH_INNER_R - 7} ${TACH_INNER_R - 7} 0 0 1 ${ex} ${ey}`
})()

export function RightTachometer({ litSegments }: { litSegments: number }) {
  return (
    <svg viewBox="0 0 272 246" className="h-auto w-full select-none" aria-hidden="true">
      <path d={GUIDE_ARC_PATH} fill="none" stroke="var(--brand)" strokeOpacity="0.4" strokeWidth="1" />

      {TACH_SEGMENTS.map((segment) => {
        const isLit = segment.index < litSegments
        const fill = isLit
          ? segment.isRedline
            ? '#dc2626'
            : 'var(--brand)'
          : segment.isRedline
            ? '#2a1212'
            : '#1b1811'

        return (
          <path
            key={segment.index}
            d={segment.path}
            fill={fill}
            style={
              isLit && !segment.isRedline
                ? { filter: 'drop-shadow(0 0 4px var(--brand-glow))' }
                : undefined
            }
          />
        )
      })}

      {TACH_LABELS.map((label) => (
        <text
          key={label.value}
          x={label.x}
          y={label.y}
          fill={label.value === '60' || label.value === '70' ? '#e05252' : 'var(--brand)'}
          fontSize="13"
          fontWeight="600"
          fontFamily="var(--font-mono)"
          textAnchor="middle"
          dominantBaseline="central"
          className="-skew-x-6"
        >
          {label.value}
        </text>
      ))}

      <text
        x="212"
        y="196"
        fill="var(--brand)"
        fontSize="12"
        fontWeight="600"
        fontFamily="var(--font-mono)"
        textAnchor="middle"
      >
        min⁻¹
      </text>
      <text
        x="212"
        y="212"
        fill="var(--brand)"
        fontSize="12"
        fontWeight="600"
        fontFamily="var(--font-mono)"
        textAnchor="middle"
      >
        x 100
      </text>
    </svg>
  )
}
