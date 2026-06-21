import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useFunctionStore } from '../../stores/functionStore'
import QuickStartCard from './QuickStartCard'

const QUICK_STARTS = [
  {
    expr: 'sin(x)',
    label: 'sineWave',
    labelZh: '正弦波 sin(x)',
    labelEn: 'Sine Wave sin(x)',
    icon: '🌊',
  },
  {
    expr: 'x^2',
    label: 'parabola',
    labelZh: '抛物线 x²',
    labelEn: 'Parabola x²',
    icon: '📈',
  },
  {
    expr: 'x^3 - 3*x',
    label: 'cubic',
    labelZh: '三次函数 x³−3x',
    labelEn: 'Cubic x³−3x',
    icon: '🎢',
  },
]

export default function EmptyStateGuide() {
  const { t, i18n } = useTranslation()
  const addFunction = useFunctionStore((s) => s.addFunction)
  const functions = useFunctionStore((s) => s.functions)
  const hasVisible = functions.some((f) => f.visible)
  const isZh = i18n.language?.startsWith('zh')

  if (hasVisible) return null

  const handleSelect = (expr) => {
    addFunction(expr)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        padding: '24px',
      }}
    >
      {/* Guidance text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: 'center', marginBottom: '8px' }}
      >
        <div
          style={{
            fontSize: 'clamp(15px, 2.5vw, 18px)',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {t('empty.guidance') || (isZh ? '在左侧输入一个函数表达式来开始' : 'Enter a function expression to begin')}
        </div>
        <div
          style={{
            fontSize: 'clamp(11px, 1.5vw, 12px)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            marginTop: '6px',
            marginBottom: '36px',
          }}
        >
          {t('empty.hint') || (isZh ? '试试: sin(x), x^2, 或者从下面的预设中选一个' : 'Try: sin(x), x^2, or pick a preset below')}
        </div>
      </motion.div>

      {/* Quick start preset cards */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          pointerEvents: 'auto',
          maxWidth: '540px',
        }}
      >
        {QUICK_STARTS.map((qs, i) => (
          <motion.div
            key={qs.expr}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 240, damping: 22 }}
          >
            <QuickStartCard
              expr={qs.expr}
              icon={qs.icon}
              label={isZh ? qs.labelZh : qs.labelEn}
              onSelect={handleSelect}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
