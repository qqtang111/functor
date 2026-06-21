import { motion } from 'framer-motion'

export default function QuickStartCard({ expr, label, icon, onSelect }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onSelect(expr)}
      className="quick-start-card"
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '18px 22px',
        cursor: 'pointer',
        textAlign: 'center',
        minWidth: '140px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
      }}
    >
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
      <div
        style={{
          fontSize: '12px',
          color: 'var(--text-primary)',
          fontWeight: 500,
          marginBottom: '4px',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '11px',
          color: 'var(--accent)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {expr}
      </div>
    </motion.div>
  )
}
