import { useEffect, useRef, useState } from 'react'
import { useFunctionStore } from '../../stores/functionStore'
import { useViewStore } from '../../stores/viewStore'
import { sample2D } from '../../engine/MathEngine'
import { gsap } from 'gsap'

export default function CurveAnimation({ width, height }) {
  const svgRef = useRef(null)
  const functions = useFunctionStore((s) => s.functions)
  const zoom = useViewStore((s) => s.zoom); const ox = useViewStore((s) => s.offsetX); const oy = useViewStore((s) => s.offsetY)
  const visible = functions.filter((f) => f.visible)
  const [animIds, setAnimIds] = useState(new Set())
  const prevCount = useRef(visible.length)

  useEffect(() => {
    if (visible.length > prevCount.current) setAnimIds(new Set(visible.map((f) => f.id)))
    prevCount.current = visible.length
  }, [visible.length])

  useEffect(() => {
    if (animIds.size === 0 || !svgRef.current) return
    const paths = svgRef.current.querySelectorAll('path')
    const tl = gsap.timeline({ onComplete: () => setAnimIds(new Set()) })
    paths.forEach((p) => { const len = p.getTotalLength(); tl.fromTo(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 0.7 }, { strokeDashoffset: 0, opacity: 1, duration: 0.9, ease: 'power2.inOut' }, '<') })
  }, [animIds])

  if (width === 0 || height === 0 || animIds.size === 0) return null

  const RANGE = 6 / zoom; const cx = width / 2; const cy = height / 2; const s = Math.min(cx, cy) / RANGE

  return (
    <svg ref={svgRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 3 }}>
      {visible.map((f) => {
        if (!animIds.has(f.id)) return null
        const pts = sample2D(f.expr, [ox - RANGE, ox + RANGE], 400).filter(Boolean)
        if (pts.length < 2) return null
        const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + (cx + (p.x - ox) * s).toFixed(1) + ',' + (cy - (p.y - oy) * s).toFixed(1)).join(' ')
        return <path key={f.id} d={d} fill="none" stroke={f.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      })}
    </svg>
  )
}
