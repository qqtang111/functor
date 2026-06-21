/**
 * MathKeyboard — layered keyboard with 3 tabs + expression preview
 *
 * Tabs:
 *   1. 运算符/Operators  — digits, operators, parentheses, x, y
 *   2. 函数/Functions    — sin, cos, log, sqrt, abs, sum, etc.
 *   3. 希腊/Greek        — α-ω, Δ-Ω
 *
 * Bottom: expression preview bar + action row (backspace, clear, confirm)
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

/* ═══════════════════════════════════════════
   Tab Definitions
   ═══════════════════════════════════════════ */

const TABS = [
  {
    key: 'basic',
    label: '运算符',
    enLabel: 'Ops',
    rows: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['x', 'y', '.', 'π', 'e', ',', '|x|', '1/', '^'],
      ['+', '−', '×', '÷', '=', '(', ')', '√(', '²'],
    ],
  },
  {
    key: 'functions',
    label: '函数',
    enLabel: 'Fn',
    rows: [
      ['sin(', 'cos(', 'tan(', 'cot(', 'sec(', 'csc('],
      ['arcsin(', 'arccos(', 'arctan(', 'sinh(', 'cosh(', 'tanh('],
      ['log(', 'log2(', 'log10(', 'ln(', 'exp(', 'sqrt('],
      ['abs(', 'sum(', 'prod(', 'gcd(', 'lcm(', 'mod('],
      ['factorial(', 'nthRoot(', 'combinations(', 'permutations(', 'gamma('],
    ],
  },
  {
    key: 'greek',
    label: '希腊',
    enLabel: 'Greek',
    rows: [
      ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η'],
      ['θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ'],
      ['ο', 'π', 'ρ', 'σ', 'τ', 'υ'],
      ['φ', 'χ', 'ψ', 'ω'],
      ['Δ', 'Θ', 'Λ', 'Ξ', 'Π', 'Σ', 'Φ', 'Ψ', 'Ω'],
    ],
  },
]

/* ═══════════════════════════════════════════
   Key color coding
   ═══════════════════════════════════════════ */

function getKeyStyle(key) {
  const isPrimaryVar = key === 'x' || key === 'y'
  const isDigit = /^[0-9.]$/.test(key)
  const isConst = key === 'π' || key === 'e'
  const isOperator =
    '+-×÷=()^²,'.includes(key) ||
    key.startsWith('|') ||
    key.startsWith('√') ||
    key === '1/'
  const isFunc = key.endsWith('(') && key.length > 2
  const isGreek =
    (key >= 'α' && key <= 'ω') || (key >= 'Α' && key <= 'Ω')

  if (isPrimaryVar) return { bg: 'var(--accent-glow)', border: '1px solid var(--accent)', color: 'var(--accent)' }
  if (isDigit) return { bg: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }
  if (isConst) return { bg: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }
  if (isOperator) return { bg: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: 'var(--accent)' }
  if (isFunc) return { bg: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }
  if (isGreek) return { bg: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }
  return { bg: 'var(--surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

export default function MathKeyboard({
  visible,
  onInsert,
  onBackspace,
  onClear,
  onConfirm,
  onAddParam,
  editing,
  currentExpr,
}) {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('basic')

  const currentTab = TABS.find((tb) => tb.key === activeTab)
  const isZh = i18n.language?.startsWith('zh')

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="math-keyboard"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 200,
            background: 'rgba(10,10,30,0.97)',
            borderTop: '1px solid var(--border-subtle)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '6px 8px 4px',
            userSelect: 'none',
            maxHeight: '65vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ═══ Tab bar ═══ */}
          <div
            style={{
              display: 'flex',
              gap: '0',
              marginBottom: '6px',
              borderRadius: '8px',
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {TABS.map((tab) => (
              <div
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '8px 0',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  color: activeTab === tab.key ? '#fff' : 'var(--text-muted)',
                  background:
                    activeTab === tab.key ? 'var(--accent)' : 'transparent',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {isZh ? tab.label : tab.enLabel}
              </div>
            ))}
          </div>

          {/* ═══ Expression preview ═══ */}
          <div
            style={{
              padding: '6px 10px',
              marginBottom: '6px',
              background: 'var(--surface)',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent)',
              minHeight: '28px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              flexShrink: 0,
            }}
          >
            {currentExpr || (
              <span style={{ color: 'var(--text-muted)' }}>
                {t('input.placeholder') || 'Enter expression...'}
              </span>
            )}
          </div>

          {/* ═══ Active tab key rows ═══ */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}
          >
            {currentTab &&
              currentTab.rows.map((row, ri) => (
                <div
                  key={ri}
                  style={{
                    display: 'flex',
                    gap: '2px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  {row.map((key) => {
                    const ks = getKeyStyle(key)
                    const isWide = key.length > 4

                    return (
                      <motion.button
                        key={`${activeTab}-${ri}-${key}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.88 }}
                        onClick={() => onInsert(key)}
                        style={{
                          minWidth: isWide ? '52px' : key.length > 2 ? '40px' : '30px',
                          height: '34px',
                          border: ks.border,
                          borderRadius: '5px',
                          background: ks.bg,
                          color: ks.color,
                          cursor: 'pointer',
                          fontSize: isWide ? '9px' : '12px',
                          fontFamily: 'var(--font-mono)',
                          outline: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 4px',
                        }}
                      >
                        {key}
                      </motion.button>
                    )
                  })}
                </div>
              ))}
          </div>

          {/* ═══ Action bar ═══ */}
          <div
            style={{
              display: 'flex',
              gap: '5px',
              paddingTop: '6px',
              borderTop: '1px solid var(--border-subtle)',
              flexShrink: 0,
            }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onAddParam}
              style={{
                padding: '6px 10px',
                border: '1px dashed var(--accent)',
                borderRadius: '6px',
                background: 'var(--accent-glow)',
                color: 'var(--accent)',
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            >
              ⚙ +Param
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onBackspace}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            >
              ⌫
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClear}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            >
              {t('input.clear') || 'Clear'}
            </motion.button>
            <div style={{ flex: 1 }} />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onConfirm}
              style={{
                padding: '6px 24px',
                border: 'none',
                borderRadius: '6px',
                background: 'var(--accent)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
            >
              {editing ? (isZh ? '更新' : 'Update') : (t('keyboard.confirm') || 'Confirm ✓')}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
