import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useThemeStore } from '../../stores/themeStore'

export default function FontSwitcher() {
  const fontSchemes = useThemeStore((s) => s.fontSchemes)
  const current = useThemeStore((s) => s.fontScheme)
  const setFontScheme = useThemeStore((s) => s.setFontScheme)
  const [open, setOpen] = useState(false)

  const handleSelect = (scheme) => {
    setFontScheme(scheme)
    localStorage.setItem('functor-font', scheme.id)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ stiffness: 400, damping: 17 }}
        onClick={() => setOpen(!open)}
        style={{
          padding: '4px 8px', border: '1px solid var(--border-subtle)',
          borderRadius: '6px', background: 'var(--surface)',
          color: 'var(--text-secondary)', cursor: 'pointer',
          fontSize: '12px', fontFamily: 'var(--font-sans)',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}
      >
        Aa <span style={{ fontSize: '10px' }}>▼</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              zIndex: 20, minWidth: '220px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)', borderRadius: '10px',
              padding: '6px', boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {fontSchemes.map((s) => (
              <div key={s.id} onClick={() => handleSelect(s)}
                style={{
                  padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
                  background: current.id === s.id ? 'var(--surface-hover)' : 'transparent',
                  color: current.id === s.id ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '13px', fontFamily: s.heading, transition: 'background 0.15s',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                  {current.id === s.id && '● '} {s.heading} + {s.mono}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
                  {s.heading} · {s.sans} · {s.mono}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
