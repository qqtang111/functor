import { motion } from 'framer-motion'

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 1.5 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--bg-primary)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '24px',
        fontFamily: 'var(--font-heading)',
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -30, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        style={{ fontSize: '80px', color: 'var(--accent)',
          textShadow: '0 0 40px var(--accent-glow)', fontWeight: 200 }}
      >
        ∫
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        style={{ fontSize: '32px', fontWeight: 500, letterSpacing: '4px',
          color: 'var(--text-primary)' }}
      >
        FUNCTOR
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        style={{ fontSize: '14px', color: 'var(--text-muted)',
          letterSpacing: '2px', fontFamily: 'var(--font-sans)' }}
      >
        数学函数可视化
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 1.2, delay: 1.2 }}
        style={{ width: '4px', height: '4px', borderRadius: '50%',
          background: 'var(--accent)',
          boxShadow: '0 0 20px var(--accent-glow)' }}
      />
    </motion.div>
  )
}
