/**
 * ShareEncoder — URL hash encoding/decoding + LaTeX export
 *
 * Hash format:
 *   #expr=sin(x);cos(x)&mode=2D&zoom=1.50&ox=0&oy=0
 *
 * Per-function parameters are prefixed with the function index:
 *   &p0_k=2.5&p0_b=1&p1_a=3
 */

import { create, all } from 'mathjs'
const math = create(all, {})

/**
 * Encode current app state into URL hash for sharing
 * @param {Array} functions — functionStore.functions
 * @param {Object} viewState — { mode, zoom, offsetX, offsetY }
 * @returns {string} hash string (including #)
 */
export function encodeShareState(functions, viewState) {
  const params = new URLSearchParams()

  // Encode visible function expressions
  const visibleFns = functions.filter((f) => f.visible && !f.isDerivative)
  if (visibleFns.length > 0) {
    const exprs = visibleFns.map((f) => f.expr)
    params.set('expr', exprs.join(';'))
  }

  // Encode labels
  const labels = visibleFns.filter((f) => f.label).map((f) => f.label)
  if (labels.length > 0) {
    params.set('labels', labels.join(';'))
  }

  // View state
  if (viewState.mode && viewState.mode !== '2D') params.set('mode', viewState.mode)
  if (viewState.zoom && viewState.zoom !== 1) {
    params.set('zoom', viewState.zoom.toFixed(2))
  }
  if (viewState.offsetX) params.set('ox', viewState.offsetX.toFixed(4))
  if (viewState.offsetY) params.set('oy', viewState.offsetY.toFixed(4))

  // Per-function parameter values
  visibleFns.forEach((f, i) => {
    if (f.parameters) {
      for (const [key, cfg] of Object.entries(f.parameters)) {
        if (cfg.value !== cfg.default) {
          params.set(`p${i}_${key}`, String(cfg.value))
        }
      }
    }
  })

  return '#' + params.toString()
}

/**
 * Decode URL hash back into state
 * @param {string} hash — window.location.hash
 * @returns {Object|null} { exprs, labels, mode, zoom, ox, oy, paramMap }
 */
export function decodeShareState(hash) {
  if (!hash || hash === '#' || hash.length < 3) return null

  try {
    const params = new URLSearchParams(hash.slice(1))
    const exprs = params.get('expr')
    if (!exprs) return null

    const exprList = exprs.split(';').filter(Boolean)
    if (exprList.length === 0) return null

    const labelList = params.get('labels')?.split(';') || []

    // Collect per-function parameter maps
    const paramMap = new Map() // index -> { paramName: value }
    for (const [key, value] of params.entries()) {
      const m = key.match(/^p(\d+)_(.+)$/)
      if (m) {
        const idx = parseInt(m[1], 10)
        const pName = m[2]
        const pVal = parseFloat(value)
        if (!isNaN(pVal)) {
          if (!paramMap.has(idx)) paramMap.set(idx, {})
          paramMap.get(idx)[pName] = pVal
        }
      }
    }

    return {
      exprs: exprList,
      labels: labelList,
      mode: params.get('mode') || '2D',
      zoom: parseFloat(params.get('zoom') || '1'),
      ox: parseFloat(params.get('ox') || '0'),
      oy: parseFloat(params.get('oy') || '0'),
      paramMap,
    }
  } catch {
    return null
  }
}

/**
 * Convert math expression to LaTeX string
 * @param {string} expr — e.g. "sin(x) + x^2"
 * @returns {string} LaTeX representation
 */
export function toLatex(expr) {
  try {
    const node = math.parse(expr)
    const tex = node.toTex()
    // Clean up mathjs TeX quirks
    return tex
      .replace(/\\cdot /g, '')
      .replace(/\\left/g, '\\\\left')
      .replace(/\\right/g, '\\\\right')
  } catch {
    return expr
  }
}

/**
 * Build a human-readable LaTeX block for all visible functions
 * @param {Array} functions
 * @returns {string}
 */
export function buildLatexBlock(functions) {
  const visibleFns = functions.filter((f) => f.visible && !f.isDerivative)
  if (visibleFns.length === 0) return ''
  return visibleFns
    .map((f, i) => {
      const label = f.label || `f_{${i + 1}}`
      return `${label}(x) = ${toLatex(f.expr)}`
    })
    .join(' \\\\[8pt]\n')
}

/**
 * Apply shared state from URL hash — loads functions and view into stores
 * @param {Object} state — decoded share state
 * @param {Function} addFunction — functionStore.addFunction
 * @param {Function} setMode — viewStore.setMode
 * @param {Function} setZoom — viewStore.setZoom
 * @param {Function} setOffset — viewStore.setOffset
 * @param {Function} setParamValue — functionStore.setParamValue
 */
export function applyShareState(state, addFunction, setMode, setZoom, setOffset, setParamValue) {
  if (!state || !state.exprs) return

  // Load functions
  const addedIds = []
  state.exprs.forEach((expr, i) => {
    const label = state.labels[i] || ''
    const params = state.paramMap?.get(i) || {}
    addFunction(expr, { label, params })
    // We can't get the ID back directly, but the function will be added
  })

  // Apply view state
  if (state.mode === '3D') setMode('3D')
  if (state.zoom && state.zoom !== 1) setZoom(state.zoom)
  if (state.ox || state.oy) setOffset(state.ox || 0, state.oy || 0)
}
