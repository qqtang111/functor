import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import SearchBar from '../panels/SearchBar'
import FunctionInput from '../panels/FunctionInput'
import PresetBrowser from '../panels/PresetBrowser'
import SettingsPanel from '../panels/SettingsPanel'
import SliderPanel from '../panels/SliderPanel'
import SequenceControls from '../panels/SequenceControls'

const MIN_WIDTH = 220
const MAX_WIDTH = 500
const DEFAULT_WIDTH = 320

export default function Sidebar({ onClose }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('presets')
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const handleRef = useRef(null)

  const onPointerDown = useCallback((e) => {
    e.preventDefault()
    const handle = handleRef.current
    if (!handle) return
    handle.setPointerCapture(e.pointerId)
    handle.onpointermove = (ev) => {
      setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, ev.clientX)))
    }
    handle.onpointerup = () => {
      handle.onpointermove = null
      handle.onpointerup = null
      handle.releasePointerCapture(e.pointerId)
    }
  }, [])

  const TABS = [
    { key: 'presets', label: t('sidebar.presets') },
    { key: 'settings', label: t('sidebar.settings') },
  ]

  return (
    <aside className="sidebar-inner" style={{
      width: width + 'px', minWidth: MIN_WIDTH + 'px', maxWidth: MAX_WIDTH + 'px',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      position: 'relative',
    }}>
      <div className="sidebar-close" onClick={onClose}
        style={{
          display: 'none', position: 'absolute', top: '12px', right: '28px',
          fontSize: '22px', color: 'var(--text-muted)', cursor: 'pointer',
          zIndex: 10, width: '36px', height: '36px', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px', background: 'var(--surface)',
        }}>✕</div>

      {/* Resize handle — uses pointer capture for reliable dragging */}
      <div ref={handleRef}
        onPointerDown={onPointerDown}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: '8px', cursor: 'col-resize', zIndex: 20,
          touchAction: 'none',
          background: 'transparent',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-glow)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      />

      <SearchBar />
      <FunctionInput />
      <SliderPanel />
      <SequenceControls />

      <div style={{
        display: 'flex',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {TABS.map((t) => (
          <div key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, textAlign: 'center', padding: '10px',
              fontSize: '13px', cursor: 'pointer',
              color: tab === t.key ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              background: tab === t.key ? 'var(--surface-hover)' : 'transparent',
              transition: 'all 0.15s',
            }}
          >{t.label}</div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tab === 'presets' ? <PresetBrowser /> : <SettingsPanel />}
      </div>
    </aside>
  )
}
