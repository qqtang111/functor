import { useRef, useEffect, useCallback, useState } from 'react'
import { useFunctionStore } from '../../stores/functionStore'
import { useViewStore } from '../../stores/viewStore'
import { sample2D } from '../../engine/MathEngine'
import { evaluateSequence, evaluatePartialSum, detectConvergence } from '../../engine/SequenceEngine'
import { create, all } from 'mathjs'

const math = create(all, {})

export default function Canvas2D({ grid = true, axes = true }) {
  const canvasRef = useRef(null); const dragging = useRef(false); const lastPos = useRef({ x: 0, y: 0 }); const lastPinch = useRef(null)
  const functions = useFunctionStore((s) => s.functions); const visible = functions.filter((f) => f.visible)
  const demoActive = useViewStore((s) => s.demoActive); const demoFunctionId = useViewStore((s) => s.demoFunctionId); const demoProgress = useViewStore((s) => s.demoProgress)
  const zoom = useViewStore((s) => s.zoom); const offsetX = useViewStore((s) => s.offsetX); const offsetY = useViewStore((s) => s.offsetY)
  const setZoom = useViewStore((s) => s.setZoom); const setOffset = useViewStore((s) => s.setOffset)
  const [tooltip, setTooltip] = useState(null)

  // Pan
  const onPD = useCallback((e) => { dragging.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; canvasRef.current?.setPointerCapture(e.pointerId) }, [])
  const onPM = useCallback((e) => { if (!dragging.current) return; const dx = e.clientX - lastPos.current.x, dy = e.clientY - lastPos.current.y; lastPos.current = { x: e.clientX, y: e.clientY }; const st = useViewStore.getState(); setOffset(st.offsetX - dx * 0.005 / st.zoom, st.offsetY + dy * 0.005 / st.zoom) }, [setOffset])
  const onPU = useCallback(() => { dragging.current = false }, [])

  // Find nearest curve point
  const findNearest = useCallback((mx, my) => {
    const c = canvasRef.current; if (!c) return null; const r = c.getBoundingClientRect()
    const W = r.width; const H = r.height; const R = 6 / zoom; const cx = W / 2; const cy = H / 2; const s = Math.min(cx, cy) / R
    const wx = offsetX + (mx - cx) / s; const wy = offsetY - (my - cy) / s
    let best = null, bestD = 30 / s
    for (const f of visible) {
      if (f.mode === 'sequence' || f.mode === 'partialSum' || f.expr.includes(';')) continue
      const ps = {}; if (f.parameters) for (const [k, v] of Object.entries(f.parameters)) ps[k] = v.value
      const pts = sample2D(f.expr, [wx - 5, wx + 5], 200, ps).filter(Boolean)
      for (const p of pts) { const d = Math.hypot(p.x - wx, p.y - wy); if (d < bestD) { bestD = d; best = { x: p.x, y: p.y, color: f.color, label: f.label || f.expr } } }
    }
    return best
  }, [visible, zoom, offsetX, offsetY])

  // Desktop hover
  const onHover = useCallback((e) => {
    if (dragging.current) { setTooltip(null); return }
    const c = canvasRef.current; if (!c) return; const r = c.getBoundingClientRect()
    const mx = e.clientX - r.left; const my = e.clientY - r.top
    const pt = findNearest(mx, my)
    setTooltip(pt ? { ...pt, sx: e.clientX, sy: e.clientY } : null)
  }, [findNearest])

  // Mobile tap
  const onTap = useCallback((e) => {
    const c = canvasRef.current; if (!c) return; const r = c.getBoundingClientRect()
    const mx = e.clientX - r.left; const my = e.clientY - r.top
    const pt = findNearest(mx, my)
    setTooltip(pt ? { ...pt, sx: e.clientX, sy: e.clientY } : null)
    if (pt) setTimeout(() => setTooltip(null), 2500)
  }, [findNearest])

  // Wheel zoom
  const onWheel = useCallback((e) => {
    e.preventDefault(); const c = canvasRef.current; if (!c) return; const r = c.getBoundingClientRect()
    const mx = e.clientX - r.left; const my = e.clientY - r.top; const W = r.width; const H = r.height; const R = 6 / zoom
    const cx = W / 2; const cy = H / 2; const s = Math.min(cx, cy) / R
    const wx = ((mx - cx) / s) + offsetX; const wy = (-(my - cy) / s) + offsetY
    const nz = zoom * (e.deltaY > 0 ? 0.85 : 1.15); const ns = Math.min(cx, cy) / (6 / nz)
    setZoom(nz); setOffset(wx - (mx - cx) / ns, wy + (my - cy) / ns)
  }, [zoom, offsetX, offsetY, setZoom, setOffset])

  // Touch pinch
  useEffect(() => { const c = canvasRef.current; if (!c) return; const ot = (e) => { if (e.touches.length === 2) { e.preventDefault(); const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY); if (lastPinch.current) setZoom(zoom * (d / lastPinch.current)); lastPinch.current = d } else lastPinch.current = null }; c.addEventListener('touchstart', ot, { passive: false }); c.addEventListener('touchmove', ot, { passive: false }); c.addEventListener('touchend', () => { lastPinch.current = null }); return () => { c.removeEventListener('touchstart', ot); c.removeEventListener('touchmove', ot) } }, [zoom, setZoom])

  // Render
  useEffect(() => {
    const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); const dpr = window.devicePixelRatio || 2
    const r = c.getBoundingClientRect(); c.width = r.width * dpr; c.height = r.height * dpr; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr)
    const W = r.width; const H = r.height; const R = 6 / zoom; const cx = W / 2; const cy = H / 2
    const s = Math.min(cx, cy) / R; const ox = offsetX; const oy = offsetY; ctx.clearRect(0, 0, W, H)
    const rawStep = zoom > 20 ? 0.1 : zoom > 10 ? 0.2 : zoom > 5 ? 0.25 : zoom > 2 ? 0.5 : zoom > 1 ? 1 : zoom > 0.5 ? 2 : zoom > 0.2 ? 5 : 10
    if (grid) { const fs = rawStep / 5; ctx.strokeStyle = 'rgba(255,255,255,0.015)'; ctx.lineWidth = 0.3; for (let g = Math.floor((ox - R) / fs) * fs; g <= ox + R; g += fs) { const px = cx + (g - ox) * s; if (px >= 0 && px <= W) { ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke() } }; for (let g = Math.floor((oy - R) / fs) * fs; g <= oy + R; g += fs) { const py = cy - (g - oy) * s; if (py >= 0 && py <= H) { ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke() } }; ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5; for (let g = Math.floor((ox - R) / rawStep) * rawStep; g <= ox + R; g += rawStep) { const px = cx + (g - ox) * s; if (px >= 0 && px <= W) { ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke() } }; for (let g = Math.floor((oy - R) / rawStep) * rawStep; g <= oy + R; g += rawStep) { const py = cy - (g - oy) * s; if (py >= 0 && py <= H) { ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke() } } }
    const axisX = cx - ox * s; const axisY = cy + oy * s
    if (axes) { ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; if (axisY >= 0 && axisY <= H) { ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(W, axisY); ctx.stroke() }; if (axisX >= 0 && axisX <= W) { ctx.beginPath(); ctx.moveTo(axisX, 0); ctx.lineTo(axisX, H); ctx.stroke() } }
    if (axes) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'; for (let t = Math.floor((ox - R) / rawStep) * rawStep; t <= ox + R; t += rawStep) { if (Math.abs(t) < rawStep / 2) continue; const px = cx + (t - ox) * s; if (px >= 0 && px <= W) ctx.fillText(Number.isInteger(t) ? t : t.toFixed(rawStep < 1 ? 1 : 0), px, axisY + 14) }; for (let t = Math.floor((oy - R) / rawStep) * rawStep; t <= oy + R; t += rawStep) { if (Math.abs(t) < rawStep / 2) continue; const py = cy - (t - oy) * s; if (py >= 0 && py <= H) ctx.fillText(Number.isInteger(t) ? t : t.toFixed(rawStep < 1 ? 1 : 0), axisX - 18, py + 4) } }
    visible.forEach((f) => { const ps = {}; if (f.parameters) for (const [k, v] of Object.entries(f.parameters)) ps[k] = v.value; if ((f.mode === 'sequence' || f.mode === 'partialSum') && !f.isDerivative) { drawSequence(ctx, f, cx, cy, s, s, ox, oy, W, H, ps); return }; ctx.strokeStyle = f.color; ctx.lineWidth = f.isDerivative ? 1.8 : 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); let started = false; if (f.expr.includes(';')) { try { const [a, b] = f.expr.split(';').map(x => x.trim()); const ac = math.compile(a), bc = math.compile(b); for (let i = 0; i <= 600; i++) { const t = (i / 600) * Math.PI * 2; const x = ac.evaluate({ t, ...ps }); const y = bc.evaluate({ t, ...ps }); if (!isFinite(x) || !isFinite(y)) { started = false; continue }; const dx = cx + (x - ox) * s, dy = cy - (y - oy) * s; if (!started) { ctx.moveTo(dx, dy); started = true } else ctx.lineTo(dx, dy) } } catch {} } else { sample2D(f.expr, [ox - R, ox + R], 500, ps).forEach((p) => { if (p === null) { started = false; return }; const dx = cx + (p.x - ox) * s, dy = cy - (p.y - oy) * s; if (!started) { ctx.moveTo(dx, dy); started = true } else ctx.lineTo(dx, dy) }) }; ctx.stroke(); if (demoActive && f.id === demoFunctionId && !f.expr.includes(';')) { const pts = sample2D(f.expr, [ox - R, ox + R], 600, ps).filter(Boolean); if (pts.length > 1) { const idx = Math.floor(demoProgress * (pts.length - 1)), p = pts[Math.min(idx, pts.length - 1)]; if (p) { const px = cx + (p.x - ox) * s, py = cy - (p.y - oy) * s; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fillStyle = f.color + '55'; ctx.fill(); ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fillStyle = f.color; ctx.fill(); ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill() } } } })
  }, [functions, visible.length, grid, axes, zoom, offsetX, offsetY, demoActive, demoFunctionId, demoProgress])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerLeave={onPU} onWheel={onWheel} onMouseMove={onHover} onMouseLeave={() => setTooltip(null)} onClick={onTap} style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none', cursor: 'crosshair' }} />
      {tooltip && (
        <div style={{ position: 'fixed', left: tooltip.sx + 16, top: tooltip.sy - 10, background: 'rgba(10,10,30,0.92)', border: '1px solid ' + tooltip.color, borderRadius: '6px', padding: '4px 8px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', pointerEvents: 'none', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.4)', whiteSpace: 'nowrap' }}>
          <span style={{ color: tooltip.color, fontWeight: 600 }}>{tooltip.label}</span>
          <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>→</span>
          <span>({tooltip.x.toFixed(2)}, {tooltip.y.toFixed(2)})</span>
        </div>
      )}
    </div>
  )
}

function drawSequence(ctx, f, cx, cy, s, _u, ox, oy, W, H, ps) {
  const { expr, mode, color, sequenceConfig: cfg } = f; const N = cfg.animating && cfg.playN ? Math.floor(cfg.playN) : (cfg.N || 50); const dm = cfg.displayMode || 'points'
  const data = mode === 'sequence' ? evaluateSequence(expr, N, ps) : evaluatePartialSum(expr, N, ps)
  const pts = data.filter(d => { const v = mode === 'partialSum' ? d.partialSum : d.value; return v != null && isFinite(v) }).map(d => ({ n: d.n, value: mode === 'partialSum' ? d.partialSum : d.value })); if (!pts.length) return
  const sp = pts.map(p => ({ px: cx + (p.n - ox) * s, py: cy - (p.value - oy) * s })).filter(p => p.px >= -50 && p.px <= W + 50 && p.py >= -50 && p.py <= H + 50)
  if (dm === 'points+lines' || dm === 'staircase') { ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.beginPath(); if (dm === 'staircase') { for (let i = 0; i < sp.length - 1; i++) { ctx.moveTo(sp[i].px, sp[i].py); ctx.lineTo(sp[i + 1].px, sp[i].py); ctx.lineTo(sp[i + 1].px, sp[i + 1].py) } } else { sp.forEach((p, i) => i === 0 ? ctx.moveTo(p.px, p.py) : ctx.lineTo(p.px, p.py)) }; ctx.stroke(); ctx.restore() }
  sp.forEach((p, i) => { const a = Math.round(128 + 127 * (i / Math.max(1, sp.length - 1))); ctx.beginPath(); ctx.arc(p.px, p.py, 4, 0, Math.PI * 2); ctx.fillStyle = color + a.toString(16).padStart(2, '0'); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 0.8; ctx.stroke() })
  if (cfg.showLimit !== false && pts.length >= 10) { try { const vals = pts.map(p => p.value); const conv = detectConvergence(vals); if (conv && conv.converged && conv.limit != null) { const ly = cy - (conv.limit - oy) * s; if (ly >= 0 && ly <= H) { ctx.save(); ctx.strokeStyle = mode === 'partialSum' ? '#06b6d4' : '#f59e0b'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = mode === 'partialSum' ? '#06b6d4' : '#f59e0b'; ctx.font = '11px var(--font-mono)'; ctx.textAlign = 'right'; ctx.fillText((mode === 'partialSum' ? 'S∞ = ' : 'L = ') + conv.limit.toFixed(4), W - 8, ly - 6); ctx.restore() } } } catch {} }
}
