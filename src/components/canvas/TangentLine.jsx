import { useMemo } from 'react'
import { useViewStore } from '../../stores/viewStore'
import { useFunctionStore } from '../../stores/functionStore'
import { sample2D, computeDerivative } from '../../engine/MathEngine'
import { create, all } from 'mathjs'

const math = create(all, {})

export default function TangentLine({ width, height }) {
  const demoActive = useViewStore((s) => s.demoActive)
  const demoFunctionId = useViewStore((s) => s.demoFunctionId)
  const demoProgress = useViewStore((s) => s.demoProgress)
  const zoom = useViewStore((s) => s.zoom)
  const ox = useViewStore((s) => s.offsetX)
  const oy = useViewStore((s) => s.offsetY)
  const functions = useFunctionStore((s) => s.functions)
  const fn = functions.find((f) => f.id === demoFunctionId)

  const line = useMemo(() => {
    if (!demoActive || !fn || fn.isDerivative || width === 0 || height === 0) return null
    const RANGE = 6 / zoom
    const cx = width / 2; const cy = height / 2
    const s = Math.min(cx, cy) / RANGE

    // Pass parameter values to derivative evaluation
    const paramSubs = {}
    if (fn.parameters) {
      for (const [k, v] of Object.entries(fn.parameters)) paramSubs[k] = v.value
    }

    const points = sample2D(fn.expr, [ox - RANGE, ox + RANGE], 600, paramSubs)
    const valid = points.filter(Boolean)
    if (valid.length === 0) return null
    const idx = Math.floor(demoProgress * (valid.length - 1))
    const pt = valid[Math.min(idx, valid.length - 1)]
    if (!pt) return null
    const x0 = pt.x; const y0 = pt.y

    // Symbolic derivative with param values
    let slope = null
    const deriv = computeDerivative(fn.expr)
    if (deriv) {
      try { slope = deriv.compiled.evaluate({ x: x0, ...paramSubs }) } catch {}
    }
    if (slope === null || !isFinite(slope)) {
      // Numerical fallback
      try {
        const h = 0.001
        const y1 = math.compile(fn.expr).evaluate({ x: x0 + h, ...paramSubs })
        const y2 = math.compile(fn.expr).evaluate({ x: x0 - h, ...paramSubs })
        slope = (y1 - y2) / (2 * h)
      } catch { return null }
    }
    if (!isFinite(slope)) return null

    const xMin = ox - RANGE; const xMax = ox + RANGE
    const yMin = slope * (xMin - x0) + y0
    const yMax = slope * (xMax - x0) + y0
    return {
      x1: cx + (xMin - ox) * s, y1: cy - (yMin - oy) * s,
      x2: cx + (xMax - ox) * s, y2: cy - (yMax - oy) * s,
      px: cx + (x0 - ox) * s, py: cy - (y0 - oy) * s,
    }
  }, [demoActive, fn?.id, fn?.parameters, demoProgress, zoom, ox, oy, width, height])

  if (!line) return null

  return (
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 5 }}>
      <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="6 3" opacity={0.8} />
      <circle cx={line.px} cy={line.py} r="7" fill="#fbbf24" opacity={0.3} />
      <circle cx={line.px} cy={line.py} r="4" fill="#fbbf24" />
      <circle cx={line.px} cy={line.py} r="2" fill="white" />
    </svg>
  )
}
