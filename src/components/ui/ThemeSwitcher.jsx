import { useState } from 'react'
import { useThemeStore } from '../../stores/themeStore'

export default function ThemeSwitcher() {
  const themes = useThemeStore((s) => s.themes)
  const current = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const [open, setOpen] = useState(false)

  if (!themes || themes.length === 0) return null

  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
          padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)',
          background: 'var(--surface)', userSelect: 'none',
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)',
        }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: current?.color || '#888', display: 'inline-block' }} />
        {current?.label || 'Style'}
      </div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '110%', right: 0, zIndex: 10,
            background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)',
            borderRadius: '10px', padding: '6px', minWidth: '160px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {themes.map((t) => (
              <div key={t.id} onClick={() => { setTheme(t); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px',
                  borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                  color: current.id === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                  background: current.id === t.id ? 'var(--surface-hover)' : 'transparent',
                  fontWeight: current.id === t.id ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (current.id !== t.id) e.target.style.background = 'var(--surface)' }}
                onMouseLeave={(e) => { if (current.id !== t.id) e.target.style.background = 'transparent' }}
              >
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: t.color, display: 'inline-block' }} />
                <span style={{ flex: 1 }}>{t.label}</span>
                {current.id === t.id && <span style={{ fontSize: '10px' }}>✓</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
