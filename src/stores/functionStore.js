import { create } from 'zustand'
import { computeDerivative } from '../engine/MathEngine'
import { detectParameters, createParamConfig } from '../engine/ParamDetector'

let idCounter = 0
const COLORS = ['#6366f1', '#fbbf24', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
const DERIV_COLORS = ['#a78bfa', '#fbbf24', '#34d399', '#f87171', '#c084fc', '#f472b6', '#22d3ee']

export const useFunctionStore = create((set, get) => ({
  functions: [],
  activeInput: '',

  addFunction: (expr, meta = {}) => {
    const idx = get().functions.length
    const isDeriv = meta.type === 'derivative'
    const palette = isDeriv ? DERIV_COLORS : COLORS
    const mode = meta.mode || 'function'

    // Phase 8: Auto-detect parameters from expression (all modes)
    let parameters = {}
    if (!isDeriv) {
      const dim = (mode === 'sequence' || mode === 'partialSum') ? 'sequence' : '2D'
      const paramNames = detectParameters(expr, dim)
      for (const p of paramNames) {
        parameters[p] = { ...createParamConfig(p), value: meta.params?.[p] ?? 1 }
      }
      // Also apply any explicitly provided params that weren't auto-detected
      if (meta.params) {
        for (const [p, v] of Object.entries(meta.params)) {
          if (!parameters[p]) {
            parameters[p] = { ...createParamConfig(p), value: typeof v === 'number' ? v : 1 }
          }
        }
      }
    }

    set((s) => ({
      functions: [...s.functions, {
        id: ++idCounter,
        expr,
        color: meta.color || palette[idx % palette.length],
        visible: true,
        range: [-5, 5],
        label: meta.label || '',
        isDerivative: isDeriv,
        derivativeOf: meta.derivativeOf || null,
        // Phase 8: Parameter slider support
        mode,
        parameters,
        // Phase 8: Sequence support (applied when mode is 'sequence'/'partialSum')
        sequenceConfig: {
          N: 50,
          displayMode: 'points',
          showLimit: true,
          showConvergenceBand: false,
          animating: false,
          animationSpeed: 10,
        },
      }],
      activeInput: '',
    }))
  },

  addDerivative: (id) => {
    const fn = get().functions.find((f) => f.id === id)
    if (!fn) return
    const result = computeDerivative(fn.expr)
    if (!result) return
    // Copy parent function's parameters to derivative (for slope calculation)
    const derivParams = {}
    if (fn.parameters) {
      for (const [k, v] of Object.entries(fn.parameters)) {
        derivParams[k] = { ...v }
      }
    }

    const idx2 = get().functions.filter((f) => f.isDerivative).length
    const newId = ++idCounter
    set((s) => ({
      functions: [...s.functions, {
          id: newId,
          expr: result.expr,
          color: DERIV_COLORS[idx2 % DERIV_COLORS.length],
          visible: true,
          range: fn.range,
          label: `f' = ${result.expr}`,
          isDerivative: true,
          derivativeOf: id,
          mode: 'function',
          parameters: derivParams,
          sequenceConfig: { N: 50, displayMode: 'points', showLimit: true, showConvergenceBand: false, animating: false, animationSpeed: 10 },
        }],
      }))
  },

  removeFunction: (id) => {
    set((s) => ({ functions: s.functions.filter((f) => f.id !== id) }))
  },

  toggleVisible: (id) => {
    set((s) => ({
      functions: s.functions.map((f) => f.id === id ? { ...f, visible: !f.visible } : f),
    }))
  },

  setActiveInput: (val) => set({ activeInput: val }),

  updateRange: (id, range) => {
    set((s) => ({
      functions: s.functions.map((f) => f.id === id ? { ...f, range } : f),
    }))
  },

  updateColor: (id, color) => {
    set((s) => ({
      functions: s.functions.map((f) => f.id === id ? { ...f, color } : f),
    }))
  },

  // ═══════════════════════════════════════════
  // Phase 8: Parameter Slider Actions
  // ═══════════════════════════════════════════

  /** Set a parameter's current value. Syncs across derivative chain. */
  setParamValue: (id, paramName, value) => {
    const fn = get().functions.find((f) => f.id === id)
    if (!fn || !fn.parameters[paramName]) return

    // Collect linked function IDs (original + its derivatives, or derivative + its parent)
    const linkedIds = new Set([id])
    if (fn.derivativeOf) linkedIds.add(fn.derivativeOf)
    if (!fn.isDerivative) {
      get().functions.forEach((f) => {
        if (f.derivativeOf === id) linkedIds.add(f.id)
      })
    }

    set((s) => ({
      functions: s.functions.map((f) => {
        if (!linkedIds.has(f.id) || !f.parameters[paramName]) return f
        return {
          ...f,
          parameters: {
            ...f.parameters,
            [paramName]: { ...f.parameters[paramName], value },
          },
        }
      }),
    }))
  },

  /** Update parameter range (min, max, step). Syncs to linked functions. */
  setParamRange: (id, paramName, range) => {
    const fn = get().functions.find((f) => f.id === id)
    if (!fn || !fn.parameters[paramName]) return

    const linkedIds = new Set([id])
    if (fn.derivativeOf) linkedIds.add(fn.derivativeOf)
    if (!fn.isDerivative) {
      get().functions.forEach((f) => {
        if (f.derivativeOf === id) linkedIds.add(f.id)
      })
    }

    set((s) => ({
      functions: s.functions.map((f) => {
        if (!linkedIds.has(f.id) || !f.parameters[paramName]) return f
        return {
          ...f,
          parameters: {
            ...f.parameters,
            [paramName]: { ...f.parameters[paramName], ...range },
          },
        }
      }),
    }))
  },

  /** Toggle parameter lock state */
  toggleParamLock: (id, paramName) => {
    set((s) => ({
      functions: s.functions.map((f) => {
        if (f.id !== id || !f.parameters[paramName]) return f
        return {
          ...f,
          parameters: {
            ...f.parameters,
            [paramName]: { ...f.parameters[paramName], locked: !f.parameters[paramName].locked },
          },
        }
      }),
    }))
  },

  /** Reset a single parameter to its default value */
  resetParam: (id, paramName) => {
    set((s) => ({
      functions: s.functions.map((f) => {
        if (f.id !== id || !f.parameters[paramName]) return f
        return {
          ...f,
          parameters: {
            ...f.parameters,
            [paramName]: { ...f.parameters[paramName], value: f.parameters[paramName].default },
          },
        }
      }),
    }))
  },

  /** Reset all parameters for a function */
  resetAllParams: (id) => {
    set((s) => ({
      functions: s.functions.map((f) => {
        if (f.id !== id) return f
        const resetParams = {}
        for (const [k, v] of Object.entries(f.parameters)) {
          resetParams[k] = { ...v, value: v.default }
        }
        return { ...f, parameters: resetParams }
      }),
    }))
  },

  /** Re-detect parameters after expression change */
  redetectParameters: (id) => {
    const fn = get().functions.find((f) => f.id === id)
    if (!fn) return
    const dim = fn.mode === 'sequence' || fn.mode === 'partialSum' ? 'sequence' : '2D'
    const paramNames = detectParameters(fn.expr, dim)
    const parameters = {}
    for (const p of paramNames) {
      if (fn.parameters[p]) {
        parameters[p] = { ...fn.parameters[p] }
      } else {
        parameters[p] = createParamConfig(p)
      }
    }
    set((s) => ({
      functions: s.functions.map((f) => f.id === id ? { ...f, parameters } : f),
    }))
  },

  // ═══════════════════════════════════════════
  // Phase 8: Sequence Mode Actions
  // ═══════════════════════════════════════════

  /** Set function mode: 'function' | 'sequence' | 'partialSum' */
  setFunctionMode: (id, mode) => {
    set((s) => ({
      functions: s.functions.map((f) => {
        if (f.id !== id) return f
        const paramNames = detectParameters(f.expr, mode === 'function' ? '2D' : 'sequence')
        const parameters = {}
        for (const p of paramNames) {
          if (f.parameters[p]) {
            parameters[p] = { ...f.parameters[p] }
          } else {
            parameters[p] = createParamConfig(p)
          }
        }
        return { ...f, mode, parameters }
      }),
    }))
  },

  /** Update sequence config (N, displayMode, etc.) */
  setSequenceConfig: (id, config) => {
    set((s) => ({
      functions: s.functions.map((f) => {
        if (f.id !== id) return f
        return { ...f, sequenceConfig: { ...f.sequenceConfig, ...config } }
      }),
    }))
  },

  /** Update expression for an existing function (preserves parameter configs) */
  updateExpression: (id, expr) => {
    const fn = get().functions.find((f) => f.id === id)
    if (!fn) return
    const dim = fn.mode === 'function' ? '2D' : 'sequence'
    const paramNames = detectParameters(expr, dim)
    const parameters = {}
    for (const p of paramNames) {
      if (fn.parameters[p]) {
        parameters[p] = { ...fn.parameters[p] }
      } else {
        parameters[p] = createParamConfig(p)
      }
    }
    set((s) => ({
      functions: s.functions.map((f) => f.id === id ? { ...f, expr, parameters } : f),
    }))
  },

  clearAll: () => set({ functions: [] }),
}))
