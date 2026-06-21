import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useFunctionStore } from '../../stores/functionStore'
import { getParamDisplay } from '../../engine/ParamDetector'

export default function LegendOverlay({ compact = false }) {
  const { t } = useTranslation()
  const functions = useFunctionStore((s) => s.functions)
  const toggleVisible = useFunctionStore((s) => s.toggleVisible)
  const [collapsed, setCollapsed] = useState(false)

  // Show all non-derivative functions (including hidden ones for toggle)
  const allFns = functions.filter((f) => !f.isDerivative)
  if (allFns.length <= 1) return null

  const visibleCount = allFns.filter((f) => f.visible).length

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        position: 'absolute',
        top: compact ? '8px' : '12px',
        right: compact ? '8px' : '12px',
        zIndex: 50,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: collapsed ? '6px 10px' : '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: collapsed ? '0' : '6px',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
        minWidth: compact ? '120px' : '150px',
        maxWidth: compact ? '180px' : '240px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        transition: 'all 0.2s',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          padding: collapsed ? '0' : '0 0 3px',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {t('legend.title') || 'Legend'} ({visibleCount}/{allFns.length})
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          {collapsed ? '▸' : '▾'}
        </span>
      </div>

      {/* Items */}
      <AnimatePresence>
        {!collapsed &&
          allFns.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onClick={() => toggleVisible(f.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                opacity: f.visible ? 1 : 0.4,
                padding: '3px 0',
                minHeight: '28px',
                transition: 'opacity 0.2s',
              }}
            >
              {/* Color dot */}
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: f.color,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${f.color}66`,
                }}
              />

              {/* Label */}
              <span
                style={{
                  color: f.visible ? f.color : 'var(--text-muted)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: compact ? '10px' : '11px',
                }}
                title={f.label || f.expr}
              >
                {f.label || f.expr}
              </span>

              {/* Parameter badges */}
              {f.parameters &&
                Object.keys(f.parameters).length > 0 &&
                Object.entries(f.parameters).slice(0, 2).map(([name, cfg]) => (
                  <span
                    key={name}
                    style={{
                      fontSize: '8px',
                      color: 'var(--text-muted)',
                      background: 'var(--surface-hover)',
                      borderRadius: '3px',
                      padding: '1px 4px',
                      fontFamily: 'var(--font-mono)',
                      flexShrink: 0,
                    }}
                    title={`${getParamDisplay(name)} = ${cfg.value}`}
                  >
                    {getParamDisplay(name)}
                  </span>
                ))}

              {/* Eye toggle */}
              <span
                style={{
                  fontSize: '10px',
                  color: f.visible ? 'var(--accent)' : 'var(--danger)',
                  flexShrink: 0,
                  width: '18px',
                  textAlign: 'center',
                }}
              >
                {f.visible ? '👁' : '—'}
              </span>
            </motion.div>
          ))}
      </AnimatePresence>
    </motion.div>
  )
}
