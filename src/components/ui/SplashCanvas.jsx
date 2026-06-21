import { useEffect, useRef } from 'react'
import { sample2D } from '../../engine/MathEngine'

const CURVES = [
  { expr: 'sin(x)', color: '#6366f1', speed: 0.3, phase: 0, amplitude: 0.8 },
  { expr: 'cos(1.3*x)', color: '#fbbf24', speed: 0.42, phase: Math.PI / 3, amplitude: 0.6 },
  { expr: 'sin(0.7*x)*cos(x)', color: '#22c55e', speed: 0.35, phase: Math.PI / 2, amplitude: 0.5 },
  { expr: '0.5*sin(2*x)+0.3*cos(3*x)', color: '#8b5cf6', speed: 0.28, phase: Math.PI * 0.7, amplitude: 0.7 },
]

export default function SplashCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    let animId
    let t = 0

    const render = () => {
      const r = c.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 2
      c.width = r.width * dpr
      c.height = r.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const W = r.width
      const H = r.height
      const cx = W / 2
      const cy = H / 2
      const s = Math.min(cx, cy) / 6
      ctx.clearRect(0, 0, W, H)

      CURVES.forEach((curve) => {
        const shiftX = Math.sin(t * curve.speed + curve.phase) * curve.amplitude
        const shiftY = Math.cos(t * curve.speed * 0.7 + curve.phase) * curve.amplitude * 0.4
        const pts = sample2D(curve.expr, [-6, 6], 300, {})
        ctx.strokeStyle = curve.color + '22'
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.beginPath()
        let started = false
        for (const p of pts) {
          if (!p) {
            started = false
            continue
          }
          const dx = cx + (p.x + shiftX) * s
          const dy = cy - (p.y + shiftY) * s
          if (!started) {
            ctx.moveTo(dx, dy)
            started = true
          } else {
            ctx.lineTo(dx, dy)
          }
        }
        ctx.stroke()
      })
      t += 0.016
      animId = requestAnimationFrame(render)
    }
    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.55,
        pointerEvents: 'none',
      }}
    />
  )
}
