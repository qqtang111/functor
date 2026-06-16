import { useEffect, useState } from 'react'
import { useThemeStore } from './stores/themeStore'
import { useI18nStore } from './stores/i18nStore'
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
  const [showSplash, setShowSplash] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => { initTheme(); initI18n() }, [])

  const handleStart = () => {
    setShowSplash(false)
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
