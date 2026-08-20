import { memo } from "react"

function getAverageColor(avg) {
  if (avg == null) return "var(--color-muted)"
  if (avg >= 80) return "var(--color-brand)"
  if (avg >= 70) return "#4338ca"
  if (avg >= 60) return "#0369a1"
  if (avg >= 50) return "#b45309"
  return "#b91c1c"
}

const RADIUS = 28
const STROKE = 6
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function SubjectDoughnut({ name, average }) {
  const pct = average != null ? Math.min(Math.max(average, 0), 100) / 100 : 0
  const dash = pct * CIRCUMFERENCE
  const color = getAverageColor(average)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex size-24 items-center justify-center">
        <svg className="size-full -rotate-90" viewBox={`0 0 ${RADIUS * 2 + STROKE * 2} ${RADIUS * 2 + STROKE * 2}`}>
          <circle
            cx={RADIUS + STROKE}
            cy={RADIUS + STROKE}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-muted"
          />
          <circle
            cx={RADIUS + STROKE}
            cy={RADIUS + STROKE}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-semibold text-foreground">{average != null ? average : "—"}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-center text-muted-foreground leading-tight line-clamp-2">{name}</span>
    </div>
  )
}

export default memo(SubjectDoughnut)
