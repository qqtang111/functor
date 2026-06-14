import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { create, all } from 'mathjs'

const math = create(all, {})

/** Project contour rings onto XZ base plane */
export default function ContourLines({ expr, range = [-5, 5], levels = 8, yBase = -6 }) {
  const contourGroups = useMemo(() => {
    const compiled = math.compile(expr)
    const [lo, hi] = range
    const N = 100
    const dx = (hi - lo) / N

    // Sample z across the grid
    const grid = []
    let zMin = Infinity, zMax = -Infinity
    for (let iy = 0; iy <= N; iy++) {
      const row = []
      const y = lo + iy * dx
      for (let ix = 0; ix <= N; ix++) {
        const x = lo + ix * dx
        try {
          const z = compiled.evaluate({ x, y })
          if (typeof z === 'number' && isFinite(z)) {
            row.push(z)
            if (z < zMin) zMin = z
            if (z > zMax) zMax = z
          } else {
            row.push(null)
          }
        } catch { row.push(null) }
      }
      grid.push(row)
    }

    const span = zMax - zMin || 1
    const step = span / (levels + 1)

    const allLines = []
    for (let lvl = 1; lvl <= levels; lvl++) {
      const target = zMin + lvl * step
      const segments = []
      // March through the grid and find crossings
      for (let iy = 0; iy < N; iy++) {
        for (let ix = 0; ix < N; ix++) {
          const z00 = grid[iy]?.[ix], z10 = grid[iy]?.[ix + 1]
          const z01 = grid[iy + 1]?.[ix], z11 = grid[iy + 1]?.[ix + 1]
          if (z00 == null || z10 == null || z01 == null || z11 == null) continue

          const y0 = lo + iy * dx, y1 = y0 + dx
          const x0 = lo + ix * dx, x1 = x0 + dx

          // Find all edge crossings
          const pts = []
          if ((z00 - target) * (z10 - target) <= 0) {
            const t = absFrac(z00, z10, target)
            pts.push([x0 + t * dx, yBase, y0])
          }
          if ((z10 - target) * (z11 - target) <= 0) {
            const t = absFrac(z10, z11, target)
            pts.push([x1, yBase, y0 + t * dx])
          }
          if ((z11 - target) * (z01 - target) <= 0) {
            const t = absFrac(z11, z01, target)
            pts.push([x1 - t * dx, yBase, y1])
          }
          if ((z01 - target) * (z00 - target) <= 0) {
            const t = absFrac(z01, z00, target)
            pts.push([x0, yBase, y1 - t * dx])
          }
          if (pts.length === 2) {
            segments.push([pts[0], pts[1]])
          }
        }
      }
      if (segments.length > 0) allLines.push(segments)
    }
    return allLines
  }, [expr, range[0], range[1], levels, yBase])

  if (contourGroups.length === 0) return null

  return (
    <>
      {contourGroups.flatMap((segs, gi) =>
        segs.map(([a, b], si) => (
          <Line key={`c${gi}-${si}`}
            points={[a, b]}
            color="rgba(255,255,255,0.2)"
            lineWidth={0.5}
            transparent opacity={0.6}
          />
        ))
      )}
    </>
  )
}

function absFrac(a, b, t) {
  const d = Math.abs(a - b) || 0.0001
  return Math.abs(a - t) / d
}
