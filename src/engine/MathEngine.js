import { create, all } from 'mathjs'
const math = create(all, {})

const DEFAULT_RANGE = [-5, 5]
const SAMPLES_2D = 600
const SAMPLES_3D = 80

export function sample2D(expr, range = DEFAULT_RANGE, samples = SAMPLES_2D) {
  const compiled = math.compile(expr)
  const [xMin, xMax] = range
  const step = (xMax - xMin) / samples
  const points = []
  for (let i = 0; i <= samples; i++) {
    const x = xMin + i * step
    try {
      const y = compiled.evaluate({ x })
      if (typeof y === 'number' && isFinite(y)) {
        points.push({ x, y })
      } else {
        points.push(null)
      }
    } catch {
      points.push(null)
    }
  }
  return points
}

/** Sample z = f(x, y) over a grid. Returns { positions: Float32Array, indices: Uint32Array, colors: Float32Array, nx, ny } */
export function sample3D(expr, range = DEFAULT_RANGE, nx = SAMPLES_3D, ny = SAMPLES_3D) {
  const compiled = math.compile(expr)
  const [lo, hi] = range
  const dx = (hi - lo) / (nx - 1)
  const dy = (hi - lo) / (ny - 1)

  const positions = new Float32Array(nx * ny * 3)
  const indices = []
  let zMin = Infinity, zMax = -Infinity

  const zVals = new Float32Array(nx * ny)
  for (let iy = 0; iy < ny; iy++) {
    const y = lo + iy * dy
    for (let ix = 0; ix < nx; ix++) {
      const x = lo + ix * dx
      const idx = iy * nx + ix
      try {
        const z = compiled.evaluate({ x, y })
        if (typeof z === 'number' && isFinite(z)) {
          zVals[idx] = z
          if (z < zMin) zMin = z
          if (z > zMax) zMax = z
        } else {
          zVals[idx] = 0
        }
      } catch {
        zVals[idx] = 0
      }
      positions[idx * 3] = x
      positions[idx * 3 + 1] = zVals[idx]
      positions[idx * 3 + 2] = y
    }
  }

  for (let iy = 0; iy < ny - 1; iy++) {
    for (let ix = 0; ix < nx - 1; ix++) {
      const a = iy * nx + ix
      const b = a + 1
      const c = a + nx
      const d = c + 1
      indices.push(a, b, d)
      indices.push(a, d, c)
    }
  }

  const colors = new Float32Array(nx * ny * 3)
  const zSpan = zMax - zMin || 1
  for (let i = 0; i < nx * ny; i++) {
    const t = (zVals[i] - zMin) / zSpan
    const [r, g, b] = heatColor(t)
    colors[i * 3] = r
    colors[i * 3 + 1] = g
    colors[i * 3 + 2] = b
  }

  return { positions, indices: new Uint32Array(indices), colors, nx, ny, zMin, zMax }
}

function heatColor(t) {
  if (t < 0.25) { const s = t / 0.25; return [0, s, 1] }
  else if (t < 0.5) { const s = (t - 0.25) / 0.25; return [0, 1, 1 - s] }
  else if (t < 0.75) { const s = (t - 0.5) / 0.25; return [s, 1, 0] }
  else { const s = (t - 0.75) / 0.25; return [1, 1 - s, 0] }
}

/** Compute symbolic derivative df/dx. Returns { expr: string, compiled } or null */
export function computeDerivative(expr) {
  try {
    const node = math.parse(expr)
    const deriv = math.derivative(node, 'x')
    const derivExpr = deriv.toString()
    const compiled = math.compile(derivExpr)
    // Validate by evaluating at x=1
    compiled.evaluate({ x: 1 })
    return { expr: derivExpr, compiled }
  } catch {
    return null
  }
}

export function validateExpression(expr) {
  try {
    math.compile(expr)
    return { valid: true }
  } catch (e) {
    return { valid: false, error: e.message }
  }
}
