import { create } from 'zustand'

const THEMES = [
  { id: 'glass-dark', label: '暗色玻璃', color: '#6366f1' },
  { id: 'light-premium', label: '轻量高级', color: '#8b5cf6' },
  { id: 'cyber', label: '赛博网格', color: '#00ff88' },
  { id: 'minimal', label: '极简玻璃', color: '#c4b5fd' },
]

const FONT_SCHEMES = [
  { id: 'scheme-1', heading: '现代几何', sans: '系统无衬线', mono: '等宽代码' },
  { id: 'scheme-2', heading: '原生极简', sans: '系统无衬线', mono: '等宽代码' },
  { id: 'scheme-3', heading: '优雅衬线', sans: '系统无衬线', mono: '等宽代码' },
]

function applyTheme(id) {
  document.body.className = document.body.className.replace(/theme-\S+/g, '').trim()
  document.body.classList.add(`theme-${id}`)
}

function applyFontScheme(id) {
  document.body.className = document.body.className.replace(/font-scheme-\S+/g, '').trim()
  document.body.classList.add(`font-${id}`)
}

export const useThemeStore = create((set) => ({
  theme: THEMES[0],
  themes: THEMES,
  fontScheme: FONT_SCHEMES[0],
  fontSchemes: FONT_SCHEMES,
  /** Custom accent color — overrides theme default */
  accent: '#6366f1',
  /** Font size scale: 0.8 ~ 1.5, default 1 */
  fontSize: 1,

  setTheme: (theme) => {
    applyTheme(theme.id)
    localStorage.setItem('functor-theme', theme.id)
    set({ theme })
  },

  setFontScheme: (scheme) => {
    applyFontScheme(scheme.id)
    localStorage.setItem('functor-font', scheme.id)
    set({ fontScheme: scheme })
  },

  setAccent: (color) => {
    document.documentElement.style.setProperty('--accent', color)
    document.documentElement.style.setProperty('--accent-glow', `${color}33`)
    localStorage.setItem('functor-accent', color)
    set({ accent: color })
  },

  setFontSize: (scale) => {
    const s = Math.max(0.8, Math.min(1.5, scale))
    document.documentElement.style.setProperty('--font-scale', s)
    document.documentElement.style.fontSize = `${s * 16}px`
    localStorage.setItem('functor-font-size', s)
    set({ fontSize: s })
  },

  init: () => {
    const savedTheme = localStorage.getItem('functor-theme')
    const savedFont = localStorage.getItem('functor-font')
    const savedAccent = localStorage.getItem('functor-accent')
    const savedFontSize = parseFloat(localStorage.getItem('functor-font-size')) || 1
    const theme = THEMES.find(t => t.id === savedTheme) || THEMES[0]
    const font = FONT_SCHEMES.find(f => f.id === savedFont) || FONT_SCHEMES[0]
    applyTheme(theme.id)
    applyFontScheme(font.id)
    const accent = savedAccent || '#6366f1'
    document.documentElement.style.setProperty('--accent', accent)
    document.documentElement.style.setProperty('--accent-glow', `${accent}33`)
    document.documentElement.style.setProperty('--font-scale', savedFontSize)
    document.documentElement.style.fontSize = `${savedFontSize * 16}px`
    set({ theme, fontScheme: font, accent, fontSize: savedFontSize })
  },
}))
