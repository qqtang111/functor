import { useRef, useEffect, useCallback } from 'react'
import { useFunctionStore } from '../../stores/functionStore'
import { useViewStore } from '../../stores/viewStore'
import { sample2D } from '../../engine/MathEngine'
import { evaluateSequence, evaluatePartialSum, detectConvergence } from '../../engine/SequenceEngine'
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
    const st = useViewStore.getState()
    const scale = 0.005 / st.zoom
    setOffset(st.offsetX - dx * scale, st.offsetY + dy * scale)
  }, [setOffset])

  const onPointerUp = useCallback(() => { dragging.current = false }, [])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left; const my = e.clientY - rect.top
    const W = rect.width; const H = rect.height
    const RANGE = 6 / zoom
    const cx = W / 2; const cy = H / 2
    const s = Math.min(cx, cy) / RANGE
    const worldX = ((mx - cx) / s) + offsetX
    const worldY = (-(my - cy) / s) + offsetY
    const factor = e.deltaY > 0 ? 0.85 : 1.15
    const newZoom = zoom * factor
    const newRange = 6 / newZoom
    const newS = Math.min(cx, cy) / newRange
    setZoom(newZoom)
    setOffset(worldX - (mx - cx) / newS, worldY + (my - cy) / newS)
  }, [zoom, offsetX, offsetY, setZoom, setOffset])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onTouch = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const t1 = e.touches[0]; const t2 = e.touches[1]
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
        if (lastPinch.current) setZoom(zoom * (dist / lastPinch.current))
        lastPinch.current = dist
      } else lastPinch.current = null
    }
    canvas.addEventListener('touchstart', onTouch, { passive: false })
    canvas.addEventListener('touchmove', onTouch, { passive: false })
    canvas.addEventListener('touchend', () => { lastPinch.current = null })
    return () => {
      canvas.removeEventListener('touchstart', onTouch)
      canvas.removeEventListener('touchmove', onTouch)
    }
  }, [zoom, setZoom])

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
    const s = Math.min(cx, cy) / RANGE
    const ox = offsetX; const oy = offsetY

    ctx.clearRect(0, 0, W, H)

    // Grid
    const rawStep = zoom > 20 ? 0.1 : zoom > 10 ? 0.2 : zoom > 5 ? 0.25 : zoom > 2 ? 0.5 : zoom > 1 ? 1 : zoom > 0.5 ? 2 : zoom > 0.2 ? 5 : 10
    if (grid) {
      const fineStep = rawStep / 5
      ctx.strokeStyle = 'rgba(255,255,255,0.015)'; ctx.lineWidth = 0.3
      const loX = ox - RANGE; const hiX = ox + RANGE
      const loY = oy - RANGE; const hiY = oy + RANGE
      for (let g = Math.floor(loX / fineStep) * fineStep; g <= hiX; g += fineStep) {
        const px = cx + (g - ox) * s
        if (px >= 0 && px <= W) { ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke() }
      }
      for (let g = Math.floor(loY / fineStep) * fineStep; g <= hiY; g += fineStep) {
        const py = cy - (g - oy) * s
        if (py >= 0 && py <= H) { ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke() }
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5
      for (let g = Math.floor(loX / rawStep) * rawStep; g <= hiX; g += rawStep) {
        const px = cx + (g - ox) * s
        if (px >= 0 && px <= W) { ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke() }
      }
      for (let g = Math.floor(loY / rawStep) * rawStep; g <= hiY; g += rawStep) {
        const py = cy - (g - oy) * s
        if (py >= 0 && py <= H) { ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke() }
      }
    }

    // Axes
    const axisX = cx - ox * s; const axisY = cy + oy * s
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
        const px = cx + (t - ox) * s
        if (px >= 0 && px <= W) ctx.fillText(Number.isInteger(t) ? t : t.toFixed(rawStep < 1 ? 1 : 0), px, axisY + 14)
      }
      for (let t = Math.floor(loY / rawStep) * rawStep; t <= hiY; t += rawStep) {
        if (Math.abs(t) < rawStep / 2) continue
        const py = cy - (t - oy) * s
        if (py >= 0 && py <= H) ctx.fillText(Number.isInteger(t) ? t : t.toFixed(rawStep < 1 ? 1 : 0), axisX - 18, py + 4)
      }
    }

    // ── Render functions ──
    visible.forEach((f) => {
      // Phase 8: Build parameter substitution
      const paramSubs = {}
      if (f.parameters) {
        for (const [k, v] of Object.entries(f.parameters)) paramSubs[k] = v.value
      }

      // Phase 8: Sequence / PartialSum mode
      if ((f.mode === 'sequence' || f.mode === 'partialSum') && !f.isDerivative) {
        drawSequence(ctx, f, cx, cy, s, s, ox, oy, W, H, paramSubs)
        return
      }

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
            const x = xtC.evaluate({ t, ...paramSubs })
            const y = ytC.evaluate({ t, ...paramSubs })
            if (!isFinite(x) || !isFinite(y)) { started = false; continue }
            const dx = cx + (x - ox) * s; const dy = cy - (y - oy) * s
            if (!started) { ctx.moveTo(dx, dy); started = true }
            else ctx.lineTo(dx, dy)
          }
        } catch {}
      } else {
        const pts = sample2D(f.expr, [ox - RANGE, ox + RANGE], 500, paramSubs)
        pts.forEach((p) => {
          if (p === null) { started = false; return }
          const dx = cx + (p.x - ox) * s; const dy = cy - (p.y - oy) * s
          if (!started) { ctx.moveTo(dx, dy); started = true }
          else ctx.lineTo(dx, dy)
        })
      }
      ctx.stroke()

      // Demo tracker
      if (demoActive && f.id === demoFunctionId && !f.expr.includes(';')) {
        const pts = sample2D(f.expr, [ox - RANGE, ox + RANGE], 600, paramSubs).filter(Boolean)
        if (pts.length > 1) {
          const idx = Math.floor(demoProgress * (pts.length - 1))
          const p = pts[Math.min(idx, pts.length - 1)]
          if (p) {
            const px = cx + (p.x - ox) * s; const py = cy - (p.y - oy) * s
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
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
      onWheel={onWheel}
      style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none', cursor: 'grab' }}
    />
  )
}

/**
 * Phase 8: Render sequence / partial sum data
 */
function drawSequence(ctx, f, cx, cy, s, _unused, ox, oy, W, H, paramSubs) {
  const { expr, mode, color, sequenceConfig: cfg } = f
  const N = cfg.N || 50
  // Use playN for animated playback (only show points up to playN)
  const effectiveN = cfg.animating && cfg.playN ? Math.floor(cfg.playN) : N
  const displayMode = cfg.displayMode || 'points'

  let data
  if (mode === 'sequence') {
    data = evaluateSequence(expr, N, paramSubs)
  } else {
    data = evaluatePartialSum(expr, N, paramSubs)
  }

  // Filter to only show up to effectiveN during playback
  const visibleData = cfg.animating ? data.filter((d) => d.n <= effectiveN) : data

  const sourceData = cfg.animating ? visibleData : data
  const points = sourceData
    .filter((d) => {
      const val = mode === 'partialSum' ? d.partialSum : d.value
      return val !== null && val !== undefined && isFinite(val)
    })
    .map((d) => ({
      n: d.n,
      value: mode === 'partialSum' ? d.partialSum : d.value,
    }))

  if (points.length === 0) return

  const screenPts = points.map((p) => ({
    px: cx + (p.n - ox) * s,
    py: cy - (p.value - oy) * s,
  }))

  const clamped = screenPts.filter((p) => p.px >= -50 && p.px <= W + 50 && p.py >= -50 && p.py <= H + 50)

  // Draw connections
  if (displayMode === 'points+lines' || displayMode === 'staircase') {
    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'
    ctx.beginPath()
    if (displayMode === 'staircase') {
      for (let i = 0; i < clamped.length - 1; i++) {
        const a = clamped[i]; const b = clamped[i + 1]
        ctx.moveTo(a.px, a.py)
        ctx.lineTo(b.px, a.py)
        ctx.lineTo(b.px, b.py)
      }
    } else {
      for (let i = 0; i < clamped.length; i++) {
        if (i === 0) ctx.moveTo(clamped[i].px, clamped[i].py)
        else ctx.lineTo(clamped[i].px, clamped[i].py)
      }
    }
    ctx.stroke()
    ctx.restore()
  }

  // Draw points
  clamped.forEach((p, i) => {
    const alpha = Math.round(128 + 127 * (i / Math.max(1, clamped.length - 1)))
    ctx.beginPath()
    ctx.arc(p.px, p.py, 4, 0, Math.PI * 2)
    ctx.fillStyle = color + alpha.toString(16).padStart(2, '0')
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 0.8
    ctx.stroke()
  })

  // Limit line (with try-catch for safety)
  if (cfg.showLimit !== false && points.length >= 10) {
    try {
      const vals = points.map((p) => p.value)
      const conv = detectConvergence(vals)
      if (conv && conv.converged && conv.limit !== null && conv.limit !== undefined) {
      const limitY = cy - (conv.limit - oy) * s
      if (limitY >= 0 && limitY <= H) {
        ctx.save()
        ctx.strokeStyle = mode === 'partialSum' ? '#06b6d4' : '#f59e0b'
        ctx.lineWidth = 1.5
        ctx.setLineDash([6, 4])
        ctx.beginPath()
        ctx.moveTo(0, limitY)
        ctx.lineTo(W, limitY)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = mode === 'partialSum' ? '#06b6d4' : '#f59e0b'
        ctx.font = '11px var(--font-mono)'
        ctx.textAlign = 'right'
        const label = mode === 'partialSum' ? `S∞ = ${conv.limit.toFixed(4)}` : `L = ${conv.limit.toFixed(4)}`
        ctx.fillText(label, W - 8, limitY - 6)
        ctx.restore()
      }
    }
    } catch (e) {
      // Silently ignore convergence detection errors
    }
  }
}
