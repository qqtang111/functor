import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import MicroButton from '../ui/MicroButton'
import Canvas2D from '../canvas/Canvas2D'
import Canvas3D from '../canvas/Canvas3D'
import CurveAnimation from '../canvas/CurveAnimation'
import PointMotion from '../canvas/PointMotion'
import TangentLine from '../canvas/TangentLine'
import DemoPlayer from '../panels/DemoPlayer'
import { useViewStore } from '../../stores/viewStore'
import { useFunctionStore } from '../../stores/functionStore'

export default function CanvasArea({ onToggleSidebar }) {
  const { t } = useTranslation()
  const [size, setSize] = useState({ w: 600, h: 400 })
  const [toast, setToast] = useState(null)
  const containerRef = useRef(null)

  const mode = useViewStore((s) => s.mode)
  const grid = useViewStore((s) => s.grid)
  const zoom = useViewStore((s) => s.zoom)
  const motionActive = useViewStore((s) => s.motionActive)
  const trackerPos = useViewStore((s) => s.trackerPos)
  const demoActive = useViewStore((s) => s.demoActive)
  const demoProgress = useViewStore((s) => s.demoProgress)
  const setMode = useViewStore((s) => s.setMode)
  const toggleGrid = useViewStore((s) => s.toggleGrid)
  const zoomIn = useViewStore((s) => s.zoomIn)
  const zoomOut = useViewStore((s) => s.zoomOut)
  const screenshotPending = useViewStore((s) => s.screenshotPending)
  const clearScreenshot = useViewStore((s) => s.clearScreenshot)
  const requestScreenshot = useViewStore((s) => s.requestScreenshot)
  const toggleFullscreen = useViewStore((s) => s.toggleFullscreen)
  const functions = useFunctionStore((s) => s.functions)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => { const w = el.clientWidth; const h = el.clientHeight; if (w > 0 && h > 0) setSize({ w, h }) }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Auto-dismiss toast after 2s
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  // Screenshot capture
  useEffect(() => {
    if (!screenshotPending) return
    const doCapture = () => {
      // Try 2D canvas first, then 3D canvas
      let canvas = document.querySelector('.canvas2d-main canvas')
      if (!canvas) canvas = document.querySelector('canvas') // 3D Three.js canvas
      if (canvas) {
        try {
          const link = document.createElement('a')
          link.download = `functor-${Date.now()}.png`
          link.href = canvas.toDataURL('image/png')
          link.click()
          setToast(t('toast.screenshot'))
        } catch {
          setToast(t('toast.screenshotFailed'))
        }
      } else {
        setToast(t('toast.screenshotFailed'))
      }
    }
    // Small delay for 3D canvas to render current frame
    setTimeout(doCapture, 50)
    clearScreenshot()
  }, [screenshotPending, clearScreenshot, t])

  const hasVisible = functions.some((f) => f.visible)
  const range2D = 6 / zoom
  const half = range2D / 2

  return (
    <main style={{
      flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
      background: 'radial-gradient(circle at 50% 40%, var(--accent-glow), transparent 60%)',
      position: 'relative',
    }}>
      <div className="canvas-toolbar" style={{
        display: 'flex', gap: '6px', padding: '8px 14px',
        borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <MicroButton onClick={onToggleSidebar} style={{ display: 'none' }} className="mobile-menu-btn">☰</MicroButton>
        <MicroButton active={mode === '2D'} onClick={() => setMode('2D')}>{t('mode.2d')}</MicroButton>
        <MicroButton active={mode === '3D'} onClick={() => setMode('3D')}>{t('mode.3d')}</MicroButton>

        {/* Desmos-style axis range display */}
        {mode === '2D' && (
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <span>x ∈ [</span>
            <span style={{ color: 'var(--text-secondary)' }}>{(-half).toFixed(1)}</span>
            <span>, </span>
            <span style={{ color: 'var(--text-secondary)' }}>{half.toFixed(1)}</span>
            <span>]</span>
            <span style={{ margin: '0 4px', color: 'var(--border-medium)' }}>|</span>
            <span>{t('toolbar.step')} </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {zoom > 4 ? '0.25' : zoom > 2 ? '0.5' : '1'}
            </span>
          </div>
        )}

        <div style={{ flex: 1 }} />
        <MicroButton active={grid} onClick={toggleGrid}>{t('nav.grid')}</MicroButton>
        <MicroButton onClick={zoomIn} title={t('nav.zoomIn')}>🔍+</MicroButton>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '36px', textAlign: 'center' }}>
          {zoom < 1 ? `${zoom.toFixed(1)}x` : `${Math.round(zoom)}x`}
        </span>
        <MicroButton onClick={zoomOut} title={t('nav.zoomOut')}>🔍-</MicroButton>
        <MicroButton onClick={useViewStore.getState().resetView} title={t('nav.reset')}>↺</MicroButton>
        <MicroButton onClick={requestScreenshot}>{t('nav.screenshot')}</MicroButton>
        <MicroButton onClick={toggleFullscreen}>{t('nav.fullscreen')}</MicroButton>
      </div>

      <div ref={containerRef} className="canvas2d-main"
        style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {mode === '2D' && (
          <>
            <Canvas2D grid={grid} />
            <CurveAnimation width={size.w} height={size.h} />
            <PointMotion width={size.w} height={size.h} />
            <TangentLine width={size.w} height={size.h} />
          </>
        )}
        {mode === '3D' && <Canvas3D />}
        <DemoPlayer />
      </div>

      {/* Toast notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 300,
            background: 'var(--bg-glass)', backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-subtle)', borderRadius: '10px',
            padding: '10px 24px', fontSize: '13px', color: 'var(--text-primary)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap',
          }}
        >{toast}</motion.div>
      )}

      <div style={{
        display: 'flex', padding: '6px 14px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '11px', color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '4px',
      }}>
        <span>x ∈ [{-half.toFixed(1)}, {half.toFixed(1)}]</span>
        {trackerPos && motionActive && mode === '2D' && (
          <span style={{ color: 'var(--accent)' }}>x: {trackerPos.x} y: {trackerPos.y}</span>
        )}
        {demoActive && mode === '2D' && (
          <span style={{ color: '#fbbf24' }}>{(demoProgress * 100).toFixed(0)}%</span>
        )}
        <span style={{ marginLeft: 'auto' }}>{hasVisible ? t('status.funcCount').replace('{count}', functions.length) : t('status.ready')}</span>
      </div>
    </main>
  )
}
