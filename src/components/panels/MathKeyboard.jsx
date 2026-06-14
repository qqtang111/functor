import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const ROW_KEYS = [
  { i18nKey: 'keyboard.trig', keys: ['sin(', 'cos(', 'tan(', 'csc(', 'sec(', 'cot(', 'arcsin(', 'arccos('] },
  { i18nKey: 'keyboard.logexp', keys: ['log(', 'ln(', 'exp(', 'log2(', 'log10('] },
  { i18nKey: 'keyboard.constants', keys: ['π', 'e', 'θ', 'φ', 'α', 'β', 'γ', '∞'] },
  { i18nKey: 'keyboard.funcs', keys: ['abs(', 'sqrt(', 'floor(', 'ceil(', 'round(', 'sign('] },
  { i18nKey: 'keyboard.operators', keys: ['^', '/', '*', '+', '-', '(', ')', '=', '≤', '≥', '≠'] },
  { i18nKey: 'keyboard.vars', keys: ['x', 'y', 'z', 't', 'a', 'b', 'n', 'm', 'x²', 'x³', 'eˣ', '1/x'] },
]

export default function MathKeyboard({ visible, onInsert, onBackspace, onClear, onConfirm }) {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 200,
            background: 'rgba(10,10,30,0.96)', borderTop: '1px solid var(--border-subtle)',
            backdropFilter: 'blur(20px)', padding: '10px 14px 14px',
            maxHeight: '55vh', overflowY: 'auto',
          }}
        >
          {ROW_KEYS.map((row) => (
            <div key={row.i18nKey} style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                {t(row.i18nKey)}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {row.keys.map((key) => (
                  <motion.button key={key}
                    whileHover={{ scale: 1.06, background: 'var(--surface-hover)' }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ stiffness: 400, damping: 17 }}
                    onClick={() => onInsert(key)}
                    style={{
                      padding: '6px 11px',
                      border: (key === 'x' || key === 'y') ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                      borderRadius: '7px',
                      background: (key === 'x' || key === 'y') ? 'var(--accent-glow)' : 'var(--surface)',
                      color: (key === 'x' || key === 'y') ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: key.length > 2 ? '11px' : '13px',
                      fontFamily: 'var(--font-mono)', outline: 'none',
                    }}
                  >{key}</motion.button>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onBackspace}
              style={{ padding: '7px 16px', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>{t('keyboard.backspace')}</motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onClear}
              style={{ padding: '7px 16px', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>{t('keyboard.clear')}</motion.button>
            <div style={{ flex: 1 }} />
            <motion.button whileTap={{ scale: 0.95 }} onClick={onConfirm}
              style={{ padding: '7px 24px', border: 'none', borderRadius: '8px', background: 'var(--accent)', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{t('keyboard.confirm')}</motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
