import { create } from 'zustand'

const THEMES = [
  { id: 'dark-premium', label: '暗黑高级', en: 'Dark Premium', color: '#6366f1' },
  { id: 'corporate-cyan', label: '极简科技', en: 'Corporate Cyan', color: '#06B6D4' },
  { id: 'geometric-modern', label: '几何未来', en: 'Geometric Modern', color: '#818CF8' },
  { id: 'scandinavian-light', label: '白昼学术', en: 'Scandinavian Light', color: '#2563EB' },
  { id: 'cyberpunk-neon', label: '赛博霓虹', en: 'Cyberpunk Neon', color: '#00FF88' },
]

function applyTheme(id) {
  document.body.className = document.body.className.replace(/theme-\S+/g, '').trim()
  document.body.classList.add(`theme-${id}`)
}

export const useThemeStore = create((set) => ({
  theme: THEMES[0], // Default: Dark Premium
  themes: THEMES,

  /** Custom accent color — overrides theme default */
  accent: '#2563EB',

  setTheme: (theme) => {
    applyTheme(theme.id)
    localStorage.setItem('functor-theme', theme.id)
    set({ theme })
  },

  setAccent: (color) => {
    document.documentElement.style.setProperty('--accent', color)
    document.documentElement.style.setProperty('--accent-glow', `${color}33`)
    localStorage.setItem('functor-accent', color)
    set({ accent: color })
  },

  init: () => {
    const saved = localStorage.getItem('functor-theme')
    const theme = THEMES.find(t => t.id === saved) || THEMES[3]
    applyTheme(theme.id)
    const acc = localStorage.getItem('functor-accent') || theme.color
    document.documentElement.style.setProperty('--accent', acc)
    document.documentElement.style.setProperty('--accent-glow', `${acc}33`)
    set({ theme, accent: acc })
  },
}))
