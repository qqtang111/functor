import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFunctionStore } from '../../stores/functionStore'
import { useViewStore } from '../../stores/viewStore'
import { detectDimension } from '../../engine/DimDetector'
import { validateExpression } from '../../engine/MathEngine'
import { createParamConfig } from '../../engine/ParamDetector'
import MathKeyboard from './MathKeyboard'

/** Map mathjs error messages to i18n keys */
function getErrorKey(english) {
  const map = [
    ['Unexpected end of expression', 'error.incomplete'],
    ['Unexpected token', 'error.unknownSymbol'],
    ['Undefined symbol', 'error.undefinedSymbol'],
    ['Unexpected type of argument', 'error.argumentType'],
    ['Value expected', 'error.valueExpected'],
    ['Parenthesis ) expected', 'error.parenRight'],
    ['Parenthesis ( expected', 'error.parenLeft'],
    ['End of expression expected', 'error.extraContent'],
    ['Cannot convert', 'error.cannotConvert'],
    ['is not a function', 'error.notAFunction'],
    ['Unexpected operator', 'error.operator'],
    ['Too many arguments', 'error.tooManyArgs'],
    ['Too few arguments', 'error.tooFewArgs'],
  ]
  for (const [en, key] of map) {
    if (english.includes(en)) return key
  }
  return 'error.generic'
}

export default function FunctionInput() {
  const { t } = useTranslation()
  const functions = useFunctionStore((s) => s.functions)
  const addFunction = useFunctionStore((s) => s.addFunction)
  const addDerivative = useFunctionStore((s) => s.addDerivative)
  const removeFunction = useFunctionStore((s) => s.removeFunction)
  const updateExpression = useFunctionStore((s) => s.updateExpression)
  const setParamValue = useFunctionStore((s) => s.setParamValue)
  const setParamRange = useFunctionStore((s) => s.setParamRange)
  const startDemo = useViewStore((s) => s.startDemo)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [error, setError] = useState(null)
  const [inputMode, setInputMode] = useState('function')
  const [showParamDialog, setShowParamDialog] = useState(false)
  const [newParamName, setNewParamName] = useState('')
  const [editingId, setEditingId] = useState(null) // Phase 8: edit mode for existing functions
  const inputRef = useRef(null)
  const wrapperRef = useRef(null)
  const dim = detectDimension(inputVal)

  // Close keyboard on click outside wrapper
  useEffect(() => {
    if (!showKeyboard) return
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowKeyboard(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showKeyboard])

  const handleChange = useCallback((e) => {
    // Auto-convert Chinese brackets to English
    let val = e.target.value
    val = val.replace(/（/g, '(').replace(/）/g, ')')
    setInputVal(val)
    setError(null)
    if (editingId) setEditingId(null) // New input clears edit mode
  }, [editingId])

  const handleInsert = (text) => {
    const el = inputRef.current; if (!el) return
    // Map Desmos symbols to mathjs-compatible text
    const map = { '×': '*', '÷': '/', '−': '-', '²': '^2', 'ˣ': '^', 'π': 'pi' }
    const mapped = map[text] || text
    const start = el.selectionStart
    const newVal = inputVal.slice(0, start) + mapped + inputVal.slice(start)
    setInputVal(newVal); setError(null)
    setTimeout(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + mapped.length
    }, 10)
  }

  const handleBackspace = () => {
    const el = inputRef.current; if (!el) return
    const start = el.selectionStart
    if (start > 0) {
      setInputVal(inputVal.slice(0, start - 1) + inputVal.slice(start))
      setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start - 1 }, 10)
    }
  }

  // Manual param registration
  const handleAddParam = () => {
    setNewParamName('')
    setShowParamDialog(true)
  }

  const handleConfirmParam = () => {
    const name = newParamName.trim()
    if (!name) { setShowParamDialog(false); return }
    const fn = functions.find((f) => f.visible && !f.isDerivative)
    if (fn) {
      const cfg = createParamConfig(name)
      setParamValue(fn.id, name, cfg.value)
      setParamRange(fn.id, name, { min: cfg.min, max: cfg.max, step: cfg.step, default: cfg.default })
    }
    setShowParamDialog(false); setNewParamName('')
  }

  const handleSubmit = () => {
    let expr = inputVal.trim()
    if (!expr) return

    // Auto-close unbalanced parentheses
    let open = 0
    for (const ch of expr) {
      if (ch === '(') open++
      if (ch === ')') open--
    }
    while (open > 0) { expr += ')'; open-- }

    const { valid, error: err } = validateExpression(expr)
    if (!valid) { setError(t(getErrorKey(err))); return }

    // Check if editing an existing function (duplicate prevention)
    if (editingId) {
      updateExpression(editingId, expr)
      setEditingId(null)
    } else {
      // Prevent adding duplicate of existing visible function
      const dup = functions.find((f) => f.visible && f.expr === expr && !f.isDerivative)
      if (dup) {
        // Update existing function instead of duplicating
        updateExpression(dup.id, expr)
      } else {
        addFunction(expr, { mode: inputMode })
      }
    }
    setInputVal(''); setError(null); setShowKeyboard(false)
  }

  return (
    <div ref={wrapperRef} style={{ padding: '0 14px 12px' }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>
        {t('input.label')}
      </div>

      {functions.map((f) => (
        <div key={f.id} style={{
          display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px',
        }}>
          <div
            onClick={() => { setInputVal(f.expr); setInputMode(f.mode || 'function'); setEditingId(f.id); setShowKeyboard(true); inputRef.current?.focus() }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', flex: 1,
              border: '1px solid var(--border-subtle)', borderRadius: '6px', background: 'var(--surface)',
              cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px',
              color: f.visible ? f.color : 'var(--text-muted)', opacity: f.visible ? 1 : 0.5,
              minWidth: 0,
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color, flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {f.label || f.expr}
            </span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', flexShrink: 0 }}>
              {f.isDerivative ? 'f\'' : f.mode === 'sequence' ? 'aₙ' : f.mode === 'partialSum' ? 'Sₙ' : '2D'}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            {!f.isDerivative && (
              <span onClick={(e) => { e.stopPropagation(); addDerivative(f.id); setTimeout(() => startDemo(f.id), 200) }}
                title="添加导数"
                style={{
                  color: 'var(--accent)', cursor: 'pointer', fontSize: '11px',
                  padding: '3px 4px', borderRadius: '4px',
                  border: '1px solid var(--border-subtle)', background: 'var(--surface)',
                  fontFamily: 'var(--font-mono)', userSelect: 'none',
                }}>f'</span>
            )}
            <span onClick={(e) => { e.stopPropagation(); startDemo(f.id) }}
              title="演示此函数"
              style={{
                color: '#fbbf24', cursor: 'pointer', fontSize: '11px',
                padding: '3px 4px', borderRadius: '4px',
                border: '1px solid var(--border-subtle)', background: 'var(--surface)',
                userSelect: 'none',
              }}>▶</span>
            <span onClick={(e) => { e.stopPropagation(); removeFunction(f.id) }}
              style={{ color: 'var(--danger)', cursor: 'pointer', fontSize: '11px', padding: '3px 5px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--surface)' }}>✕</span>
          </div>
        </div>
      ))}

      <div style={{ position: 'relative' }}>
        {/* Phase 8: Mode selector */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
          {[
            { key: 'function', label: 'f(x)' },
            { key: 'sequence', label: 'aₙ' },
            { key: 'partialSum', label: 'Sₙ' },
          ].map((m) => (
            <div key={m.key}
              onClick={() => setInputMode(m.key)}
              style={{
                padding: '3px 8px', fontSize: '10px', fontFamily: 'var(--font-mono)',
                borderRadius: '4px', cursor: 'pointer',
                background: inputMode === m.key ? 'var(--accent)' : 'var(--surface)',
                color: inputMode === m.key ? '#fff' : 'var(--text-muted)',
                border: inputMode === m.key ? 'none' : '1px solid var(--border-subtle)',
                transition: 'all 0.15s',
              }}>
              {m.label}
            </div>
          ))}
        </div>
        <input ref={inputRef} type="text" value={inputVal}
          onChange={handleChange}
          onFocus={() => setShowKeyboard(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') setShowKeyboard(false) }}
          placeholder={t('input.placeholder')}
          style={{
            width: '100%', padding: '10px 12px',
            border: error ? '1px solid var(--danger)' : '1px dashed var(--border-subtle)',
            borderRadius: '6px', background: 'var(--surface)', color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)', fontSize: '13px', outline: 'none',
            caretColor: 'var(--accent)',
            boxShadow: showKeyboard ? '0 0 12px var(--accent-glow)' : 'none',
          }}
        />
        {dim && <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: dim === '3D' ? '#fbbf24' : 'var(--accent)', fontFamily: 'var(--font-mono)', pointerEvents: 'none' }}>{dim}</span>}
      </div>
      {error && <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px', paddingLeft: '4px' }}>{error}</div>}

      {/* Manual param dialog */}
      {showParamDialog && (
        <div style={{
          position: 'absolute', bottom: '50px', left: 0, right: 0, zIndex: 210,
          background: 'rgba(10,10,30,0.98)', border: '1px solid var(--accent)',
          borderRadius: '8px', padding: '10px', margin: '0 4px',
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            添加自定义参数:
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <input value={newParamName} onChange={(e) => setNewParamName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmParam(); if (e.key === 'Escape') setShowParamDialog(false) }}
              autoFocus placeholder="参数名, 如 myVar"
              style={{
                flex: 1, padding: '6px 8px', fontSize: '12px', fontFamily: 'var(--font-mono)',
                border: '1px solid var(--accent)', borderRadius: '4px',
                background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none',
              }} />
            <button onClick={handleConfirmParam}
              style={{
                padding: '6px 12px', border: 'none', borderRadius: '4px',
                background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600,
              }}>添加</button>
            <button onClick={() => setShowParamDialog(false)}
              style={{
                padding: '6px 10px', border: '1px solid var(--border-subtle)', borderRadius: '4px',
                background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer',
                fontSize: '12px',
              }}>取消</button>
          </div>
        </div>
      )}

      <MathKeyboard
        visible={showKeyboard}
        currentExpr={inputVal}
        onInsert={handleInsert}
        onBackspace={handleBackspace}
        onClear={() => { setInputVal(''); setError(null); inputRef.current?.focus() }}
        onConfirm={handleSubmit}
        onAddParam={handleAddParam}
        editing={!!editingId}
      />
    </div>
  )
}
