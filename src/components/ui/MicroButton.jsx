import { motion } from 'framer-motion'

const springConfig = { stiffness: 400, damping: 17 }

export default function MicroButton({ children, onClick, active = false, title = '', style = {} }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={springConfig}
      onClick={onClick}
      title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: '4px', padding: '4px 12px',
        border: active ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
        borderRadius: '6px',
        background: active ? 'var(--accent-glow)' : 'var(--surface)',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-sans)',
        outline: 'none',
        ...style,
      }}
    >
      {children}
    </motion.button>
  )
}
