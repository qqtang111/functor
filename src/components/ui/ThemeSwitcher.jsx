import { motion } from 'framer-motion'
import { useThemeStore } from '../../stores/themeStore'

const spring = { stiffness: 400, damping: 17 }

export default function ThemeSwitcher() {
  const themes = useThemeStore((s) => s.themes)
  const current = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  return (
    <motion.div style={{
      display: 'flex', gap: '4px', padding: '4px 10px',
      background: 'var(--surface)', borderRadius: '20px',
      border: '1px solid var(--border-subtle)',
    }}>
      {themes.map((t) => (
        <motion.div key={t.id}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          transition={spring}
          onClick={() => { setTheme(t); localStorage.setItem('functor-theme', t.id) }}
          title={t.label}
          style={{
            width: '14px', height: '14px', borderRadius: '50%',
            background: t.color, cursor: 'pointer',
            boxShadow: current.id === t.id ? `0 0 10px ${t.color}` : 'none',
            opacity: current.id === t.id ? 1 : 0.35,
            transition: 'box-shadow 0.3s, opacity 0.3s',
          }}
        />
      ))}
    </motion.div>
  )
}
