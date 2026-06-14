import { useMemo } from 'react'
import { sample3D } from '../../engine/MathEngine'

export default function ColorLegend({ expr, range = [-5, 5] }) {
  const { zMin, zMax } = useMemo(() => sample3D(expr, range, 30, 30), [expr, range[0], range[1]])

  const steps = 20
  const bars = useMemo(() => {
    const span = zMax - zMin || 1
    const result = []
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const z = zMin + t * span
      result.push({ z: z.toFixed(2), t })
    }
    return result
  }, [zMin, zMax])

  return (
    <div style={{
      position: 'absolute', bottom: '24px', right: '16px',
      background: 'rgba(10,10,30,0.85)', borderRadius: '10px',
      border: '1px solid var(--border-subtle)', padding: '12px 8px',
      fontFamily: 'var(--font-mono)', fontSize: '9px',
      color: 'var(--text-muted)', zIndex: 10,
      display: 'flex', gap: '6px', alignItems: 'stretch',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right' }}>
        <span>{zMax.toFixed(1)}</span>
        <span>{((zMax + zMin) / 2).toFixed(1)}</span>
        <span>{zMin.toFixed(1)}</span>
      </div>
      <div style={{ width: '12px', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {bars.map((b) => (
          <div key={b.z} style={{ flex: 1, background: heatCSS(b.t) }} />
        ))}
      </div>
    </div>
  )
}

function heatCSS(t) {
  if (t < 0.25) { const s = t / 0.25; return `rgb(0,${Math.round(s*255)},255)` }
  else if (t < 0.5) { const s = (t - 0.25) / 0.25; return `rgb(0,255,${Math.round((1-s)*255)})` }
  else if (t < 0.75) { const s = (t - 0.5) / 0.25; return `rgb(${Math.round(s*255)},255,0)` }
  else { const s = (t - 0.75) / 0.25; return `rgb(255,${Math.round((1-s)*255)},0)` }
}
