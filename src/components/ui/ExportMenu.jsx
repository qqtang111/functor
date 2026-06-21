import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useFunctionStore } from '../../stores/functionStore'
import { useViewStore } from '../../stores/viewStore'
import { encodeShareState, buildLatexBlock } from '../../engine/ShareEncoder'
import MicroButton from './MicroButton'

export default function ExportMenu() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const menuRef = useRef(null)
  const functions = useFunctionStore((s) => s.functions)
  const requestScreenshot = useViewStore((s) => s.requestScreenshot)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const tm = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(tm)
  }, [toast])

  const copyUrl = async () => {
    try {
      const view = useViewStore.getState()
      const hash = encodeShareState(functions, {
        mode: view.mode,
        zoom: view.zoom,
        offsetX: view.offsetX,
        offsetY: view.offsetY,
      })
      const url = window.location.origin + window.location.pathname + hash
      await navigator.clipboard.writeText(url)
      setToast(t('export.urlCopied') || 'Link copied')
    } catch {
      setToast('Failed to copy')
    }
    setOpen(false)
  }

  const copyLatex = async () => {
    try {
      const tex = buildLatexBlock(functions)
      if (!tex) {
        setToast(t('settings.noFunction') || 'No functions to export')
      } else {
        await navigator.clipboard.writeText(tex)
        setToast(t('export.latexCopied') || 'LaTeX copied')
      }
    } catch {
      setToast('Failed to copy')
    }
    setOpen(false)
  }

  const menuItems = [
    {
      key: 'png',
      icon: '📷',
      label: t('export.png') || 'Export PNG',
      action: () => {
        requestScreenshot()
        setOpen(false)
      },
    },
    {
      key: 'url',
      icon: '🔗',
      label: t('export.url') || 'Copy Share Link',
      action: copyUrl,
    },
    {
      key: 'latex',
      icon: '📐',
      label: t('export.latex') || 'Copy LaTeX',
      action: copyLatex,
    },
  ]

  return (
    <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
      <MicroButton onClick={() => setOpen(!open)} active={open}>
        ↗ {t('nav.export') || 'Export'}
      </MicroButton>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              zIndex: 250,
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1px',
              minWidth: '170px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {menuItems.map((item) => (
              <div
                key={item.key}
                onClick={item.action}
                style={{
                  padding: '9px 14px',
                  cursor: 'pointer',
                  borderRadius: '7px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{ fontSize: '14px' }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              fontSize: '10px',
              color: 'var(--accent)',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-mono)',
              pointerEvents: 'none',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
