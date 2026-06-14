import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const EMOJIS = ['∫', '✏️', '📚', '🚀']

export default function Tutorial({ onComplete }) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)

  const handleDone = () => {
    localStorage.setItem('functor-tutorial-done', '1')
    onComplete()
  }

  const next = () => {
    if (step < 3) setStep(step + 1)
    else handleDone()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <motion.div
        key={step}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)',
          borderRadius: '18px', padding: '32px', maxWidth: '420px', width: '90%',
          textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{ fontSize: '52px', color: 'var(--accent)', textShadow: '0 0 30px var(--accent-glow)' }}
        >{EMOJIS[step]}</motion.div>
        <h2 style={{ margin: '16px 0 8px', fontFamily: 'var(--font-heading)', fontSize: '20px', color: 'var(--text-primary)' }}>
          {t(`tutorial.step${step + 1}.title`)}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>
          {t(`tutorial.step${step + 1}.body`)}
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ width: i === step ? '20px' : '6px', height: '6px', borderRadius: '3px',
              background: i === step ? 'var(--accent)' : 'var(--border-medium)', transition: 'all 0.3s' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button onClick={handleDone}
            style={{ padding: '8px 16px', border: '1px solid var(--border-subtle)', borderRadius: '8px',
              background: 'transparent', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}>{t('tutorial.skip')}</button>
          <button onClick={next}
            style={{ padding: '8px 24px', border: 'none', borderRadius: '8px', background: 'var(--accent)',
              color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
            {step < 3 ? t('tutorial.next') : t('tutorial.start')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
