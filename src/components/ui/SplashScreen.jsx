import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function SplashScreen({ onStart }) {
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const tagRef = useRef(null)
  const btnRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(titleRef.current, { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 })
      .fromTo(tagRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
      .fromTo(btnRef.current, { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.1')
      .then(() => setReady(true))

    if (containerRef.current) {
      for (let i = 0; i < 16; i++) {
        const dot = document.createElement('div')
        const s = 2 + Math.random() * 4
        dot.style.cssText = `position:absolute;width:${s}px;height:${s}px;border-radius:50%;background:var(--accent);opacity:0;left:${Math.random()*100}%;top:${Math.random()*100}%`
        containerRef.current.appendChild(dot)
        gsap.to(dot, { opacity: 0.1 + Math.random() * 0.2, y: -30 - Math.random() * 50, duration: 2 + Math.random() * 3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: Math.random() * 2 })
      }
    }
  }, [])

  const handleStart = () => {
    if (!ready) return
    gsap.to(containerRef.current, { opacity: 0, scale: 1.05, duration: 0.5, ease: 'power3.in', onComplete: onStart })
  }

  return (
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 30%, rgba(99,102,241,0.15), transparent 60%), #0a0a1a', overflow: 'hidden' }}>
      <div ref={titleRef} style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ width: '80px', height: '80px', margin: '0 auto 20px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
          <span style={{ fontSize: '42px', color: '#fff' }}>ƒ</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '52px', fontWeight: 700, background: 'linear-gradient(135deg, var(--accent), #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, letterSpacing: '-2px' }}>FUNCTOR</h1>
      </div>
      <p ref={tagRef} style={{ color: 'var(--text-muted)', fontSize: '16px', margin: '0 0 48px', letterSpacing: '3px' }}>数学函数可视化 · 交互探索</p>
      <button ref={btnRef} onClick={handleStart}
        onMouseEnter={(e) => gsap.to(e.target, { scale: 1.05, boxShadow: '0 6px 30px rgba(99,102,241,0.5)', duration: 0.3 })}
        onMouseLeave={(e) => gsap.to(e.target, { scale: 1, boxShadow: '0 4px 20px rgba(99,102,241,0.3)', duration: 0.3 })}
        style={{ padding: '16px 48px', fontSize: '18px', fontWeight: 600, border: 'none', borderRadius: '14px', cursor: 'pointer', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', color: '#fff', fontFamily: 'var(--font-sans)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)', letterSpacing: '1px' }}>
        开始使用
      </button>
    </div>
  )
}
