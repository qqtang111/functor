/**
 * ParamDetector — extracts free variable parameters from math expressions
 *
 * Uses mathjs AST to find variables that are NOT:
 * - Known math functions (sin, cos, tan, etc.)
 * - Mathematical constants (pi, e, i, etc.)
 * - Independent variables (x, y for 2D; x, y, z for 3D)
 *
 * What remains are treated as adjustable parameters for sliders.
 */

import { create, all } from 'mathjs'
const math = create(all, {})

/** Functions from mathjs that should NOT be treated as parameters */
const KNOWN_FUNCTIONS = new Set([
  // Trig
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'arcsin', 'arccos', 'arctan', 'arccot', 'arcsec', 'arccsc',
  'asin', 'acos', 'atan', 'acot', 'asec', 'acsc',
  'sinh', 'cosh', 'tanh', 'coth', 'sech', 'csch',
  'arcsinh', 'arccosh', 'arctanh',
  'asinh', 'acosh', 'atanh',
  // Log/exp
  'log', 'log2', 'log10', 'ln', 'exp',
  // Power/root
  'sqrt', 'cbrt', 'nthRoot', 'pow',
  // Rounding
  'abs', 'ceil', 'floor', 'round', 'fix', 'sign',
  // Combinatorics
  'factorial', 'combinations', 'permutations', 'gamma',
  // Misc
  'gcd', 'lcm', 'mod', 'norm', 'random',
  // Complex
  're', 'im', 'arg', 'conj',
  // Matrix
  'det', 'inv', 'transpose', 'ctranspose',
  // Statistics
  'mean', 'median', 'mode', 'std', 'var', 'min', 'max',
  // Series
  'sum', 'prod',
  // Derivative
  'derivative',
])

/** Mathematical constants that should NOT be treated as parameters */
const KNOWN_CONSTANTS = new Set([
  'pi', 'PI', 'e', 'E', 'i', 'I', 'Infinity', 'NaN',
  'phi', 'tau', 'version',
  'true', 'false', 'null', 'undefined',
])

/** Greek letter name -> symbol mapping for display */
const GREEK_DISPLAY = {
  'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ',
  'epsilon': 'ε', 'zeta': 'ζ', 'eta': 'η', 'theta': 'θ',
  'iota': 'ι', 'kappa': 'κ', 'lambda': 'λ', 'mu': 'μ',
  'nu': 'ν', 'xi': 'ξ', 'omicron': 'ο',
  'rho': 'ρ', 'sigma': 'σ', 'tau': 'τ', 'upsilon': 'υ',
  'phi': 'φ', 'chi': 'χ', 'psi': 'ψ', 'omega': 'ω',
}

/** Smart parameter defaults based on common usage */
const PARAM_DEFAULTS = {
  'k': { min: -10, max: 10, step: 0.1 },
  'b': { min: -10, max: 10, step: 0.1 },
  'm': { min: -10, max: 10, step: 0.1 },
  'c': { min: -10, max: 10, step: 0.1 },
  'a': { min: -5, max: 5, step: 0.1 },
  'A': { min: -5, max: 5, step: 0.1 },
  'omega': { min: 0, max: 5, step: 0.1 },
  'phi': { min: 0, max: 6.283, step: 0.1 },
  'a1': { min: -10, max: 10, step: 0.1 },
  'd': { min: -10, max: 10, step: 0.1 },
  'r': { min: -5, max: 5, step: 0.1 },
  'p': { min: 0.1, max: 3, step: 0.1 },
  'lambda': { min: 0, max: 2, step: 0.05 },
}

/** Independent variables by dimension mode */
const INDEPENDENT_VARS = {
  '2D': new Set(['x']),
  '3D': new Set(['x', 'y']),
  'sequence': new Set(['n']),
  'partialSum': new Set(['n']),
}

/**
 * Recursively collect all SymbolNode names from an AST node
 * @param {object} node - mathjs AST node
 * @param {Set<string>} symbols - accumulator set
 * @param {Set<string>} functions - accumulator for function names
 */
function collectNodes(node, symbols, functions) {
  if (!node || typeof node !== 'object') return

  if (node.type === 'SymbolNode' && node.name) {
    symbols.add(node.name)
    return
  }

  if (node.type === 'FunctionNode') {
    if (node.fn && node.fn.name) {
      functions.add(node.fn.name)
    }
    if (node.args && Array.isArray(node.args)) {
      for (const arg of node.args) collectNodes(arg, symbols, functions)
    }
    return
  }

  // Recurse into known container properties
  const containers = ['args', 'params', 'content', 'index', 'object', 'left', 'right', 'value']
  for (const key of containers) {
    const val = node[key]
    if (!val) continue
    if (Array.isArray(val)) {
      for (const item of val) collectNodes(item, symbols, functions)
    } else if (typeof val === 'object') {
      collectNodes(val, symbols, functions)
    }
  }
}

/**
 * Extract parameter names from a math expression
 * @param {string} expr - math expression string (e.g., "k*x + b")
 * @param {string} mode - dimension mode: '2D', '3D', 'sequence', 'partialSum'
 * @returns {string[]} array of detected parameter names
 */
export function detectParameters(expr, mode = '2D') {
  if (!expr || typeof expr !== 'string') return []

  try {
    const node = math.parse(expr)
    const symbols = new Set()
    const functions = new Set()

    collectNodes(node, symbols, functions)

    const independentVars = INDEPENDENT_VARS[mode] || INDEPENDENT_VARS['2D']

    const params = []
    for (const s of symbols) {
      if (KNOWN_FUNCTIONS.has(s)) continue
      if (KNOWN_CONSTANTS.has(s)) continue
      if (independentVars.has(s)) continue
      params.push(s)
    }

    return params
  } catch {
    return []
  }
}

/**
 * Get display symbol for a parameter (Greek letters -> symbols)
 * @param {string} paramName
 * @returns {string}
 */
export function getParamDisplay(paramName) {
  return GREEK_DISPLAY[paramName] || paramName
}

/**
 * Get smart default range for a parameter
 * @param {string} paramName
 * @returns {{ min: number, max: number, step: number }}
 */
export function getParamDefaults(paramName) {
  if (PARAM_DEFAULTS[paramName]) return { ...PARAM_DEFAULTS[paramName] }

  const lower = paramName.toLowerCase()
  if (PARAM_DEFAULTS[lower]) return { ...PARAM_DEFAULTS[lower] }

  // Subscript pattern (e.g., a0, x0, v0)
  if (/^[a-zA-Z]\d+$/.test(paramName)) {
    return { min: -10, max: 10, step: 0.1 }
  }

  return { min: -10, max: 10, step: 0.1 }
}

/**
 * Check if parameter name has subscript pattern
 * @param {string} paramName
 * @returns {{ base: string, sub: string } | null}
 */
export function parseSubscript(paramName) {
  const m = paramName.match(/^([a-zA-Z]+)(\d+)$/)
  if (m) return { base: m[1], sub: m[2] }
  return null
}

/**
 * Build parameter config for initial state
 * @param {string} paramName
 * @returns {{ value: number, min: number, max: number, step: number, default: number, locked: boolean }}
 */
export function createParamConfig(paramName) {
  const defaults = getParamDefaults(paramName)
  const value = (defaults.min + defaults.max) / 2
  return {
    value,
    min: defaults.min,
    max: defaults.max,
    step: defaults.step,
    default: value,
    locked: false,
  }
}
