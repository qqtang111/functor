import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

document.body.classList.add('theme-glass-dark', 'font-scheme-1')
// Always show body — don't wait for Google Fonts CDN (blocked in some regions)
document.body.classList.add('fonts-loaded')
document.fonts.ready.then(() => {
  document.body.classList.add('fonts-loaded')
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Clean up any existing SW in dev mode, register in production
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  } else {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()))
  }
}
