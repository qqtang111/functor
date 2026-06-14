import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useI18nStore } from '../../stores/i18nStore'
import { searchPresets } from '../../engine/PresetLib'
import { useFunctionStore } from '../../stores/functionStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function SearchBar() {
  const { t } = useTranslation()
  const lang = useI18nStore((s) => s.lang)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const addFunction = useFunctionStore((s) => s.addFunction)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (query.length >= 1) {
      const res = searchPresets(query)
      setResults(res)
      setOpen(res.length > 0)
    } else {
      setResults([])
      setOpen(false)
    }
  }, [query])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const select = (preset) => {
    if (preset.type === 'derivative') {
      preset.functions.forEach((f, i) => {
        setTimeout(() => addFunction(f.expr), i * 100)
      })
    } else {
      addFunction(preset.expr)
    }
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', padding: '0 14px 8px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 12px', background: 'var(--surface)',
        border: '1px solid var(--border-subtle)', borderRadius: '8px',
      }}>
        <span style={{ fontSize: '13px' }}>🔍</span>
        <input value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.length >= 1) { const res = searchPresets(query); setResults(res); setOpen(res.length > 0) } }}
          placeholder={t('search.placeholder')}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            color: 'var(--text-primary)', fontSize: '12px', outline: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        />
        <span style={{
          fontSize: '13px', padding: '2px 4px',
          color: 'var(--text-muted)', lineHeight: 1,
        }}>🔍</span>
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: '100%', left: '14px', right: '14px', zIndex: 100,
              background: 'rgba(10,10,30,0.98)', border: '1px solid var(--border-subtle)',
              borderRadius: '8px', backdropFilter: 'blur(16px)',
              maxHeight: '240px', overflowY: 'auto', marginTop: '4px',
            }}
          >
            {results.slice(0, 8).map((r, i) => (
              <div key={`${r.name}-${i}`}
                onClick={() => select(r)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', cursor: 'pointer', fontSize: '12px',
                  color: 'var(--text-secondary)',
                  borderBottom: i < results.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '12px' }}>{r.categoryIcon}</span>
                <span style={{ flex: 1 }}>{lang === 'en' ? (r.nameEn || r.name) : r.name}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{r.display}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
