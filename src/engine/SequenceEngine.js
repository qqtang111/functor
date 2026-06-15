/**
 * SequenceEngine — sequence/partial-sum evaluation + convergence detection
 *
 * Handles:
 * - a_n evaluation at discrete n=1..N
 * - S_n partial sums (including sum() syntax parsing)
 * - Convergence detection via tail-stability heuristics
 * - Known closed-form limits for common series
 */

import { create, all } from 'mathjs'
const math = create(all, {})

/**
 * Evaluate a sequence at integer points n=1..N
 * @param {string} expr - expression using 'n' as the variable
 * @param {number} N - number of terms to evaluate
 * @param {object} params - additional parameter values (e.g., {p: 2})
 * @returns {Array<{ n: number, value: number } | { n: number, value: null, error: string }>}
 */
export function evaluateSequence(expr, N = 50, params = {}) {
  if (!expr || N < 1) return []

  const compiled = math.compile(expr)
  const results = []

  for (let n = 1; n <= N; n++) {
    try {
      const value = compiled.evaluate({ n, ...params })
      if (typeof value === 'number' && isFinite(value)) {
        results.push({ n, value })
      } else {
        results.push({ n, value: null, error: `n=${n}: not finite` })
      }
    } catch (e) {
      results.push({ n, value: null, error: `n=${n}: ${e.message}` })
    }
  }

  return results
}

/**
 * Evaluate partial sums S_n = sum(term, var, 1, n)
 * @param {string} sumExpr - sum() syntax or simple term expression
 * @param {number} N - max n
 * @param {object} params - additional parameter values
 * @returns {Array<{ n: number, partialSum: number }>}
 */
export function evaluatePartialSum(sumExpr, N = 50, params = {}) {
  if (!sumExpr || N < 1) return []

  const parsed = parseSumExpr(sumExpr)
  if (!parsed) return []

  const { termExpr, variable } = parsed
  const compiled = math.compile(termExpr)
  const results = []
  let runningSum = 0

  for (let n = 1; n <= N; n++) {
    try {
      const term = compiled.evaluate({ [variable]: n, ...params })
      if (typeof term === 'number' && isFinite(term)) {
        runningSum += term
        results.push({ n, partialSum: runningSum, term })
      } else {
        results.push({ n, partialSum: runningSum, term: null })
      }
    } catch {
      results.push({ n, partialSum: runningSum, term: null })
    }
  }

  return results
}

/**
 * Parse sum() expression into components
 * Full: sum(expression, variable, start, end)
 * Short: sum(expression) -> sum(expression, k, 1, n)
 * @param {string} expr
 * @returns {{ termExpr: string, variable: string } | null}
 */
export function parseSumExpr(expr) {
  if (!expr) return null
  const trimmed = expr.trim()

  // sum(expression, var, start, end)
  const sumMatch = trimmed.match(/^sum\s*\((.+)\)\s*$/i)
  if (sumMatch) {
    const args = splitArgs(sumMatch[1])
    if (args.length >= 4) {
      return { termExpr: args[0].trim(), variable: args[1].trim() }
    }
    if (args.length >= 1) {
      return { termExpr: args[0].trim(), variable: 'k' }
    }
  }

  return { termExpr: trimmed, variable: 'k' }
}

/** Split comma-separated args respecting parentheses */
function splitArgs(str) {
  const args = []
  let depth = 0, current = ''
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (ch === '(') { depth++; current += ch }
    else if (ch === ')') { depth--; current += ch }
    else if (ch === ',' && depth === 0) { args.push(current); current = '' }
    else { current += ch }
  }
  if (current.trim()) args.push(current)
  return args
}

/**
 * Detect convergence of a sequence
 * @param {number[]} values - sequence (a_n or S_n values)
 * @param {number} threshold - convergence threshold (default 1e-4)
 * @returns {{ converged: boolean, limit: number|null, stddev: number, trend: string }}
 */
export function detectConvergence(values, threshold = 1e-4) {
  if (!values || values.length < 10) {
    return { converged: false, limit: null, stddev: 0, trend: 'indeterminate' }
  }

  const tailSize = Math.max(10, Math.floor(values.length * 0.2))
  const tail = values.slice(-tailSize)
  const N = tail.length
  const mean = tail.reduce((a, b) => a + b, 0) / N
  const variance = tail.reduce((a, b) => a + (b - mean) ** 2, 0) / N
  const stddev = Math.sqrt(variance)

  const overallMin = Math.min(...values)
  const overallMax = Math.max(...values)
  const valueRange = (overallMax - overallMin) || 1

  // Trend
  const half = Math.floor(N / 2)
  const firstMean = tail.slice(0, half).reduce((a, b) => a + b, 0) / half
  const secondMean = tail.slice(half).reduce((a, b) => a + b, 0) / (N - half)
  const diff = secondMean - firstMean

  let trend = 'stable'
  if (Math.abs(diff) > 0.01 * valueRange) {
    trend = diff > 0 ? 'growing' : 'decaying'
  }

  // Oscillation check
  let signChanges = 0
  for (let i = 2; i < tail.length; i++) {
    const d1 = tail[i] - tail[i - 1]
    const d2 = tail[i - 1] - tail[i - 2]
    if (d1 * d2 < 0) signChanges++
  }
  const isOscillating = signChanges > tail.length * 0.3

  const converged = stddev < threshold * valueRange && !isOscillating

  return {
    converged,
    limit: converged ? mean : null,
    stddev,
    trend: converged ? 'converged' : isOscillating ? 'oscillating' : trend,
  }
}

/** Known closed-form limits for common series */
export function getKnownLimit(expr, params = {}) {
  const trimmed = expr.trim()

  // Extract core term from sum() wrapper
  let term = trimmed
  const sumMatch = trimmed.match(/^sum\s*\((.+)\)\s*$/i)
  if (sumMatch) {
    const args = splitArgs(sumMatch[1])
    term = args[0].trim()
  }

  // Geometric series: 1/(1-r)
  if (/^r\^\(?k-1\)?$/.test(term)) {
    const r = params.r
    if (typeof r === 'number' && Math.abs(r) < 1) {
      return { value: 1 / (1 - r), formula: `1/(1-${r.toFixed(3)}) = ${(1/(1-r)).toFixed(4)}` }
    }
  }

  // p-series: 1/n^p
  const pMatch = term.match(/^1\/n\^(\d*\.?\d*)$/)
  if (pMatch) {
    const p = parseFloat(pMatch[1])
    if (p === 2) return { value: Math.PI * Math.PI / 6, formula: 'π²/6 ≈ 1.6449' }
    if (p === 3) return { value: 1.2020569, formula: 'ζ(3) ≈ 1.2021 (Apéry\'s constant)' }
    if (p === 4) return { value: Math.PI ** 4 / 90, formula: 'π⁴/90 ≈ 1.0823' }
    if (p > 1) return { value: null, formula: `ζ(${p}) — converges` }
  }

  // Alternating harmonic -> ln(2)
  if (['(-1)^(k+1)/k', '(-1)^(n+1)/n'].includes(term)) {
    return { value: Math.log(2), formula: 'ln(2) ≈ 0.6931' }
  }

  // 1/2^n -> 1
  if (['1/2^k', '1/2^n'].includes(term)) {
    return { value: 1, formula: '1' }
  }

  // 1/n! -> e-1
  if (['1/k!', '1/n!', '1/factorial(k)', '1/factorial(n)'].includes(term)) {
    return { value: Math.E - 1, formula: 'e−1 ≈ 1.7183' }
  }

  return null
}

/** Validate a sequence expression with 'n' variable */
export function validateSequenceExpr(expr) {
  if (!expr || !expr.trim()) return { valid: false, error: 'Empty expression' }
  try {
    const compiled = math.compile(expr)
    compiled.evaluate({ n: 1 })
    compiled.evaluate({ n: 2 })
    return { valid: true }
  } catch (e) {
    return { valid: false, error: e.message }
  }
}
