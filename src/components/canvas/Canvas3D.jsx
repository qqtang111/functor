import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useFunctionStore } from '../../stores/functionStore'
import { useViewStore } from '../../stores/viewStore'
import SurfaceMesh from './SurfaceMesh'
import ContourLines from './ContourLines'
import ColorLegend from './ColorLegend'

export default function Canvas3D() {
  const functions = useFunctionStore((s) => s.functions)
  const visible = functions.filter((f) => f.visible)
  const wireframe = useViewStore((s) => s.wireframe)
  const contours = useViewStore((s) => s.contours)

  // Phase 8: Parameter LOD — use 40 when params exist (conservative),
  // 80 (full res) when no parameters or sliders not shown
  const hasParams = visible.some((f) => f.parameters && Object.keys(f.parameters).length > 0)
  const lodRes = hasParams ? 40 : 80

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [8, 6, 8], fov: 45, near: 0.5, far: 100 }}
        style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 40%, rgba(99,102,241,0.08), transparent 60%)' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={0.8} />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} />

        <Grid
          position={[0, -6, 0]} args={[14, 14]}
          cellSize={1} cellThickness={0.4} cellColor="rgba(255,255,255,0.06)"
          sectionSize={5} sectionThickness={1} sectionColor="rgba(255,255,255,0.12)"
          fadeDistance={30} infiniteGrid
        />

        <axesHelper args={[7]} />

        {visible.map((f) => {
          // Phase 8: Build parameter substitution object
          const paramSubs = {}
          if (f.parameters) {
            for (const [k, v] of Object.entries(f.parameters)) paramSubs[k] = v.value
          }
          return (
            <group key={f.id}>
              <SurfaceMesh expr={f.expr} color={f.color} range={f.range} wireframe={wireframe}
                nx={lodRes} ny={lodRes} params={paramSubs} />
              {contours && <ContourLines expr={f.expr} range={f.range} params={paramSubs} />}
            </group>
          )
        })}

        <OrbitControls
          enableDamping dampingFactor={0.08}
          minDistance={4} maxDistance={30}
          target={[0, 0, 0]}
          touches={{ one: 3, two: 1 }}
        />
      </Canvas>

      {visible.length > 0 && <ColorLegend expr={visible[0].expr} range={visible[0].range} />}
    </div>
  )
}
