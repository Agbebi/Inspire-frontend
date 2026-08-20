export default function TrendChart({ data, height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No trend data yet
      </div>
    )
  }

  const width = 560
  const padX = 36
  const padY = 24
  const innerW = width - padX * 2
  const innerH = height - padY * 2

  const values = data.map((d) => d.average).filter((v) => v != null)
  const max = Math.max(100, ...values)
  const min = Math.min(0, ...values)

  const points = data.map((d, i) => {
    const x = padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
    const y =
      d.average == null
        ? null
        : padY + innerH - ((d.average - min) / (max - min || 1)) * innerH
    return { x, y, d }
  })

  const linePath = points
    .filter((p) => p.y != null)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ")

  const areaPath = points.filter((p) => p.y != null).length
    ? `${linePath} L ${points[points.length - 1].x} ${padY + innerH} L ${points[0].x} ${padY + innerH} Z`
    : ""

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => padY + innerH - t * innerH)

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: width }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((y, i) => (
          <line key={i} x1={padX} y1={y} x2={width - padX} y2={y} stroke="currentColor" className="text-border" strokeWidth="1" />
        ))}

        {areaPath && <path d={areaPath} fill="url(#trendFill)" />}
        {linePath && <path d={linePath} fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

        {points.map((p, i) => (
          <g key={i}>
            {p.y != null && <circle cx={p.x} cy={p.y} r="4" fill="var(--color-brand)" />}
            <text x={p.x} y={height - 6} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10 }}>
              {p.d.term?.replace(" Term", "")}
            </text>
            {p.y != null && (
              <text x={p.x} y={Math.max(p.y - 10, 12)} textAnchor="middle" className="fill-foreground font-medium" style={{ fontSize: 10 }}>
                {p.d.average}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
