import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Tooltip — hover-triggered label with optional keyboard shortcut hint
 *
 * Usage:
 *   <Tooltip label="Zoom In" shortcut="Ctrl+=">
 *     <button>🔍+</button>
 *   </Tooltip>
 */
export default function Tooltip({ children, label, shortcut, placement = 'bottom' }) {
  const [show, setShow] = useState(false)

  const posStyle =
    placement === 'bottom'
      ? { top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' }
      : { bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' }

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (label || shortcut) && (
          <motion.div
            initial={{ opacity: 0, y: placement === 'bottom' ? -4 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: placement === 'bottom' ? -4 : 4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute',
              ...posStyle,
              background: 'rgba(10,10,30,0.95)',
              border: '1px solid var(--border-medium)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '10px',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              zIndex: 300,
              fontFamily: 'var(--font-mono)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            {label && <span style={{ color: 'var(--text-secondary)' }}>{label}</span>}
            {shortcut && (
              <span
                style={{
                  color: 'var(--accent)',
                  fontSize: '9px',
                  fontWeight: 600,
                  background: 'var(--accent-glow)',
                  borderRadius: '3px',
                  padding: '1px 4px',
                }}
              >
                {shortcut}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Separator — vertical divider line for toolbar grouping
 */
export function Separator() {
  return (
    <div
      style={{
        width: '1px',
        height: '20px',
        background: 'var(--border-medium)',
        margin: '0 6px',
        flexShrink: 0,
        alignSelf: 'center',
      }}
    />
  )
}

/**
 * ToolbarGroup — wraps a group of toolbar items with an optional label
 */
export function ToolbarGroup({ label, children }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        position: 'relative',
      }}
      title={label}
      role="group"
      aria-label={label}
    >
      {children}
    </div>
  )
}
