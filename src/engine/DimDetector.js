export function detectDimension(expr) {
  if (!expr || expr.trim() === '') return null
  const lower = expr.toLowerCase()
  if (lower.includes('y') || lower.includes('z')) return '3D'
  return '2D'
}
