import ThemeSwitcher from '../ui/ThemeSwitcher'
import FontSwitcher from '../ui/FontSwitcher'
import { useI18nStore } from '../../stores/i18nStore'

export default function TopBar({ onToggleSidebar }) {
  const lang = useI18nStore((s) => s.lang)
  const setLang = useI18nStore((s) => s.setLang)

  const toggleLang = () => setLang(lang === 'zh' ? 'en' : 'zh')

  return (
    <header style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 20px', background: 'var(--bg-glass)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)', zIndex: 101, minHeight: '48px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="mobile-hamburger"
          onClick={onToggleSidebar}
          style={{
            display: 'none', fontSize: '20px', cursor: 'pointer',
            color: 'var(--text-secondary)', padding: '4px',
          }}>☰</span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontFamily: 'var(--font-heading)', fontSize: '16px',
          fontWeight: 500, letterSpacing: '2px', color: 'var(--text-primary)',
        }}>
          <span style={{ fontSize: '20px' }}>📐</span> FUNCTOR
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FontSwitcher />
        <ThemeSwitcher />
        <span onClick={toggleLang}
          style={{
            fontSize: '12px', color: 'var(--accent)', cursor: 'pointer',
            userSelect: 'none', padding: '2px 6px', borderRadius: '4px',
            border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)',
            fontWeight: 600,
          }}>{lang.toUpperCase()}</span>
      </div>
    </header>
  )
}
