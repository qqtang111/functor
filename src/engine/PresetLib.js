/**
 * PresetLib — 内置预设函数库 (27+ presets)
 *
 * Types:
 * - "2D"    : standard y = f(x)
 * - "3D"    : z = f(x, y)
 * - "parametric" : x(t), y(t) 参数方程
 * - "derivative" : f(x) + f'(x) 导数演示
 */

export const PRESET_CATEGORIES = [
  {
    key: 'elementary',
    name: '初等函数',
    nameEn: 'Elementary',
    icon: '📐',
    presets: [
      { name: '一次函数', nameEn: 'Linear', expr: 'k*x+b', params: { k: 2, b: 1 }, display: 'y = kx + b', dim: '2D', tags: ['线性', '基础', '滑块'] },
      { name: '二次函数', nameEn: 'Quadratic', expr: 'a*x^2 + b*x + c', params: { a: 1, b: 0, c: 0 }, display: 'y = ax² + bx + c', dim: '2D', tags: ['抛物线', '基础', '滑块'] },
      { name: '三次函数', nameEn: 'Cubic', expr: 'x^3', params: {}, display: 'y = x³', dim: '2D', tags: ['基础'] },
      { name: '反比例', nameEn: 'Reciprocal', expr: 'k/x', params: { k: 1 }, display: 'y = k/x', dim: '2D', tags: ['双曲线', '基础', '滑块'] },
      { name: '平方根', nameEn: 'Square Root', expr: 'sqrt(x)', params: {}, display: 'y = √x', dim: '2D', tags: ['基础'] },
      { name: '指数函数', nameEn: 'Exponential', expr: 'e^x', params: {}, display: 'y = eˣ', dim: '2D', tags: ['自然常数', '增长'] },
      { name: '自然对数', nameEn: 'Natural Log', expr: 'ln(x)', params: {}, display: 'y = ln(x)', dim: '2D', tags: ['对数'] },
      { name: '绝对值', nameEn: 'Absolute', expr: 'abs(x)', params: {}, display: 'y = |x|', dim: '2D', tags: ['V形'] },
      { name: 'Sigmoid', nameEn: 'Sigmoid', expr: '1/(1+e^(-x))', params: {}, display: 'y = σ(x)', dim: '2D', tags: ['AI', '激活'] },
    ],
  },
  {
    key: 'trigonometry',
    name: '三角函数',
    nameEn: 'Trigonometry',
    icon: '🌊',
    presets: [
      { name: '正弦', nameEn: 'Sine', expr: 'sin(x)', params: {}, display: 'y = sin(x)', dim: '2D', tags: ['周期'] },
      { name: '正弦波 滑块', nameEn: 'Sine Wave (Sliders)', expr: 'A*sin(omega*x + phi)', params: { A: 2, omega: 2, phi: 0 }, display: 'y = A·sin(ωx + φ)', dim: '2D', tags: ['周期', '滑块'] },
      { name: '余弦', nameEn: 'Cosine', expr: 'cos(x)', params: {}, display: 'y = cos(x)', dim: '2D', tags: ['周期'] },
      { name: '正切', nameEn: 'Tangent', expr: 'tan(x)', params: {}, display: 'y = tan(x)', dim: '2D', tags: ['渐近线'] },
      { name: '余切', nameEn: 'Cotangent', expr: 'cot(x)', params: {}, display: 'y = cot(x)', dim: '2D', tags: ['渐近线'] },
      { name: '正割', nameEn: 'Secant', expr: 'sec(x)', params: {}, display: 'y = sec(x)', dim: '2D', tags: [] },
      { name: '余割', nameEn: 'Cosecant', expr: 'csc(x)', params: {}, display: 'y = csc(x)', dim: '2D', tags: [] },
      { name: '反正弦', nameEn: 'Arcsin', expr: 'arcsin(x)', params: {}, display: 'y = arcsin(x)', dim: '2D', tags: ['反三角'] },
      { name: '反正切', nameEn: 'Arctan', expr: 'arctan(x)', params: {}, display: 'y = arctan(x)', dim: '2D', tags: ['反三角'] },
    ],
  },
  {
    key: 'derivative',
    name: '导数演示',
    nameEn: 'Derivatives',
    icon: '📈',
    presets: [
      {
        name: 'x² → 2x', nameEn: 'x² → 2x',
        type: 'derivative',
        functions: [
          { expr: 'x^2', label: 'f(x) = x²' },
          { expr: '2*x', label: "f'(x) = 2x" },
        ],
        display: 'f(x)=x² → f\'(x)=2x',
        tags: ['幂函数'],
      },
      {
        name: 'sin(x) → cos(x)', nameEn: 'sin → cos',
        type: 'derivative',
        functions: [
          { expr: 'sin(x)', label: 'f(x) = sin(x)' },
          { expr: 'cos(x)', label: "f'(x) = cos(x)" },
        ],
        display: 'f(x)=sin(x) → f\'(x)=cos(x)',
        tags: ['三角'],
      },
      {
        name: 'x³ → 3x²', nameEn: 'x³ → 3x²',
        type: 'derivative',
        functions: [
          { expr: 'x^3', label: 'f(x) = x³' },
          { expr: '3*x^2', label: "f'(x) = 3x²" },
        ],
        display: 'f(x)=x³ → f\'(x)=3x²',
        tags: ['幂函数'],
      },
      {
        name: 'eˣ → eˣ', nameEn: 'eˣ → eˣ',
        type: 'derivative',
        functions: [
          { expr: 'e^x', label: 'f(x) = eˣ' },
          { expr: 'e^x', label: "f'(x) = eˣ" },
        ],
        display: 'f(x)=eˣ → f\'(x)=eˣ',
        tags: ['指数'],
      },
    ],
  },
  {
    key: 'parametric',
    name: '参数方程',
    nameEn: 'Parametric',
    icon: '🔮',
    presets: [
      {
        name: '圆', nameEn: 'Circle',
        type: 'parametric',
        xt: 'cos(t)', yt: 'sin(t)',
        tRange: [0, 6.283],
        display: 'x=cos(t), y=sin(t)',
        tags: ['几何'],
      },
      {
        name: '椭圆', nameEn: 'Ellipse',
        type: 'parametric',
        xt: '2*cos(t)', yt: 'sin(t)',
        tRange: [0, 6.283],
        display: 'x=2cos(t), y=sin(t)',
        tags: ['几何'],
      },
      {
        name: '摆线', nameEn: 'Cycloid',
        type: 'parametric',
        xt: 't-sin(t)', yt: '1-cos(t)',
        tRange: [0, 18.85],
        display: '摆线轨迹',
        tags: ['物理'],
      },
      {
        name: 'Lissajous', nameEn: 'Lissajous',
        type: 'parametric',
        xt: 'sin(3*t)', yt: 'cos(2*t)',
        tRange: [0, 6.283],
        display: 'x=sin(3t), y=cos(2t)',
        tags: ['图形'],
      },
    ],
  },
  {
    key: 'advanced',
    name: '高数曲面',
    nameEn: '3D Surfaces',
    icon: '🌍',
    presets: [
      { name: '波纹曲面', nameEn: 'Ripple', expr: 'sin(x)*cos(y)', params: {}, display: 'z = sin(x)cos(y)', dim: '3D', tags: ['3D', '波动'] },
      { name: '抛物面', nameEn: 'Paraboloid', expr: 'x^2+y^2', params: {}, display: 'z = x²+y²', dim: '3D', tags: ['3D', '碗形'] },
      { name: '涟漪', nameEn: 'Ripple Wave', expr: 'sin(sqrt(x^2+y^2))', params: {}, display: 'z = sin(√(x²+y²))', dim: '3D', tags: ['3D', '同心'] },
      { name: '马鞍面', nameEn: 'Saddle', expr: 'x^2-y^2', params: {}, display: 'z = x²-y²', dim: '3D', tags: ['3D', '鞍点'] },
      { name: '余弦网格', nameEn: 'Cosine Grid', expr: 'cos(x)*cos(y)', params: {}, display: 'z = cos(x)cos(y)', dim: '3D', tags: ['3D', '网格'] },
      { name: '高斯曲面', nameEn: 'Gaussian', expr: 'exp(-(x^2+y^2))', params: {}, display: 'z = e^{-(x²+y²)}', dim: '3D', tags: ['3D', '钟形'] },
      { name: '动态曲面', nameEn: 'Dynamic Surface', expr: 'a*sin(x) + b*cos(y)', params: { a: 1, b: 1 }, display: 'z = a sin(x) + b cos(y)', dim: '3D', tags: ['3D', '滑块'] },
    ],
  },
  {
    key: 'sequences',
    name: '数列与级数',
    nameEn: 'Sequences & Series',
    icon: '🔢',
    presets: [
      { name: '等差: 通项', nameEn: 'Arithmetic Seq', expr: 'a1 + (n-1)*d', params: { a1: 1, d: 2 }, display: 'aₙ = a₁ + (n-1)d', mode: 'sequence', tags: ['等差', '基础'] },
      { name: '等比: 通项', nameEn: 'Geometric Seq', expr: 'a1 * r^(n-1)', params: { a1: 1, r: 0.5 }, display: 'aₙ = a₁ rⁿ⁻¹', mode: 'sequence', tags: ['等比', '基础'] },
      { name: '调和级数', nameEn: 'Harmonic', expr: '1/n', params: {}, display: 'aₙ = 1/n', mode: 'sequence', tags: ['发散', '经典'] },
      { name: 'p-级数', nameEn: 'p-Series', expr: '1/n^p', params: { p: 2 }, display: 'aₙ = 1/nᵖ', mode: 'sequence', tags: ['收敛', '滑块'] },
      { name: 'Basel 问题', nameEn: 'Basel Problem', expr: '1/n^2', params: {}, display: 'Sₙ = Σ 1/k²', mode: 'partialSum', tags: ['收敛', 'π²/6'] },
      { name: '几何级数', nameEn: 'Geometric Series', expr: 'sum(r^(k-1))', params: { r: 0.5 }, display: 'Sₙ = Σ rᵏ⁻¹', mode: 'partialSum', tags: ['收敛', '滑块'] },
      { name: '交错调和', nameEn: 'Alternating Harmonic', expr: '(-1)^(n+1)/n', params: {}, display: 'aₙ = (-1)ⁿ⁺¹/n', mode: 'sequence', tags: ['条件收敛'] },
      { name: '交错 p-级数', nameEn: 'Alt. p-Series', expr: '(-1)^(n+1)/n^p', params: { p: 1 }, display: 'aₙ = (-1)ⁿ⁺¹/nᵖ', mode: 'sequence', tags: ['条件收敛', '滑块'] },
      { name: '阶乘倒数', nameEn: 'Factorial Reciprocal', expr: '1/factorial(n)', params: {}, display: 'aₙ = 1/n!', mode: 'sequence', tags: ['收敛'] },
      { name: '2ⁿ 分母', nameEn: 'Power of Two', expr: '1/2^n', params: {}, display: 'Sₙ = Σ 1/2ᵏ', mode: 'partialSum', tags: ['收敛'] },
      { name: '部分和演示', nameEn: 'Partial Sum Demo', expr: '1/n', params: {}, display: 'Sₙ 调和级数', mode: 'partialSum', tags: ['发散'] },
      { name: '自定义 p-级数', nameEn: 'Custom p-Series Sum', expr: 'sum(1/k^p)', params: { p: 2 }, display: 'Sₙ = Σ 1/kᵖ', mode: 'partialSum', tags: ['收敛', '滑块'] },
    ],
  },
]

/** Flatten all presets for search */
export function getAllPresets() {
  const all = []
  for (const cat of PRESET_CATEGORIES) {
    for (const p of cat.presets) {
      all.push({ ...p, category: cat.name, categoryEn: cat.nameEn, categoryKey: cat.key, categoryIcon: cat.icon })
    }
  }
  return all
}

/** Search presets by query — fuzzy, includes expr, 1-char threshold */
export function searchPresets(query) {
  if (!query || query.trim().length < 1) return []
  const q = query.toLowerCase().trim()
  const results = []
  for (const cat of PRESET_CATEGORIES) {
    for (const p of cat.presets) {
      // Build full search text including expressions
      let exprText = ''
      if (p.expr) exprText = p.expr
      else if (p.functions) exprText = p.functions.map((f) => f.expr).join(' ')
      else if (p.xt) exprText = `${p.xt} ${p.yt}`
      const text = `${p.name} ${p.nameEn} ${p.display} ${exprText} ${(p.tags || []).join(' ')} ${cat.name} ${cat.nameEn}`.toLowerCase()
      if (text.includes(q)) {
        results.push({ ...p, category: cat.name, categoryEn: cat.nameEn, categoryKey: cat.key, categoryIcon: cat.icon })
      }
    }
  }
  return results
}
