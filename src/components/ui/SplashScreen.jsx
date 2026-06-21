import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import SplashCanvas from './SplashCanvas'

const CARDS = [
  {
    icon: '📐',
    titleZh: '2D/3D 绘图',
    titleEn: '2D/3D Plotting',
    descZh: '实时渲染函数曲线与曲面，拖拽旋转缩放',
    descEn: 'Real-time curves & surfaces with drag, rotate & zoom',
    color: '#6366f1',
  },
  {
    icon: '🎛️',
    titleZh: '参数调节',
    titleEn: 'Param Sliders',
    descZh: '滑块实时调参，直观理解参数对函数的影响',
    descEn: 'Tune parameters with sliders, see instant visual feedback',
    color: '#fbbf24',
  },
  {
    icon: '⚡',
    titleZh: '一键分享',
    titleEn: 'One-tap Share',
    descZh: '导出高清图片或链接，分享你的数学发现',
    descEn: 'Export images or share links of your discoveries',
    color: '#22c55e',
  },
]

export default function SplashScreen({ onStart }) {
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const tagRef = useRef(null)
  const cardsRef = useRef(null)
  const btnRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Title: scale up with blur-in
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 40, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 }
    )
    // Tagline
    tl.fromTo(
      tagRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.3'
    )
    // Cards stagger in
    if (cardsRef.current) {
      const cardEls = cardsRef.current.children
      tl.fromTo(
        cardEls,
        { opacity: 0, y: 30, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: 'back.out(1.4)',
        },
        '-=0.1'
      )
    }
    // CTA button
    tl.fromTo(
      btnRef.current,
      { opacity: 0, y: 20, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.7)',
      },
      '-=0.1'
    )
    tl.then(() => setReady(true))

    // Ambient floating particles
    if (containerRef.current) {
      for (let i = 0; i < 20; i++) {
        const dot = document.createElement('div')
        const s = 2 + Math.random() * 4
        dot.style.cssText = `position:absolute;width:${s}px;height:${s}px;border-radius:50%;background:var(--accent);opacity:0;left:${
          Math.random() * 100
        }%;top:${Math.random() * 100}%`
        containerRef.current.appendChild(dot)
        gsap.to(dot, {
          opacity: 0.08 + Math.random() * 0.15,
          y: -30 - Math.random() * 60,
          duration: 2 + Math.random() * 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: Math.random() * 2,
        })
      }
    }
  }, [])

  const handleStart = () => {
    if (!ready) return
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 1.05,
      duration: 0.5,
      ease: 'power3.in',
      onComplete: onStart,
    })
  }

  // Detect locale for card text
  const isZh = navigator.language?.startsWith('zh') ?? true

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at 50% 30%, rgba(99,102,241,0.15), transparent 60%), #0a0a1a',
        overflow: 'hidden',
        padding: '24px',
      }}
    >
      {/* Animated function curve background */}
      <SplashCanvas />

      {/* Logo + Title */}
      <div
        ref={titleRef}
        style={{ textAlign: 'center', marginBottom: '12px', zIndex: 1 }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}
        >
          <span style={{ fontSize: '42px', color: '#fff' }}>ƒ</span>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(36px, 6vw, 52px)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--accent), #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            letterSpacing: '-2px',
          }}
        >
          FUNCTOR
        </h1>
      </div>

      <p
        ref={tagRef}
        style={{
          color: 'var(--text-muted)',
          fontSize: 'clamp(13px, 2vw, 16px)',
          margin: '0 0 40px',
          letterSpacing: '3px',
          zIndex: 1,
        }}
      >
        {isZh ? '数学函数可视化 · 交互探索' : 'Math Visualization · Interactive Exploration'}
      </p>

      {/* Three-column feature cards */}
      <div
        ref={cardsRef}
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '40px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '780px',
          zIndex: 1,
        }}
      >
        {CARDS.map((card, i) => (
          <div
            key={i}
            className="splash-card"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              padding: '22px 24px',
              width: '220px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              cursor: 'default',
              transition: 'border-color 0.3s, transform 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = card.color + '66'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>
              {card.icon}
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.88)',
                marginBottom: '6px',
              }}
            >
              {isZh ? card.titleZh : card.titleEn}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.5,
              }}
            >
              {isZh ? card.descZh : card.descEn}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        ref={btnRef}
        onClick={handleStart}
        onMouseEnter={(e) =>
          gsap.to(e.target, {
            scale: 1.05,
            boxShadow: '0 6px 30px rgba(99,102,241,0.5)',
            duration: 0.3,
          })
        }
        onMouseLeave={(e) =>
          gsap.to(e.target, {
            scale: 1,
            boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            duration: 0.3,
          })
        }
        style={{
          padding: '16px 48px',
          fontSize: '18px',
          fontWeight: 600,
          border: 'none',
          borderRadius: '14px',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
          color: '#fff',
          fontFamily: 'var(--font-sans)',
          boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
          letterSpacing: '1px',
          zIndex: 1,
        }}
      >
        {isZh ? '开始使用' : 'Get Started'}
      </button>
    </div>
  )
}
