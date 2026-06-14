import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useI18nStore } from '../../stores/i18nStore'
import { motion, AnimatePresence } from 'framer-motion'
import { searchPresets, getAllPresets } from '../../engine/PresetLib'
import { useFunctionStore } from '../../stores/functionStore'

export default function CommandPalette() {
  const { t } = useTranslation()
  const lang = useI18nStore((s) => s.lang)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const addFunction = useFunctionStore((s) => s.addFunction)

  const results = query.length >= 1 ? searchPresets(query) : getAllPresets()

  const handleKey = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      setOpen((prev) => !prev)
      setQuery('')
      setSelectedIdx(0)
    }
    if (e.key === 'Escape' && open) {
      setOpen(false)
      setQuery('')
    }
  }, [open])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const select = (preset) => {
    if (preset.type === 'derivative') {
      preset.functions.forEach((f, i) => {
        setTimeout(() => addFunction(f.expr), i * 100)
      })
    } else if (preset.type === 'parametric') {
      addFunction(preset.xt + ';' + preset.yt)
    } else {
      addFunction(preset.expr)
    }
    setOpen(false)
    setQuery('')
  }

  const handleInputKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIdx]) select(results[selectedIdx])
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        onClick={() => { setOpen(false); setQuery('') }}
        style={{
          position: 'fixed', inset: 0, zIndex: 4000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '18vh',
        }}
      >
        <motion.div className="palette-modal"
          initial={{ scale: 0.96, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '460px', maxWidth: '90vw',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '14px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <span style={{ fontSize: '16px' }}>🔍</span>
            <input autoFocus value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0) }}
              onKeyDown={handleInputKey}
              placeholder={t('palette.placeholder')}
              style={{
                flex: 1, border: 'none', background: 'transparent',
                color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            />
            <span style={{
              fontSize: '10px', padding: '3px 8px',
              background: 'var(--surface)', borderRadius: '5px',
              color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
            }}>Esc</span>
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '6px' }}>
            {results.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                {t('palette.empty')}
              </div>
            ) : (
              results.slice(0, 12).map((r, i) => (
                <div key={`${r.categoryKey}-${r.name}`}
                  onClick={() => select(r)}
                  onMouseEnter={() => setSelectedIdx(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 14px', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '13px',
                    color: 'var(--text-primary)',
                    background: i === selectedIdx ? 'var(--surface-hover)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  <span>{r.categoryIcon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{lang === 'en' ? (r.nameEn || r.name) : r.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {r.display}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '10px', color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px',
                  }}>{lang === 'en' ? (r.categoryEn || r.category) : r.category}</span>
                </div>
              ))
            )}
          </div>

          <div style={{
            padding: '8px 18px', borderTop: '1px solid var(--border-subtle)',
            fontSize: '10px', color: 'var(--text-muted)',
            display: 'flex', gap: '16px',
          }}>
            <span>{t('palette.navigate')}</span>
            <span>{t('palette.select')}</span>
            <span>{t('palette.close')}</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
