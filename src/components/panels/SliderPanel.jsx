/**
 * SliderPanel — parameter sliders for ALL functions (Phase 8)
 * Shows params grouped per-function, with range editing + playback
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFunctionStore } from '../../stores/functionStore'
import { getParamDisplay } from '../../engine/ParamDetector'
import SliderControl from './SliderControl'

export default function SliderPanel() {
  const { t } = useTranslation()
  const functions = useFunctionStore((s) => s.functions)
  const setParamValue = useFunctionStore((s) => s.setParamValue)
  const setParamRange = useFunctionStore((s) => s.setParamRange)
  const toggleParamLock = useFunctionStore((s) => s.toggleParamLock)
  const resetParam = useFunctionStore((s) => s.resetParam)
  const resetAllParams = useFunctionStore((s) => s.resetAllParams)

  // Find ALL visible functions with parameters (not just the first)
  const fnsWithParams = functions.filter((f) =>
    f.visible && !f.isDerivative && f.mode === 'function' &&
    f.parameters && Object.keys(f.parameters).length > 0
  )

  // ALL hooks must be before any early return
  const [animParam, setAnimParam] = useState(null)
  const [animFnId, setAnimFnId] = useState(null)
  const [animPlaying, setAnimPlaying] = useState(false)
  const [animSpeed, setAnimSpeed] = useState(1)
  const [animLoop, setAnimLoop] = useState('bounce')
  const animRef = useRef(null)
  const tRef = useRef(0)

  const stopAnimation = useCallback(() => {
    setAnimPlaying(false)
    setAnimParam(null)
    setAnimFnId(null)
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
  }, [])

  const activeAnimFn = animFnId ? functions.find((f) => f.id === animFnId) : null

  const startAnimation = useCallback((fnId, paramName) => {
    const fn = functions.find((f) => f.id === fnId)
    if (!fn || !fn.parameters[paramName]) return
    const cfg = fn.parameters[paramName]
    setAnimFnId(fnId)
    setAnimParam(paramName)
    setAnimPlaying(true)
    tRef.current = (cfg.value - cfg.min) / (cfg.max - cfg.min || 1)
  }, [functions])

  useEffect(() => {
    if (!animPlaying || !animParam || !animFnId || !activeAnimFn) return
    const cfg = activeAnimFn.parameters[animParam]
    if (!cfg || cfg.locked) { stopAnimation(); return }

    let lastTime = 0
    const step = 0.005 * animSpeed
    const range = cfg.max - cfg.min

    const loop = (timestamp) => {
      if (!lastTime) lastTime = timestamp
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
      lastTime = timestamp
      tRef.current += step * dt * 60
      let fraction
      if (animLoop === 'bounce') {
        const p = tRef.current % 2
        fraction = p < 1 ? p : 2 - p
      } else {
        fraction = tRef.current % 1
      }
      const newVal = cfg.min + fraction * range
      const rounded = Math.round(newVal / cfg.step) * cfg.step
      setParamValue(animFnId, animParam, parseFloat(rounded.toFixed(4)))
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [animPlaying, animParam, animFnId, activeAnimFn, animSpeed, animLoop, setParamValue, stopAnimation])

  // Early return AFTER all hooks
  if (fnsWithParams.length === 0) return null

  return (
    <div style={{ padding: '8px 14px 10px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-glass)' }}>
      {fnsWithParams.map((fn) => {
        const paramNames = Object.keys(fn.parameters)
        const totalParams = paramNames.length
        const isAnimFn = animPlaying && animFnId === fn.id

        return (
          <div key={fn.id} style={{ marginBottom: fnsWithParams.length > 1 ? '10px' : 0 }}>
            {/* Function label when multiple functions have params */}
            {fnsWithParams.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: fn.color, flexShrink: 0 }} />
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                  {fn.label || fn.expr}
                </span>
              </div>
            )}

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                {fnsWithParams.length === 1 ? (
                  <>{t('slider.title') || 'Parameters'} <span style={{ color: 'var(--accent)' }}>({totalParams})</span></>
                ) : (
                  <>{totalParams} params</>
                )}
              </span>
              <span onClick={() => { if (isAnimFn) stopAnimation(); resetAllParams(fn.id) }}
                title={t('slider.resetAll') || 'Reset all'}
                style={{ fontSize: '10px', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 6px', borderRadius: '3px', background: 'var(--surface-hover)' }}>
                ↺
              </span>
            </div>

            {/* Sliders for this function */}
            <div style={{ maxHeight: totalParams > 5 ? '200px' : 'none', overflowY: totalParams > 5 ? 'auto' : 'visible', paddingRight: totalParams > 5 ? '4px' : 0 }}>
              {paramNames.map((name) => {
                const cfg = fn.parameters[name]
                const isAnimating = isAnimFn && animParam === name
                return (
                  <SliderControl key={`${fn.id}-${name}`}
                    paramName={name} display={getParamDisplay(name)}
                    value={cfg.value} min={cfg.min} max={cfg.max} step={cfg.step}
                    locked={cfg.locked || isAnimating}
                    onChange={(val) => setParamValue(fn.id, name, val)}
                    onRangeChange={(range) => setParamRange(fn.id, name, range)}
                    onLockToggle={() => toggleParamLock(fn.id, name)}
                    onReset={() => resetParam(fn.id, name)}
                  />
                )
              })}
            </div>

            {/* Animation bar for this function */}
            <div style={{ marginTop: '4px', padding: '4px 8px', borderRadius: '6px', background: 'var(--surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {!isAnimFn ? (
                <span onClick={() => startAnimation(fn.id, paramNames[0])}
                  style={{ cursor: 'pointer', fontSize: '11px', color: 'var(--accent)', padding: '2px 8px', borderRadius: '3px', background: 'var(--accent-glow)', fontFamily: 'var(--font-mono)' }}>▶</span>
              ) : (
                <span onClick={stopAnimation}
                  style={{ cursor: 'pointer', fontSize: '11px', color: '#ef4444', padding: '2px 8px', borderRadius: '3px', background: 'rgba(239,68,68,0.1)', fontFamily: 'var(--font-mono)' }}>⏸</span>
              )}
              {isAnimFn && animParam && (
                <>
                  <span style={{ fontSize: '9px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{getParamDisplay(animParam)}</span>
                  <span onClick={() => setAnimSpeed(animSpeed < 4 ? animSpeed * 2 : 0.5)}
                    style={{ fontSize: '9px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', padding: '0 3px' }}>{animSpeed}x</span>
                  <span onClick={() => setAnimLoop(animLoop === 'bounce' ? 'cycle' : 'bounce')}
                    style={{ fontSize: '9px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', padding: '0 3px' }}>{animLoop === 'bounce' ? '↔' : '↻'}</span>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
