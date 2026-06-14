import { useTranslation } from 'react-i18next'
import { useFunctionStore } from '../../stores/functionStore'
import { useViewStore } from '../../stores/viewStore'
import { useThemeStore } from '../../stores/themeStore'
import MicroButton from '../ui/MicroButton'

const RANGE_PRESETS = [
  { label: '[-3,3]', range: [-3, 3] },
  { label: '[-5,5]', range: [-5, 5] },
  { label: '[-10,10]', range: [-10, 10] },
  { label: '[-20,20]', range: [-20, 20] },
]

export default function SettingsPanel() {
  const { t } = useTranslation()
  const functions = useFunctionStore((s) => s.functions)
  const updateRange = useFunctionStore((s) => s.updateRange)
  const updateColor = useFunctionStore((s) => s.updateColor)
  const grid = useViewStore((s) => s.grid)
  const axes = useViewStore((s) => s.axes)
  const motionActive = useViewStore((s) => s.motionActive)
  const motionSpeed = useViewStore((s) => s.motionSpeed)
  const toggleGrid = useViewStore((s) => s.toggleGrid)
  const toggleAxes = useViewStore((s) => s.toggleAxes)
  const toggleMotion = useViewStore((s) => s.toggleMotion)
  const setMotionSpeed = useViewStore((s) => s.setMotionSpeed)
  const accent = useThemeStore((s) => s.accent)
  const setAccent = useThemeStore((s) => s.setAccent)

  return (
    <div style={{ padding: '10px 14px', overflowY: 'auto', flex: 1 }}>
      {/* Custom theme color */}
      <Section title={t('settings.themeColor')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="color" value={accent}
            onChange={(e) => setAccent(e.target.value)}
            style={{
              width: '32px', height: '32px', border: 'none', borderRadius: '8px',
              cursor: 'pointer', background: 'transparent',
            }}
          />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{accent}</span>
        </div>
      </Section>

      {/* Font size */}
      <Section title={t('settings.fontSize')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('settings.small')}</span>
          <input type="range" min="0.8" max="1.5" step="0.02"
            value={useThemeStore((s) => s.fontSize)}
            onChange={(e) => useThemeStore.getState().setFontSize(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('settings.large')}</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '28px', textAlign: 'right' }}>
            {Math.round(useThemeStore((s) => s.fontSize) * 100)}%
          </span>
        </div>
      </Section>

      {/* Grid & axes toggles */}
      <Section title={t('settings.grid')}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <MicroButton active={grid} onClick={toggleGrid}>{t('settings.grid')}</MicroButton>
          <MicroButton active={axes} onClick={toggleAxes}>{t('settings.axes')}</MicroButton>
        </div>
      </Section>

      {/* Point motion */}
      <Section title={t('settings.motion')}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <MicroButton active={motionActive} onClick={toggleMotion}>
            {motionActive ? t('settings.motionPause') : t('settings.motionPlay')}
          </MicroButton>
          {motionActive && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('settings.motionSpeed')}</span>
              {[0.5, 1, 2, 3].map((s) => (
                <MicroButton key={s} active={motionSpeed === s} onClick={() => setMotionSpeed(s)}>
                  {s}x
                </MicroButton>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Per-function settings */}
      <Section title={t('settings.functions')}>
        {functions.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '8px 0' }}>
            {t('settings.noFunction')}
          </div>
        ) : (
          functions.map((f) => (
            <div key={f.id} style={{
              padding: '8px', marginBottom: '6px',
              border: '1px solid var(--border-subtle)', borderRadius: '6px',
              background: 'var(--surface)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color }} />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', flex: 1 }}>
                  {f.expr.length > 25 ? f.expr.slice(0, 25) + '…' : f.expr}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Range picker */}
                <div style={{ display: 'flex', gap: '2px' }}>
                  {RANGE_PRESETS.map((rp) => (
                    <button key={rp.label}
                      onClick={() => updateRange(f.id, rp.range)}
                      style={{
                        padding: '2px 6px', border: f.range[0] === rp.range[0] ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                        borderRadius: '4px', background: f.range[0] === rp.range[0] ? 'var(--accent-glow)' : 'transparent',
                        color: f.range[0] === rp.range[0] ? 'var(--accent)' : 'var(--text-muted)',
                        fontSize: '9px', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                      }}
                    >{rp.label}</button>
                  ))}
                </div>
                {/* Color picker */}
                <input type="color" value={f.color}
                  onChange={(e) => updateColor(f.id, e.target.value)}
                  style={{
                    width: '24px', height: '24px', border: '1px solid var(--border-subtle)',
                    borderRadius: '4px', cursor: 'pointer', padding: 0, background: 'transparent',
                  }}
                />
              </div>
            </div>
          ))
        )}
      </Section>

      {/* 3D Mode controls */}
      <Section title={t('settings.enhance3d')}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <MicroButton active={useViewStore((s) => s.wireframe)}
            onClick={useViewStore.getState().toggleWireframe}>{t('settings.wireframe')}</MicroButton>
          <MicroButton active={useViewStore((s) => s.contours)}
            onClick={useViewStore.getState().toggleContours}>{t('settings.contours')}</MicroButton>
          <MicroButton active={useViewStore((s) => s.paramAnim)}
            onClick={useViewStore.getState().toggleParamAnim}>{t('settings.paramAnim')}</MicroButton>
        </div>
        {useViewStore((s) => s.paramAnim) && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {t('settings.paramT')} = {useViewStore((s) => s.paramValue).toFixed(2)}
            </div>
            <input type="range" min="0" max="3" step="0.01"
              value={useViewStore((s) => s.paramValue)}
              onChange={(e) => useViewStore.getState().setParamValue(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>
        )}
      </Section>

      {/* Screenshot & Fullscreen */}
      <Section title={t('settings.export')}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <MicroButton onClick={useViewStore.getState().requestScreenshot}>{t('nav.screenshot')}</MicroButton>
          <MicroButton onClick={useViewStore.getState().toggleFullscreen}>{t('nav.fullscreen')}</MicroButton>
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{
        fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px',
        color: 'var(--text-muted)', marginBottom: '6px',
      }}>{title}</div>
      {children}
    </div>
  )
}
