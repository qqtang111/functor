import { useEffect, useRef, useState } from 'react'
import { useFunctionStore } from '../../stores/functionStore'
import { useViewStore } from '../../stores/viewStore'
import { sample2D } from '../../engine/MathEngine'

export default function CurveAnimation({ width, height }) {
  const functions = useFunctionStore((s) => s.functions)
  const zoom = useViewStore((s) => s.zoom)
  const ox = useViewStore((s) => s.offsetX)
  const oy = useViewStore((s) => s.offsetY)
  const visible = functions.filter((f) => f.visible)
  const [animIds, setAnimIds] = useState(new Set())
  const prevCount = useRef(visible.length)

  useEffect(() => {
    if (visible.length > prevCount.current) {
      setAnimIds(new Set(visible.map((f) => f.id)))
    }
    prevCount.current = visible.length
  }, [visible.length])

  useEffect(() => {
    if (animIds.size === 0) return
    const timer = setTimeout(() => setAnimIds(new Set()), 900)
    return () => clearTimeout(timer)
  }, [animIds])

  // Only render during brief animation — otherwise SVG overlays duplicate the canvas curves
  if (width === 0 || height === 0 || animIds.size === 0) return null

  const RANGE = 6 / zoom
  const cx = width / 2; const cy = height / 2
  const s = Math.min(cx, cy) / RANGE

  return (
    <svg width={width} height={height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      {visible.map((f) => {
        if (!animIds.has(f.id)) return null
        const points = sample2D(f.expr, [ox - RANGE, ox + RANGE], 400)
        const pathParts = []
        let started = false
        points.forEach((p) => {
          if (p === null) { started = false; return }
          const dx = cx + (p.x - ox) * s
          const dy = cy - (p.y - oy) * s
          if (!started) { pathParts.push(`M${dx},${dy}`); started = true }
          else pathParts.push(`L${dx},${dy}`)
        })
        if (pathParts.length === 0) return null
        const d = pathParts.join(' ')
        return (
          <path key={f.id} d={d} fill="none" stroke={f.color}
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={pathParts.length * 5}
            strokeDashoffset={pathParts.length * 5}
            style={{ animation: 'functor-draw 0.8s ease-out forwards' }} />
        )
      })}
      <style>{`@keyframes functor-draw { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
  )
}
