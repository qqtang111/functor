import { useState, useRef, useCallback } from 'react'
const STEP_OPTIONS = [0.01, 0.1, 0.5, 1, 5, 10]

export default function SliderControl({ paramName, display, value, min, max, step, locked, onChange, onLockToggle, onReset, onRangeChange }) {
  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState('')
  const [showStepMenu, setShowStepMenu] = useState(false)
  const [showRangeEditor, setShowRangeEditor] = useState(false)
  const [rangeMin, setRangeMin] = useState('')
  const [rangeMax, setRangeMax] = useState('')
  const [rangeStep, setRangeStep] = useState('')

  const getValueFromPosition = useCallback((clientX) => {
    const track = trackRef.current; if (!track) return value
    const rect = track.getBoundingClientRect()
    const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round((min + fraction * (max - min)) / step) * step
  }, [min, max, step, value])
  const onPointerDown = useCallback((e) => {
    if (locked) return; setDragging(true)
    onChange(parseFloat(getValueFromPosition(e.clientX).toFixed(4)))
    e.target.setPointerCapture?.(e.pointerId)
  }, [locked, getValueFromPosition, onChange])
  const onPointerMove = useCallback((e) => { if (!dragging || locked) return; onChange(parseFloat(getValueFromPosition(e.clientX).toFixed(4))) }, [dragging, locked, getValueFromPosition, onChange])
  const onPointerUp = useCallback(() => setDragging(false), [])
  const startEdit = () => { setEditVal(String(value)); setEditing(true) }
  const commitEdit = () => { const p = parseFloat(editVal); if (!isNaN(p)) { const c = Math.max(min, Math.min(max, p)); onChange(parseFloat((Math.round(c / step) * step).toFixed(4))) }; setEditing(false) }
  const selectStep = (s) => { onRangeChange?.({ step: s }); setShowStepMenu(false) }
  const openRangeEditor = () => { setRangeMin(String(min)); setRangeMax(String(max)); setRangeStep(String(step)); setShowRangeEditor(true) }
  const applyRangeEditor = () => { const mn = parseFloat(rangeMin), mx = parseFloat(rangeMax), st = parseFloat(rangeStep); if (!isNaN(mn) && !isNaN(mx) && !isNaN(st) && mn < mx && st > 0) onRangeChange?.({ min: mn, max: mx, step: st }); setShowRangeEditor(false) }

  const fraction = Math.max(0, Math.min(1, (value - min) / (max - min || 1)))
  const isInt = Number.isInteger(step) && Number.isInteger(value)
  const displayValue = isInt ? value : parseFloat(value.toFixed(2))

  return (
    <div style={{ marginBottom: '8px', opacity: locked ? 0.45 : 1, transition: 'opacity 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{display || paramName}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent)' }}>=</span>
        {editing ? (
          <input type="text" value={editVal} onChange={(e) => setEditVal(e.target.value)} onBlur={commitEdit} onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }} autoFocus style={{ width: '60px', padding: '3px 5px', fontSize: '13px', fontFamily: 'var(--font-mono)', border: '1px solid var(--accent)', borderRadius: '3px', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }} />
        ) : (
          <span onClick={locked ? undefined : startEdit} title={locked ? '锁' : '点'} style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: locked ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: locked ? 'default' : 'pointer', padding: '2px 8px', borderRadius: '3px', background: locked ? 'transparent' : 'var(--surface-hover)' }}>{displayValue}</span>
        )}
        {locked && <span style={{ fontSize: '10px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', padding: '0 2px' }}>LOCK</span>}
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <span onClick={() => setShowStepMenu(!showStepMenu)} title="步长" style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: showStepMenu ? 'var(--surface-hover)' : 'transparent' }}>step:{step}</span>
          {showStepMenu && (<div style={{ position: 'absolute', top: '18px', right: 0, zIndex: 50, background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '4px', minWidth: '64px', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>{STEP_OPTIONS.map((s) => (<div key={s} onClick={() => selectStep(s)} style={{ padding: '4px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer', borderRadius: '3px', color: step === s ? 'var(--accent)' : 'var(--text-secondary)', background: step === s ? 'var(--accent-glow)' : 'transparent' }}>{s}</div>))}</div>)}
        </div>
        <span onClick={() => { if (!locked) onReset?.() }} title="重置" style={{ cursor: locked ? 'default' : 'pointer', fontSize: '14px', color: 'var(--text-muted)', opacity: locked ? 0.4 : 0.8, padding: '0 3px' }}>↺</span>
        <span onClick={onLockToggle} title={locked ? '解锁' : '锁定'} style={{ cursor: 'pointer', fontSize: '14px', color: locked ? 'var(--accent)' : 'var(--text-muted)', padding: '0 3px', textShadow: locked ? '0 0 6px var(--accent-glow)' : 'none' }}>{locked ? '🔒' : '🔓'}</span>
        <span onClick={openRangeEditor} title="范围" style={{ cursor: 'pointer', fontSize: '14px', color: showRangeEditor ? 'var(--accent)' : 'var(--text-muted)', padding: '0 3px' }}>⚙</span>
      </div>
      <div ref={trackRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} onTouchStart={(e) => { if (locked) return; setDragging(true); onChange(parseFloat(getValueFromPosition(e.touches[0].clientX).toFixed(4))) }} onTouchMove={(e) => { if (!dragging || locked) return; onChange(parseFloat(getValueFromPosition(e.touches[0].clientX).toFixed(4))) }} onTouchEnd={onPointerUp} style={{ position: 'relative', height: '30px', cursor: locked ? 'not-allowed' : 'ew-resize', touchAction: 'none' }}>
        <div style={{ position: 'absolute', top: '13px', left: 0, right: 0, height: '5px', borderRadius: '3px', background: locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)' }} />
        <div style={{ position: 'absolute', top: '13px', left: 0, width: `${fraction * 100}%`, height: '5px', borderRadius: '3px', background: locked ? 'rgba(255,255,255,0.08)' : 'var(--accent)', boxShadow: dragging ? '0 0 8px var(--accent-glow)' : 'none' }} />
        <div style={{ position: 'absolute', top: '6px', left: `${fraction * 100}%`, transform: 'translateX(-50%)', width: locked ? '14px' : '18px', height: locked ? '14px' : '18px', borderRadius: '50%', background: locked ? 'rgba(255,255,255,0.2)' : '#fff', boxShadow: dragging ? '0 0 14px var(--accent)' : '0 1px 3px rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '0 4px' }}>
        <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={openRangeEditor}>{min}</span>
        <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={openRangeEditor}>{max}</span>
      </div>
      {showRangeEditor && (
        <div style={{ marginTop: '4px', padding: '6px 8px', borderRadius: '5px', background: 'var(--surface)', border: '1px solid var(--accent)', display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Min</span><input value={rangeMin} onChange={(e) => setRangeMin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyRangeEditor()} style={{ width: '48px', padding: '3px 4px', fontSize: '12px', fontFamily: 'var(--font-mono)', border: '1px solid var(--border-subtle)', borderRadius: '3px', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }} />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Max</span><input value={rangeMax} onChange={(e) => setRangeMax(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyRangeEditor()} style={{ width: '48px', padding: '3px 4px', fontSize: '12px', fontFamily: 'var(--font-mono)', border: '1px solid var(--border-subtle)', borderRadius: '3px', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }} />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Step</span><input value={rangeStep} onChange={(e) => setRangeStep(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyRangeEditor()} style={{ width: '44px', padding: '3px 4px', fontSize: '12px', fontFamily: 'var(--font-mono)', border: '1px solid var(--border-subtle)', borderRadius: '3px', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }} />
          <span onClick={applyRangeEditor} style={{ padding: '3px 8px', borderRadius: '3px', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>✓</span>
          <span onClick={() => setShowRangeEditor(false)} style={{ padding: '3px 6px', borderRadius: '3px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>✕</span>
        </div>
      )}
    </div>
  )
}
