import { useRef, useEffect, useCallback } from 'react'
import { useFunctionStore } from '../../stores/functionStore'
import { useViewStore } from '../../stores/viewStore'
import { sample2D } from '../../engine/MathEngine'
import { create, all } from 'mathjs'

const math = create(all, {})

export default function Canvas2D({ grid = true, axes = true }) {
  const canvasRef = useRef(null)
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const lastPinch = useRef(null)

  const functions = useFunctionStore((s) => s.functions)
  const demoActive = useViewStore((s) => s.demoActive)
  const demoFunctionId = useViewStore((s) => s.demoFunctionId)
  const demoProgress = useViewStore((s) => s.demoProgress)
  const zoom = useViewStore((s) => s.zoom)
  const offsetX = useViewStore((s) => s.offsetX)
  const offsetY = useViewStore((s) => s.offsetY)
  const setZoom = useViewStore((s) => s.setZoom)
  const setOffset = useViewStore((s) => s.setOffset)
  const visible = functions.filter((f) => f.visible)

  // Pan handlers — use getState() for fresh values, not stale closures
  const onPointerDown = useCallback((e) => {
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    canvasRef.current?.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    // Use fresh state to avoid stale closure bug
    const st = useViewStore.getState()
    const scale = 0.005 / st.zoom
    setOffset(st.offsetX - dx * scale, st.offsetY + dy * scale)
  }, [setOffset])

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  // Wheel zoom toward cursor (Desmos-style)
  const onWheel = useCallback((e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const W = rect.width; const H = rect.height

    // World coords of cursor before zoom
    const RANGE = 6 / zoom
    const cx = W / 2; const cy = H / 2
    const sx = cx / RANGE; const sy = cy / RANGE
    const worldX = ((mx - cx) / sx) + offsetX
    const worldY = (-(my - cy) / sy) + offsetY

    // Apply zoom
    const factor = e.deltaY > 0 ? 0.85 : 1.15
    const newZoom = zoom * factor

    // Adjust offset so worldX/worldY stays under cursor
    const newRange = 6 / newZoom
    const newSx = cx / newRange; const newSy = cy / newRange
    const newOffsetX = worldX - (mx - cx) / newSx
    const newOffsetY = worldY + (my - cy) / newSy

    setZoom(newZoom)
    setOffset(newOffsetX, newOffsetY)
  }, [zoom, offsetX, offsetY, setZoom, setOffset])

  // Touch pinch
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onTouch = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const t1 = e.touches[0]; const t2 = e.touches[1]
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
        if (lastPinch.current) {
          const factor = dist / lastPinch.current
          setZoom(zoom * factor)
        }
        lastPinch.current = dist
      } else {
        lastPinch.current = null
      }
    }
    canvas.addEventListener('touchstart', onTouch, { passive: false })
    canvas.addEventListener('touchmove', onTouch, { passive: false })
    canvas.addEventListener('touchend', () => { lastPinch.current = null })
    return () => {
      canvas.removeEventListener('touchstart', onTouch)
      canvas.removeEventListener('touchmove', onTouch)
    }
  }, [zoom, setZoom])

  // Render
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 2
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    const W = rect.width; const H = rect.height
    const RANGE = 6 / zoom
    const cx = W / 2; const cy = H / 2
    const sx = cx / RANGE; const sy = cy / RANGE
    const ox = offsetX; const oy = offsetY

    ctx.clearRect(0, 0, W, H)

    // Dynamic grid
    const rawStep = zoom > 20 ? 0.1 : zoom > 10 ? 0.2 : zoom > 5 ? 0.25 : zoom > 2 ? 0.5 : zoom > 1 ? 1 : zoom > 0.5 ? 2 : zoom > 0.2 ? 5 : 10

    if (grid) {
      // Fine grid
      const fineStep = rawStep / 5
      ctx.strokeStyle = 'rgba(255,255,255,0.015)'; ctx.lineWidth = 0.3
      const loX = ox - RANGE; const hiX = ox + RANGE
      const loY = oy - RANGE; const hiY = oy + RANGE
      for (let g = Math.floor(loX / fineStep) * fineStep; g <= hiX; g += fineStep) {
        const px = cx + (g - ox) * sx
        if (px >= 0 && px <= W) { ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke() }
      }
      for (let g = Math.floor(loY / fineStep) * fineStep; g <= hiY; g += fineStep) {
        const py = cy - (g - oy) * sy
        if (py >= 0 && py <= H) { ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke() }
      }

      // Main grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5
      for (let g = Math.floor(loX / rawStep) * rawStep; g <= hiX; g += rawStep) {
        const px = cx + (g - ox) * sx
        if (px >= 0 && px <= W) { ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke() }
      }
      for (let g = Math.floor(loY / rawStep) * rawStep; g <= hiY; g += rawStep) {
        const py = cy - (g - oy) * sy
        if (py >= 0 && py <= H) { ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke() }
      }
    }

    // Axes
    const axisX = cx - ox * sx; const axisY = cy + oy * sy
    if (axes) {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1
      if (axisY >= 0 && axisY <= H) { ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(W, axisY); ctx.stroke() }
      if (axisX >= 0 && axisX <= W) { ctx.beginPath(); ctx.moveTo(axisX, 0); ctx.lineTo(axisX, H); ctx.stroke() }
    }

    // Ticks
    if (axes) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'
      const loX = ox - RANGE; const hiX = ox + RANGE
      const loY = oy - RANGE; const hiY = oy + RANGE
      for (let t = Math.floor(loX / rawStep) * rawStep; t <= hiX; t += rawStep) {
        if (Math.abs(t) < rawStep / 2) continue
        const px = cx + (t - ox) * sx
        if (px >= 0 && px <= W) {
          const label = Math.abs(t) < 0.01 ? '0' : Number.isInteger(t) ? t : t.toFixed(rawStep < 1 ? 1 : 0)
          ctx.fillText(label, px, axisY + 14)
        }
      }
      for (let t = Math.floor(loY / rawStep) * rawStep; t <= hiY; t += rawStep) {
        if (Math.abs(t) < rawStep / 2) continue
        const py = cy - (t - oy) * sy
        if (py >= 0 && py <= H) {
          const label = Math.abs(t) < 0.01 ? '0' : Number.isInteger(t) ? t : t.toFixed(rawStep < 1 ? 1 : 0)
          ctx.fillText(label, axisX - 18, py + 4)
        }
      }
    }

    // Curves
    visible.forEach((f) => {
      ctx.strokeStyle = f.color
      ctx.lineWidth = f.isDerivative ? 1.8 : 2.5
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'
      ctx.beginPath()
      let started = false

      if (f.expr.includes(';')) {
        const [xtExpr, ytExpr] = f.expr.split(';').map((s) => s.trim())
        try {
          const xtC = math.compile(xtExpr); const ytC = math.compile(ytExpr)
          for (let i = 0; i <= 600; i++) {
            const t = (i / 600) * Math.PI * 2
            const x = xtC.evaluate({ t }); const y = ytC.evaluate({ t })
            if (!isFinite(x) || !isFinite(y)) { started = false; continue }
            const dx = cx + (x - ox) * sx; const dy = cy - (y - oy) * sy
            if (!started) { ctx.moveTo(dx, dy); started = true }
            else ctx.lineTo(dx, dy)
          }
        } catch {}
      } else {
        const pts = sample2D(f.expr, [ox - RANGE, ox + RANGE], 500)
        pts.forEach((p) => {
          if (p === null) { started = false; return }
          const dx = cx + (p.x - ox) * sx; const dy = cy - (p.y - oy) * sy
          if (!started) { ctx.moveTo(dx, dy); started = true }
          else ctx.lineTo(dx, dy)
        })
      }
      ctx.stroke()

      // Demo tracker
      if (demoActive && f.id === demoFunctionId && !f.expr.includes(';')) {
        const pts = sample2D(f.expr, [ox - RANGE, ox + RANGE], 600).filter(Boolean)
        if (pts.length > 1) {
          const idx = Math.floor(demoProgress * (pts.length - 1))
          const p = pts[Math.min(idx, pts.length - 1)]
          if (p) {
            const px = cx + (p.x - ox) * sx; const py = cy - (p.y - oy) * sy
            ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2)
            ctx.fillStyle = f.color + '55'; ctx.fill()
            ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2)
            ctx.fillStyle = f.color; ctx.fill()
            ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2)
            ctx.fillStyle = '#ffffff'; ctx.fill()
          }
        }
      }
    })
  }, [functions, visible.length, grid, axes, zoom, offsetX, offsetY, demoActive, demoFunctionId, demoProgress])

  return (
    <canvas ref={canvasRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
      style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none', cursor: 'grab' }}
    />
  )
}
