import { create } from 'zustand'
import i18n from '../i18n/index'

let initialized = false

export const useI18nStore = create((set) => ({
  lang: i18n.language || 'zh',

  setLang: (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('functor-lang', lang)
    set({ lang })
  },

  init: () => {
    if (initialized) return
    initialized = true
    const saved = localStorage.getItem('functor-lang')
    if (saved && (saved === 'zh' || saved === 'en') && saved !== i18n.language) {
      i18n.changeLanguage(saved)
      set({ lang: saved })
    }
  },
}))
