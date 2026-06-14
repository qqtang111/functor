import { useEffect, useRef } from 'react'
import { useFunctionStore } from '../../stores/functionStore'
import { useViewStore } from '../../stores/viewStore'
import { sample2D } from '../../engine/MathEngine'

/**
 * Renders a moving dot along the first visible function curve.
 * Leaves a fading trail of particles behind.
 */
export default function PointMotion({ width, height }) {
  const canvasRef = useRef(null)
  const functions = useFunctionStore((s) => s.functions)
  const visible = functions.filter((f) => f.visible)
  const motionActive = useViewStore((s) => s.motionActive)
  const motionSpeed = useViewStore((s) => s.motionSpeed)
  const setTrackerPos = useViewStore((s) => s.setTrackerPos)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !motionActive || visible.length === 0) {
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      setTrackerPos(null)
      return
    }

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 2
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const RANGE = 6
    const cx = width / 2
    const cy = height / 2
    const sx = cx / RANGE
    const sy = cy / RANGE

    const fn = visible[0]
    const points = sample2D(fn.expr, [-RANGE, RANGE], 600).filter(Boolean)
    if (points.length === 0) return

    const trail = []
    const MAX_TRAIL = 20
    let idx = 0
    let animId

    const step = () => {
      ctx.clearRect(0, 0, width, height)

      idx = (idx + 0.3 * motionSpeed) % points.length
      const p = points[Math.floor(idx)]
      if (!p) { animId = requestAnimationFrame(step); return }

      const px = cx + p.x * sx
      const py = cy - p.y * sy

      trail.push({ x: px, y: py, alpha: 1 })
      if (trail.length > MAX_TRAIL) trail.shift()
      trail.forEach((t) => { t.alpha -= 0.04 })

      trail.forEach((t, i) => {
        if (t.alpha <= 0) return
        ctx.beginPath()
        ctx.arc(t.x, t.y, 3 + (i / MAX_TRAIL) * 2, 0, Math.PI * 2)
        ctx.fillStyle = `${fn.color}${Math.round(t.alpha * 60).toString(16).padStart(2, '0')}`
        ctx.fill()
      })

      // Glow halo
      ctx.beginPath()
      ctx.arc(px, py, 8, 0, Math.PI * 2)
      ctx.fillStyle = `${fn.color}33`
      ctx.fill()

      // Main dot
      ctx.beginPath()
      ctx.arc(px, py, 5, 0, Math.PI * 2)
      ctx.fillStyle = fn.color
      ctx.fill()

      // White center
      ctx.beginPath()
      ctx.arc(px, py, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()

      setTrackerPos({ x: p.x.toFixed(2), y: p.y.toFixed(2) })

      animId = requestAnimationFrame(step)
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [motionActive, motionSpeed, visible.length, width, height])

  if (!motionActive) return null

  return (
    <canvas ref={canvasRef}
      style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
