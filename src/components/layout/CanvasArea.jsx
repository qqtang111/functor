import { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import MicroButton from '../ui/MicroButton'
import Tooltip, { Separator, ToolbarGroup } from '../ui/Tooltip'
import ExportMenu from '../ui/ExportMenu'
import Canvas2D from '../canvas/Canvas2D'
import Canvas3D from '../canvas/Canvas3D'
import CurveAnimation from '../canvas/CurveAnimation'
import PointMotion from '../canvas/PointMotion'
import TangentLine from '../canvas/TangentLine'
import DemoPlayer from '../panels/DemoPlayer'
import LegendOverlay from '../ui/LegendOverlay'
import EmptyStateGuide from '../ui/EmptyStateGuide'
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
  const resetView = useViewStore((s) => s.resetView)
  const screenshotPending = useViewStore((s) => s.screenshotPending)
  const clearScreenshot = useViewStore((s) => s.clearScreenshot)
  const toggleFullscreen = useViewStore((s) => s.toggleFullscreen)
  const functions = useFunctionStore((s) => s.functions)

  // Keyboard shortcuts for toolbar
  const handleKeyDown = useCallback((e) => {
    // Don't fire when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
    // Don't fire with Ctrl/Cmd modifiers (except Ctrl+= for zoom)
    if ((e.ctrlKey || e.metaKey) && e.key !== '=' && e.key !== '-') return

    switch (e.key) {
      case 'g':
      case 'G':
        toggleGrid()
        break
      case '=':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          zoomIn()
        }
        break
      case '-':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          zoomOut()
        }
        break
      case '0':
        if (!e.ctrlKey && !e.metaKey) resetView()
        break
      case 'f':
      case 'F':
        if (!e.ctrlKey && !e.metaKey) toggleFullscreen()
        break
      case '2':
        if (!e.ctrlKey && !e.metaKey) setMode('2D')
        break
      case '3':
        if (!e.ctrlKey && !e.metaKey) setMode('3D')
        break
    }
  }, [toggleGrid, zoomIn, zoomOut, resetView, toggleFullscreen, setMode])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

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
    const tm = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(tm)
  }, [toast])

  // Screenshot capture
  useEffect(() => {
    if (!screenshotPending) return
    const doCapture = () => {
      let canvas = document.querySelector('.canvas2d-main canvas')
      if (!canvas) canvas = document.querySelector('canvas')
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
    setTimeout(doCapture, 50)
    clearScreenshot()
  }, [screenshotPending, clearScreenshot, t])

  const hasVisible = functions.some((f) => f.visible)
  const range2D = 6 / zoom
  const half = range2D / 2

  const zoomDisplay = zoom < 1 ? `${zoom.toFixed(1)}×` : `${Math.round(zoom)}×`

  return (
    <main style={{
      flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
      background: 'radial-gradient(circle at 50% 40%, var(--accent-glow), transparent 60%)',
      position: 'relative',
    }}>
      {/* ═══ Toolbar — Grouped ═══ */}
      <div className="canvas-toolbar" style={{
        display: 'flex', gap: '4px', padding: '8px 14px',
        borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Mobile menu button (hidden on desktop) */}
        <MicroButton onClick={onToggleSidebar} style={{ display: 'none' }} className="mobile-menu-btn">☰</MicroButton>

        {/* Group 1: View Controls */}
        <ToolbarGroup label={t('toolbar.viewControls') || 'View Controls'}>
          <Tooltip label={t('nav.grid') || 'Grid'} shortcut="G">
            <MicroButton active={grid} onClick={toggleGrid}>⊞</MicroButton>
          </Tooltip>
          <Tooltip label={t('nav.zoomIn') || 'Zoom In'} shortcut="Ctrl+=">
            <MicroButton onClick={zoomIn}>🔍+</MicroButton>
          </Tooltip>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '36px', textAlign: 'center' }}>
            {zoomDisplay}
          </span>
          <Tooltip label={t('nav.zoomOut') || 'Zoom Out'} shortcut="Ctrl+-">
            <MicroButton onClick={zoomOut}>🔍-</MicroButton>
          </Tooltip>
          <Tooltip label={t('nav.reset') || 'Reset View'} shortcut="0">
            <MicroButton onClick={resetView}>↺</MicroButton>
          </Tooltip>
        </ToolbarGroup>

        <Separator />

        {/* Group 2: Mode Switch — Segmented Control */}
        <ToolbarGroup label={t('toolbar.modeSwitch') || 'Mode'}>
          <div style={{
            display: 'flex', background: 'var(--surface)', borderRadius: '8px',
            border: '1px solid var(--border-subtle)', padding: '2px',
          }}>
            {['2D', '3D'].map((m) => (
              <Tooltip key={m} label={m === '2D' ? (t('mode.2d') || '2D Mode') : (t('mode.3d') || '3D Mode')} shortcut={m === '2D' ? '2' : '3'}>
                <button
                  onClick={() => setMode(m)}
                  style={{
                    padding: '5px 14px', border: 'none', borderRadius: '6px',
                    fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600,
                    cursor: 'pointer', position: 'relative',
                    background: mode === m ? 'var(--accent)' : 'transparent',
                    color: mode === m ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                    outline: 'none',
                  }}
                >{m}</button>
              </Tooltip>
            ))}
          </div>

          {/* Desmos-style axis range */}
          {mode === '2D' && (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginLeft: '6px' }}>
              <span>x ∈ [</span>
              <span style={{ color: 'var(--text-secondary)' }}>{(-half).toFixed(1)}</span>
              <span>, </span>
              <span style={{ color: 'var(--text-secondary)' }}>{half.toFixed(1)}</span>
              <span>]</span>
            </div>
          )}
        </ToolbarGroup>

        <Separator />

        {/* Group 3: Export */}
        <ToolbarGroup label={t('toolbar.exportGroup') || 'Export'}>
          <ExportMenu />
          <Tooltip label={t('nav.fullscreen') || 'Fullscreen'} shortcut="F">
            <MicroButton onClick={toggleFullscreen}>⛶</MicroButton>
          </Tooltip>
        </ToolbarGroup>

        <div style={{ flex: 1 }} />

        {/* Step indicator (right-aligned) */}
        {mode === '2D' && (
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {t('toolbar.step')} {zoom > 4 ? '0.25' : zoom > 2 ? '0.5' : '1'}
          </span>
        )}
      </div>

      {/* ═══ Canvas Area ═══ */}
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
        <LegendOverlay compact={size.w < 600} />
        <EmptyStateGuide />
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

      {/* Status bar */}
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
