/**
 * SequenceControls — sequence/partial sum mode controls (Phase 8)
 * Mode toggle, display mode, N slider, playback, convergence info
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFunctionStore } from '../../stores/functionStore'
import { evaluateSequence, evaluatePartialSum, detectConvergence, getKnownLimit } from '../../engine/SequenceEngine'

const PLAY_SPEEDS = [5, 10, 20, 50]

export default function SequenceControls() {
  const { t } = useTranslation()
  const functions = useFunctionStore((s) => s.functions)
  const setFunctionMode = useFunctionStore((s) => s.setFunctionMode)
  const setSequenceConfig = useFunctionStore((s) => s.setSequenceConfig)

  // ALL hooks must be called unconditionally (React Rules of Hooks)
  const seqFn = useMemo(() =>
    functions.find((f) => f.visible && (f.mode === 'sequence' || f.mode === 'partialSum')) || null,
    [functions])

  const id = seqFn?.id
  const mode = seqFn?.mode || 'sequence'
  const expr = seqFn?.expr || ''
  const params = seqFn?.parameters || {}
  const cfg = seqFn?.sequenceConfig || { N: 50, displayMode: 'points' }
  const N = cfg.N || 50
  const displayMode = cfg.displayMode || 'points'

  const paramValues = useMemo(() => {
    const obj = {}
    if (params) for (const [k, v] of Object.entries(params)) obj[k] = v.value
    return obj
  }, [params])

  const [convInfo, setConvInfo] = useState(null)
  const [knownLimit, setKnownLimit] = useState(null)

  useEffect(() => {
    if (!seqFn) return
    const data = mode === 'sequence'
      ? evaluateSequence(expr, N, paramValues)
      : evaluatePartialSum(expr, N, paramValues)
    const nums = data.filter((d) => d.value !== null).map((d) => mode === 'partialSum' ? d.partialSum : d.value)
    if (nums.length >= 10) setConvInfo(detectConvergence(nums))
    else setConvInfo(null)
    setKnownLimit(getKnownLimit(expr, paramValues))
  }, [seqFn, mode, expr, N, paramValues])

  // Playback
  const [playN, setPlayN] = useState(N)
  const [playing, setPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(10)
  const animRef = useRef(null)
  const lastTimeRef = useRef(0)

  const startPlayback = useCallback(() => {
    setPlayN(1)
    setPlaying(true)
  }, [])

  const stopPlayback = useCallback(() => {
    setPlaying(false)
    setPlayN(N)
    if (id) setSequenceConfig(id, { animating: false })
  }, [N, id, setSequenceConfig])

  useEffect(() => {
    if (!playing || !id) return
    setSequenceConfig(id, { animating: true })
    lastTimeRef.current = 0

    let raf
    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const dt = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      setPlayN((prev) => {
        const inc = (playSpeed * dt) / 1000
        const next = prev + inc
        if (next >= N) {
          setPlaying(false)
          lastTimeRef.current = 0
          setSequenceConfig(id, { animating: false })
          return N
        }
        return Math.min(N, next)
      })
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(raf); lastTimeRef.current = 0 }
  }, [playing, N, playSpeed, id, setSequenceConfig])

  useEffect(() => {
    if (playing && id) setSequenceConfig(id, { playN: Math.floor(playN) })
  }, [playN, id]) // eslint-disable-line react-hooks/exhaustive-deps

  // EARLY RETURN AFTER ALL HOOKS
  if (!seqFn) return null

  const disp = [
    { key: 'points', label: t('seq.displayPoints') || 'Points' },
    { key: 'points+lines', label: t('seq.displayLines') || 'Lines' },
    { key: 'staircase', label: t('seq.displayStaircase') || 'Stair' },
  ]

  const convText = () => {
    if (!convInfo) return t('seq.computing') || 'Computing...'
    switch (convInfo.trend) {
      case 'converged': return convInfo.limit !== null ? `${t('seq.converges') || 'Converges'} → ${convInfo.limit.toFixed(4)}` : t('seq.converges') || 'Converges'
      case 'oscillating': return t('seq.oscillating') || 'Oscillating'
      case 'growing': case 'diverging': return t('seq.diverges') || 'Diverges'
      default: return t('seq.computing') || 'Computing...'
    }
  }

  const convColor = convInfo?.trend === 'converged' ? '#22c55e'
    : convInfo?.trend === 'diverging' || convInfo?.trend === 'growing' ? '#ef4444'
    : '#fbbf24'

  return (
    <div style={{ padding: '8px 14px 10px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-glass)' }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>
        {t('seq.title') || 'Sequence'}
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {['sequence', 'partialSum'].map((m) => (
          <div key={m} onClick={() => { stopPlayback(); setFunctionMode(id, m) }}
            style={{ flex: 1, textAlign: 'center', padding: '6px 4px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-mono)', background: mode === m ? 'var(--accent)' : 'var(--surface-hover)', color: mode === m ? '#fff' : 'var(--text-secondary)', border: mode === m ? 'none' : '1px solid var(--border-subtle)' }}>
            {m === 'sequence' ? 'aₙ' : 'Sₙ'}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {disp.map((item) => (
          <div key={item.key} onClick={() => setSequenceConfig(id, { displayMode: item.key })}
            style={{ flex: 1, textAlign: 'center', padding: '4px 2px', fontSize: '10px', borderRadius: '4px', cursor: 'pointer', background: displayMode === item.key ? 'var(--accent-glow)' : 'var(--surface)', color: displayMode === item.key ? 'var(--accent)' : 'var(--text-muted)', border: displayMode === item.key ? '1px solid var(--accent)' : '1px solid var(--border-subtle)' }}>
            {item.label}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>
          <span>{t('seq.terms') || 'Terms'} N: {playing ? Math.floor(playN) : N}</span>
        </div>
        <input type="range" min={5} max={1000} step={5} value={N} disabled={playing}
          onChange={(e) => setSequenceConfig(id, { N: Math.max(5, Math.min(1000, parseInt(e.target.value))) })}
          style={{ width: '100%', height: '4px', accentColor: 'var(--accent)', cursor: playing ? 'default' : 'pointer', opacity: playing ? 0.5 : 1 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>5</span><span>1000</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        {!playing ? (
          <div onClick={startPlayback} style={{ padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', background: 'var(--accent)', color: '#fff', fontFamily: 'var(--font-mono)' }}>▶ Play</div>
        ) : (
          <div onClick={stopPlayback} style={{ padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', background: '#ef4444', color: '#fff', fontFamily: 'var(--font-mono)' }}>⏸ Stop</div>
        )}
        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Speed:</span>
        {PLAY_SPEEDS.map((s) => (
          <span key={s} onClick={() => setPlaySpeed(s)} style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', padding: '1px 4px', borderRadius: '3px', cursor: 'pointer', color: playSpeed === s ? 'var(--accent)' : 'var(--text-muted)', background: playSpeed === s ? 'var(--accent-glow)' : 'transparent' }}>{s}/s</span>
        ))}
      </div>

      <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--surface)', border: '1px solid var(--border-subtle)', fontSize: '11px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{t('seq.status') || 'Status'}:</span>
          <span style={{ color: convColor, fontWeight: 600 }}>{convText()}</span>
        </div>
        {convInfo && convInfo.limit !== null && (
          <div style={{ color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>L ≈ {convInfo.limit.toFixed(6)}</div>
        )}
        {convInfo && convInfo.converged && convInfo.limit !== null && cfg.showConvergenceBand !== false && (
          <div style={{ color: 'var(--text-muted)', marginTop: '1px', fontFamily: 'var(--font-mono)', fontSize: '9px' }}>ε = {convInfo.stddev.toExponential(1)}</div>
        )}
        {knownLimit && (
          <div style={{ color: '#fbbf24', marginTop: '2px', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{t('seq.exactValue') || 'Exact'}: {knownLimit.formula}</div>
        )}
      </div>
    </div>
  )
}
