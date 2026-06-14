import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SearchBar from '../panels/SearchBar'
import FunctionInput from '../panels/FunctionInput'
import PresetBrowser from '../panels/PresetBrowser'
import SettingsPanel from '../panels/SettingsPanel'

export default function Sidebar({ onClose }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('presets')

  const TABS = [
    { key: 'presets', label: t('sidebar.presets') },
    { key: 'settings', label: t('sidebar.settings') },
  ]

  return (
    <aside className="sidebar-inner" style={{
      width: '320px', minWidth: '320px',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Mobile close button */}
      <div className="sidebar-close" onClick={onClose}
        style={{
          display: 'none', position: 'absolute', top: '12px', right: '12px',
          fontSize: '22px', color: 'var(--text-muted)', cursor: 'pointer',
          zIndex: 10, width: '36px', height: '36px', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px', background: 'var(--surface)',
        }}>✕</div>

      <SearchBar />
      <FunctionInput />

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
