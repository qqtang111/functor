import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useI18nStore } from '../../stores/i18nStore'
import { motion, AnimatePresence } from 'framer-motion'
import { PRESET_CATEGORIES } from '../../engine/PresetLib'
import { useFunctionStore } from '../../stores/functionStore'
import { useViewStore } from '../../stores/viewStore'

const CAT_KEY_MAP = {
  elementary: 'presets.elementary',
  trigonometry: 'presets.trigonometry',
  derivative: 'presets.derivative',
  parametric: 'presets.parametric',
  advanced: 'presets.advanced',
  sequences: 'presets.sequences',
}

export default function PresetBrowser() {
  const { t } = useTranslation()
  const lang = useI18nStore((s) => s.lang)
  const [expanded, setExpanded] = useState({})
  const getName = (p) => lang === 'en' ? (p.nameEn || p.name) : p.name
  const addFunction = useFunctionStore((s) => s.addFunction)
  const setMode = useViewStore((s) => s.setMode)

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleLoadPreset = (preset) => {
    if (preset.type === 'derivative') {
      preset.functions.forEach((f, i) => {
        setTimeout(() => addFunction(f.expr), i * 100)
      })
    } else if (preset.type === 'parametric') {
      addFunction(preset.xt + ';' + preset.yt)
    } else if (preset.mode === 'sequence' || preset.mode === 'partialSum') {
      // Phase 8: Sequence / partial sum presets
      addFunction(preset.expr, { mode: preset.mode, params: preset.params })
      setMode('2D')
    } else {
      addFunction(preset.expr, { params: preset.params })
      if (preset.dim === '3D') setMode('3D')
    }
  }

  return (
    <div style={{ padding: '10px 14px', overflowY: 'auto', flex: 1 }}>
      {PRESET_CATEGORIES.map((cat) => {
        const open = expanded[cat.key] ?? (cat.key === 'elementary')
        return (
          <div key={cat.key} style={{ marginBottom: '4px' }}>
            <div
              onClick={() => toggle(cat.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 6px', borderRadius: '6px',
                cursor: 'pointer', fontSize: '13px',
                color: 'var(--text-secondary)',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <motion.span
                animate={{ rotate: open ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'inline-block' }}
              >▶</motion.span>
              <span style={{ fontSize: '14px' }}>{cat.icon}</span>
              <span style={{ flex: 1 }}>{t(CAT_KEY_MAP[cat.key])}</span>
              <span style={{
                fontSize: '10px', color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px',
              }}>{cat.presets.length}</span>
            </div>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ paddingLeft: '18px', paddingBottom: '4px' }}>
                    {cat.presets.map((p) => (
                      <motion.div key={p.name}
                        whileHover={{ background: 'var(--surface-hover)', x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLoadPreset(p)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '6px 8px', borderRadius: '5px',
                          cursor: 'pointer', fontSize: '12px',
                          color: p.dim === '3D' ? '#fbbf24' : 'var(--text-secondary)',
                        }}
                      >
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: p.dim === '3D' ? '#fbbf24' : p.type === 'derivative' ? '#22c55e' : 'var(--accent)',
                          opacity: 0.6, flexShrink: 0,
                        }} />
                        <span style={{ flex: 1, fontSize: '11px' }}>{getName(p)}</span>
                        {p.dim === '3D' && (
                          <span style={{ fontSize: '9px', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>3D</span>
                        )}
                        {p.type === 'derivative' && (
                          <span style={{ fontSize: '9px', color: '#22c55e', fontFamily: 'var(--font-mono)' }}>f+f'</span>
                        )}
                        {p.mode === 'sequence' && (
                          <span style={{ fontSize: '9px', color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>aₙ</span>
                        )}
                        {p.mode === 'partialSum' && (
                          <span style={{ fontSize: '9px', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>Sₙ</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
