import { useEffect, useState, useRef } from 'react'
import { useThemeStore } from './stores/themeStore'
import { useI18nStore } from './stores/i18nStore'
import { useFunctionStore } from './stores/functionStore'
import { useViewStore } from './stores/viewStore'
import { decodeShareState, applyShareState } from './engine/ShareEncoder'
import SplashScreen from './components/ui/SplashScreen'
import Tutorial from './components/ui/Tutorial'
import TopBar from './components/layout/TopBar'
import Sidebar from './components/layout/Sidebar'
import CanvasArea from './components/layout/CanvasArea'
import CommandPalette from './components/layout/CommandPalette'
import './responsive.css'

function App() {
  const initTheme = useThemeStore((s) => s.init)
  const initI18n = useI18nStore((s) => s.init)
  const addFunction = useFunctionStore((s) => s.addFunction)
  const setMode = useViewStore((s) => s.setMode)
  const setZoom = useViewStore((s) => s.setZoom)
  const setOffset = useViewStore((s) => s.setOffset)
  const setParamValue = useFunctionStore((s) => s.setParamValue)
  const [showSplash, setShowSplash] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const hashApplied = useRef(false)

  useEffect(() => {
    initTheme()
    initI18n()
  }, [])

  // Apply shared state from URL hash (one-time)
  useEffect(() => {
    if (hashApplied.current) return
    const state = decodeShareState(window.location.hash)
    if (state && state.exprs && state.exprs.length > 0) {
      hashApplied.current = true
      // Delay to let splash finish rendering, then apply
      setTimeout(() => {
        applyShareState(state, addFunction, setMode, setZoom, setOffset, setParamValue)
        setShowSplash(false)
      }, 100)
    }
  }, [])

  const handleStart = () => {
    setShowSplash(false)
    // If we loaded from hash, skip tutorial
    if (hashApplied.current) return
    const done = localStorage.getItem('functor-tutorial-done')
    if (!done) setShowTutorial(true)
  }

  const toggleSidebar = () => setSidebarOpen((v) => !v)

  if (showSplash) return <SplashScreen onStart={handleStart} />

  return (
    <div className="app-root" style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-primary)', color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)', overflow: 'hidden',
    }}>
      <TopBar onToggleSidebar={toggleSidebar} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`}
          style={{
            display: 'flex', flexShrink: 0,
          }}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}
            style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.4)' }} />
        )}
        <CanvasArea onToggleSidebar={toggleSidebar} />
      </div>
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
      <CommandPalette />
    </div>
  )
}

export default App
