import { create } from 'zustand'
import { computeDerivative } from '../engine/MathEngine'

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
      }],
      activeInput: '',
    }))
  },

  addDerivative: (id) => {
    const fn = get().functions.find((f) => f.id === id)
    if (!fn) return
    const result = computeDerivative(fn.expr)
    if (!result) return
    const idx = get().functions.filter((f) => f.isDerivative).length
    set((s) => ({
      functions: [...s.functions, {
        id: ++idCounter,
        expr: result.expr,
        color: DERIV_COLORS[idx % DERIV_COLORS.length],
        visible: true,
        range: fn.range,
        label: `f' = ${result.expr}`,
        isDerivative: true,
        derivativeOf: id,
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

  clearAll: () => set({ functions: [] }),
}))
