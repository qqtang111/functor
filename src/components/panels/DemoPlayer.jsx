import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useViewStore } from '../../stores/viewStore'
import { useFunctionStore } from '../../stores/functionStore'
import MicroButton from '../ui/MicroButton'

export default function DemoPlayer() {
  const { t } = useTranslation()
  const demoActive = useViewStore((s) => s.demoActive)
  const demoFunctionId = useViewStore((s) => s.demoFunctionId)
  const demoProgress = useViewStore((s) => s.demoProgress)
  const demoSpeed = useViewStore((s) => s.demoSpeed)
  const demoPaused = useViewStore((s) => s.demoPaused)
  const setDemoProgress = useViewStore((s) => s.setDemoProgress)
  const setDemoSpeed = useViewStore((s) => s.setDemoSpeed)
  const toggleDemoPause = useViewStore((s) => s.toggleDemoPause)
  const stopDemo = useViewStore((s) => s.stopDemo)
  const functions = useFunctionStore((s) => s.functions)

  const fn = functions.find((f) => f.id === demoFunctionId)
  const animRef = useRef(null)

  useEffect(() => {
    if (!demoActive || demoPaused) return
    let last = performance.now()
    const step = (now) => {
      const dt = (now - last) / 1000
      last = now
      const speed = demoSpeed * 0.15
      const next = demoProgress + speed * dt
      if (next >= 1) { setDemoProgress(1); return }
      setDemoProgress(next)
      animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animRef.current)
  }, [demoActive, demoPaused, demoSpeed, demoProgress])

  if (!demoActive) return null

  return (
    <motion.div className="demo-player"
      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
      style={{
        position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 200, minWidth: '320px',
        background: 'rgba(10,10,30,0.95)', borderRadius: '14px',
        border: '1px solid var(--border-subtle)', padding: '12px 16px',
        backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <span style={{ color: fn?.color || 'var(--accent)', fontWeight: 600 }}>▶ {t('demo.title')}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', flex: 1 }}>{fn?.expr || ''}</span>
        <span onClick={stopDemo} style={{ fontSize: '16px', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px 6px' }}>✕</span>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <input type="range" min="0" max="1" step="0.001" value={demoProgress}
          onChange={(e) => setDemoProgress(parseFloat(e.target.value))}
          style={{ width: '100%', height: '6px', accentColor: 'var(--accent)', borderRadius: '3px', cursor: 'pointer' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
          <span>{(demoProgress * 100).toFixed(1)}%</span>
          <span>{t('status.range').replace('{min}', '-6').replace('{max}', '6')}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <MicroButton onClick={toggleDemoPause}>{demoPaused ? `▶ ${t('demo.play')}` : `⏸ ${t('demo.pause')}`}</MicroButton>
        <MicroButton onClick={() => setDemoProgress(0)}>⏮ {t('demo.start')}</MicroButton>
        <MicroButton onClick={() => setDemoProgress(1)}>⏭ {t('demo.end')}</MicroButton>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t('demo.speed')}</span>
        {[0.5, 1, 2, 3].map((s) => (
          <MicroButton key={s} active={demoSpeed === s} onClick={() => setDemoSpeed(s)}>{s}x</MicroButton>
        ))}
      </div>
    </motion.div>
  )
}
