/**
 * MathKeyboard — Desmos-like keyboard with full alphabet, digits, operators
 * Phase 8: 26 letters for flexible parameter naming + manual param registration
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const ROWS = [
  // Numbers + common constants
  { keys: ['1','2','3','4','5','6','7','8','9','0','.','π','e'] },
  // Alphabet row 1: a-i
  { keys: ['a','b','c','d','e','f','g','h','i'] },
  // Alphabet row 2: j-r
  { keys: ['j','k','l','m','n','o','p','q','r'] },
  // Alphabet row 3: s-z + θ
  { keys: ['s','t','u','v','w','x','y','z','θ'] },
  // Operators — Desmos-style
  { keys: ['+','−','×','÷','=','(',')','²','ˣ','√(','|x|',',','^'] },
  // Functions
  { keys: ['sin(','cos(','tan(','log(','ln(','exp(','abs(','sum(','1/'] },
]

export default function MathKeyboard({ visible, onInsert, onBackspace, onClear, onConfirm, onAddParam, editing }) {
  const { t } = useTranslation()

  const isDigit = (k) => /^[0-9.]$/.test(k)
  const isLetter = (k) => /^[a-z]$/.test(k)
  const isPrimaryVar = (k) => k === 'x' || k === 'y'
  const isParamHint = (k) => isLetter(k) && !isPrimaryVar(k)
  const isOperator = (k) => '×÷−+²ˣ√(=)^,%'.includes(k) || k.startsWith('|') || k.startsWith('√') || k.length > 2
  const isConst = (k) => k === 'π' || k === 'e' || k === 'θ'

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
            background: 'rgba(10,10,30,0.97)', borderTop: '1px solid var(--border-subtle)',
            backdropFilter: 'blur(20px)', padding: '6px 8px 8px',
            maxHeight: '65vh', overflowY: 'auto',
            userSelect: 'none',
          }}
        >
          {ROWS.map((row, ri) => (
            <div key={ri} style={{ marginBottom: '4px', display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {row.keys.map((key) => {
                const bg = isPrimaryVar(key) ? 'var(--accent-glow)'
                  : isDigit(key) ? 'rgba(255,255,255,0.08)'
                  : isConst(key) ? 'rgba(251,191,36,0.08)'
                  : isOperator(key) ? 'rgba(99,102,241,0.1)'
                  : isParamHint(key) ? 'rgba(251,191,36,0.06)'
                  : 'var(--surface)'

                const border = isPrimaryVar(key) ? '1px solid var(--accent)'
                  : isConst(key) ? '1px solid rgba(251,191,36,0.3)'
                  : isOperator(key) ? '1px solid rgba(99,102,241,0.25)'
                  : isParamHint(key) ? '1px solid rgba(251,191,36,0.2)'
                  : '1px solid var(--border-subtle)'

                const color = isPrimaryVar(key) ? 'var(--accent)'
                  : isConst(key) ? '#fbbf24'
                  : isOperator(key) ? 'var(--accent)'
                  : isParamHint(key) ? '#fbbf24'
                  : isDigit(key) ? 'var(--text-primary)'
                  : 'var(--text-secondary)'

                const w = key.length > 3 ? 'auto' : key.length > 2 ? '42px' : key.length > 1 ? '34px' : '28px'
                const fs = key.length > 3 ? '10px' : key.length > 1 ? '11px' : isDigit(key) ? '14px' : '13px'

                return (
                  <motion.button key={key}
                    whileHover={{ scale: 1.1, y: -1 }}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => onInsert(key)}
                    style={{
                      width: w, height: '32px',
                      border, borderRadius: '5px', background: bg,
                      color, cursor: 'pointer', fontSize: fs,
                      fontFamily: 'var(--font-mono)', outline: 'none',
                      fontWeight: isDigit(key) ? 500 : 'normal',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 0,
                    }}
                  >{key}</motion.button>
                )
              })}
            </div>
          ))}

          {/* Manual param + action bar */}
          <div style={{
            display: 'flex', gap: '5px', paddingTop: '6px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onAddParam}
              style={{
                padding: '6px 10px', border: '1px dashed var(--accent)',
                borderRadius: '6px', background: 'var(--accent-glow)',
                color: 'var(--accent)', fontSize: '11px', cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}>⚙ +Param</motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onBackspace}
              style={{
                padding: '6px 12px', border: '1px solid var(--border-subtle)',
                borderRadius: '6px', background: 'var(--surface)',
                color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
              }}>⌫</motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onClear}
              style={{
                padding: '6px 12px', border: '1px solid var(--border-subtle)',
                borderRadius: '6px', background: 'var(--surface)',
                color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer',
              }}>Clear</motion.button>
            <div style={{ flex: 1 }} />
            <motion.button whileTap={{ scale: 0.95 }} onClick={onConfirm}
              style={{
                padding: '6px 24px', border: 'none', borderRadius: '6px',
                background: 'var(--accent)', color: 'white', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer',
              }}>{editing ? '更新' : t('keyboard.confirm')}</motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
