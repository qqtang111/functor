# 🔬 FUNCTOR — 设计规格文档

> **版本**: v1.0 | **日期**: 2026-06-14 | **状态**: 设计已确认，待实施
> **关联文档**: [[project.md]]

---

## 一、产品定义

**Functor** 是一个 Web 端数学函数可视化工具，支持 2D 曲线与 3D 曲面实时渲染。暗色玻璃科技风，中英双语，覆盖初等函数到高等数学。用户输入任意表达式，系统自动识别维度并渲染，每条曲线"绘制式"入场，每个操作有弹簧动效反馈。

### 核心差异点

| Desmos | Functor |
|--------|---------|
| 功能型，教育工具 | 体验型，科技感工具 |
| 静态 UI | 毛玻璃 + 霓虹光 + 动效 |
| 字体普通 | Space Grotesk + Inter + JetBrains Mono |
| 无主题 | 4 套主题一键切换 |
| 公式入场即出现 | 曲线"手写式"绘制动画 |
| 3D 简单 | 晶体生长 + 等高线 + 梯度 + 截面 |

---

## 二、技术架构

```
vibe/
├── spec.md                    ← 本文件
├── project.md                 ← 项目文档(开发进度)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── public/
│   └── fonts/                 ← 自托管字体
├── src/
│   ├── main.jsx               ← 入口
│   ├── App.jsx                ← 根组件
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.jsx     ← 顶栏: Logo, 主题, 语言
│   │   │   ├── Sidebar.jsx    ← 侧边栏容器
│   │   │   ├── CanvasArea.jsx ← 画布容器(路由2D/3D)
│   │   │   └── CommandPalette.jsx ← Ctrl+K 搜索
│   │   ├── panels/
│   │   │   ├── FunctionInput.jsx   ← 函数输入区
│   │   │   ├── PresetBrowser.jsx   ← 预设分类浏览
│   │   │   ├── SearchBar.jsx       ← 搜索框
│   │   │   └── SettingsPanel.jsx   ← 范围/颜色/网格设置
│   │   ├── canvas/
│   │   │   ├── Canvas2D.jsx        ← 2D Canvas 渲染
│   │   │   ├── Canvas3D.jsx        ← 3D Three.js 渲染
│   │   │   ├── PointMotion.jsx     ← 点运动动画
│   │   │   ├── CurveAnimation.jsx  ← 曲线绘制动画
│   │   │   └── ContourOverlay.jsx  ← 等高线叠加
│   │   └── ui/
│   │       ├── ThemeSwitcher.jsx   ← 主题切换器
│   │       ├── LanguageToggle.jsx  ← 语言切换
│   │       ├── ModeSwitch.jsx      ← 2D/3D 切换
│   │       ├── SplashScreen.jsx    ← 品牌开场动画
│   │       └── MicroButton.jsx     ← 通用弹簧按钮
│   ├── engine/
│   │   ├── MathEngine.js           ← 表达式解析 + 采样
│   │   ├── DimDetector.js          ← 自动识别维度
│   │   └── PresetLib.js            ← 预设函数库
│   ├── stores/
│   │   ├── functionStore.js        ← Zustand: 函数列表
│   │   ├── viewStore.js            ← Zustand: 2D/3D/视角
│   │   ├── themeStore.js           ← Zustand: 主题
│   │   └── i18nStore.js            ← Zustand: 语言
│   ├── i18n/
│   │   ├── index.js               ← i18next 配置
│   │   ├── locales/
│   │   │   ├── zh.json            ← 中文翻译
│   │   │   └── en.json            ← 英文翻译
│   └── styles/
│       ├── globals.css             ← 全局 + CSS 变量
│       └── themes.css              ← 四套主题变量
└── __tests__/                      ← 测试(按 Phase 逐步加)
```

### 技术选型清单

| 层 | 技术 | 用途 |
|----|------|------|
| 构建 | Vite | 开发服务器 + 打包 |
| UI 框架 | React 19 | 组件化 |
| 样式 | Tailwind CSS 4 | 原子化 |
| 动画 | Framer Motion 12 | 弹簧物理 |
| 状态 | Zustand 5 | 轻量管理 |
| 数学 | mathjs 14 | 解析/求值/导数 |
| 2D | Canvas API (原生) | 曲线绘制 |
| 3D | Three.js + @react-three/fiber + drei | WebGL |
| i18n | i18next + react-i18next | 双语 |
| 字体 | Space Grotesk + Inter + JetBrains Mono | 默认 |
| 字体备选 | Geist + Playfair Display + Fira Code | 切换 |

---

## 三、UI 布局

```
┌─────────────────────────────────────────────────┐
│ 📐 FUNCTOR                    🌙◉○○  🌐 CN    │  TopBar 48px
├────────────────┬────────────────────────────────┤
│                │  [2D] [3D]    🔲 📷 ⛶         │  Toolbar 36px
│  🔍 搜索...   │                                │
│  Ctrl+K       │                                │
│                │                                │
│ ┌──────────┐  │       绘图画布区域               │
│ │ f(x)=sin │2D│                                │
│ └──────────┘  │     (2D 曲线 / 3D 曲面)          │
│ ┌──────────┐  │                                │
│ │ g(x)=x²  │2D│                                │
│ └──────────┘  │                                │
│ + 添加函数     │                                │
│                │                                │
│ 📚预设 | ⚙️设置│                                │
│                │     x: 1.57  y: 1.00           │
│ ▶ 初等函数 (5) │                                │
│   y = kx + b  │                                │
│   y = k/x     │                                │
│ ▶ 三角函数 (6) │                                │
│ ▶ 导数演示 (3) │                                │
│ ▶ 参数方程 (4) │  x ∈ [-5, 5]    f(x) = sin(x)  │  Status 24px
│ ▶ 高数曲面 (6) │                                │
└────────────────┴────────────────────────────────┘
    320px                           flex-1
```

---

## 四、主题系统

### 默认: 暗色玻璃 (CSS 变量驱动)

| Token | 值 | 用途 |
|-------|-----|------|
| `--bg-primary` | `#0a0a1a` | 主背景 |
| `--bg-glass` | `rgba(15,15,40,0.6)` | 毛玻璃面板 |
| `--accent` | `#6366f1` | 主强调色 |
| `--accent-glow` | `rgba(99,102,241,0.3)` | 发光 |
| `--text-primary` | `rgba(255,255,255,0.85)` | 主文字 |

### 四套主题

| # | 名称 | 主色 | 背景基调 |
|---|------|------|----------|
| 1 | 暗色玻璃 | `#6366f1` 靛紫 | `#0a0a1a` 深黑紫 |
| 2 | 轻量高级 | `#8b5cf6` 紫罗兰 | `#f8faff` 淡白 |
| 3 | 赛博网格 | `#00ff88` 矩阵绿 | `#0a0a0a` 纯黑 |
| 4 | 极简玻璃 | `#c4b5fd` 柔紫 | `#0c0c1d` 深藏青 |

切换方式: `<body>` class 替换 + CSS 变量过渡，0.3s。

**用户自定义主题色** (P3 实现)：
- 设置面板提供取色器：主色、背景色 可自由修改
- 支持预设白/黑/灰等纯色底，也可输入 hex 色值
- 自定义配色保存在 localStorage，刷新不丢失
- 覆盖四套主题的基础色，同时保留动效和玻璃质感

---

## 五、字体系统

### 默认 (Scheme 1)

| 角色 | 字体 | 
|------|------|
| 标题 | Space Grotesk |
| 正文 | Inter |
| 公式 | JetBrains Mono |

### 三套可切换

| # | 标题 | 正文 | 公式 |
|---|------|------|------|
| 1 | Space Grotesk | Inter | JetBrains Mono |
| 2 | Geist | Geist | Geist Mono |
| 3 | Playfair Display | Inter | Fira Code |

切换: `<body>` class `font-scheme-N` → CSS 变量替换。

---

## 六、动效规范

| 动效 | 触发 | 时长 | 实现 |
|------|------|------|------|
| 图标弹簧 | hover/click | 300ms | `spring({ stiffness: 400, damping: 17 })` |
| 输入框脉冲 | focus | 400ms | `box-shadow` 动画 |
| 2D↔3D 切换 | 点击 | 500ms | crossfade + scale |
| 曲线绘制 | 新函数 | 800ms | `stroke-dasharray` 动画 |
| 3D 晶体生长 | 新函数 | 1000ms | vertex morph 插值 |
| 点运动拖尾 | 启用运动 | 实时 | Canvas 渐隐粒子 |
| 品牌开场 | 首次加载 | 1500ms | ∫ → Logo → stagger 淡入 |
| 主题切换 | 点击色块 | 400ms | CSS 变量渐变 |
| 预设折叠 | 点击分类 | 300ms | height 动画 |

### 不做
循环粒子、音效、重力物理、超 1.5s 动画

---

## 七、功能规格

### 7.1 函数输入
- 单变量 `sin(x)`, `x^2+2x` → 2D
- 双变量 `sin(x)*cos(y)` → 3D
- **自动维度检测**: 含 `y` → 3D
- 多函数叠加，自动配色
- 非法表达式 → 红框 + 错误提示(双语)
- 取值范围可调
- **数学专用键盘**: 聚焦输入框时从下方弹簧弹出，包含所有函数所需符号（见 7.1a）

### 7.1a MathKeyboard 数学键盘

**触发**: 输入框 onFocus → 键盘从下方 spring 弹出；onBlur → 淡出下沉  
**位置**: 固定在页面底部，覆盖在布局之上  
**技术**: Framer Motion AnimatePresence + spring

**按键清单 (6 行分组)**:

| 分组 | 按键 |
|------|------|
| 三角函数 | `sin(` `cos(` `tan(` `csc(` `sec(` `cot(` `arcsin(` `arccos(` `arctan(` |
| 对数/指数 | `log(` `ln(` `exp(` `log2(` `log10(` |
| 符号常量 | `π` `e` `i` `θ` `φ` `α` `β` `γ` `∞` |
| 函数 | `abs(` `sqrt(` `|x|` `floor(` `ceil(` `round(` `sign(` |
| 运算符 | `^` `/` `*` `+` `-` `(` `)` `=` `≤` `≥` `≠` |
| 变量 | `x` `y` `z` `t` `a` `b` `c` `d` `n` `m` |
| 快捷 | `x²` `x³` `xⁿ` `eˣ` `1/x` `←` `清空` `确定 ✓` |

**交互细节**:
- 按键 hover 微发光 (accent-glow)
- click 按键 → scale 0.9 → spring 回弹 → 字符插入光标位置
- 变量键高亮 (accent 色边框)
- 退格删除光标前一个字符
- 清空 → 清除整个输入框
- 确定 → 关闭键盘

### 7.2 2D 绘图
- 坐标网格 + 轴标签 + 刻度
- Canvas API 抗锯齿曲线 (2px)
- 点沿曲线运动 + 坐标显示 + 拖尾粒子
- 运动: 播放/暂停/速度/拖拽
- 参数方程: x(t), y(t) → 轨迹动画

### 7.3 3D 绘图
- Three.js 曲面 + z 值颜色映射
- 等高线: 表面 + 底部半透明悬浮投影
- 梯度箭头指示
- 截面: 输入 x 值 → 激光线扫过曲面
- OrbitControls 旋转/缩放/平移
- **⭐ 星场粒子网格** (代替普通网格线)
- **💡 光标跟随光源** (鼠标位置影响漫反射)
- **🌊 曲面"水波式"生成动画** (vertex ripple → 目标形状)

### 7.4 预设函数库 (27+ 内置 + 用户自定义)

**内置预设**：系统预置，无需登录即可使用。

```
初等函数: y=kx+b, y=k/x, y=x², y=x³, y=√x
三角函数: y=sin(x), y=cos(x), y=tan(x), y=Asin(ωx+φ), y=sec(x), y=csc(x)
导数演示: f(x)=x²→f'(x)=2x, f(x)=sin(x)→f'(x)=cos(x), f(x)=x³→f'(x)=3x², f(x)=eˣ→f'(x)=eˣ
参数方程: 圆, 椭圆, 摆线, Lissajous
高数曲面: z=sin(x)cos(y), z=x²+y², z=sin(√(x²+y²)), z=x²-y², z=cos(x)cos(y), z=exp(-(x²+y²))
```

**用户自定义预设** (需登录，Phase 6+ 实现)：
- 用户输入任意函数的表达式 + 名称 + 分类标签 → 保存到个人预设库
- 个人预设出现在侧边栏独立分区"我的预设"
- 支持编辑和删除
- 数据存储于后端/云端，跨设备同步

### 7.5 搜索 & 导出
- Ctrl+K 命令面板，中英文模糊匹配
- 截图下载 PNG + 全屏 API

### 7.6 新手引导教程

**触发**: 首次访问网站时自动弹出（localStorage `functor-tutorial-done` 不存在）  
**实现**: 4 步引导卡片覆盖层，每步高亮对应 UI 区域

| 步骤 | 标题 | 内容 | 高亮区域 |
|------|------|------|----------|
| 1 | 欢迎来到 Functor | ∫ 动画 + "数学函数可视化工具" | 全屏居中 |
| 2 | 输入函数 | "在这里输入任意函数，支持 sin(x)、x² 等" + 指向键盘 | 输入框 |
| 3 | 使用预设 | "点击预设可直接加载经典函数，快速体验" | 预设分类区 |
| 4 | 开始探索 | "2D/3D 切换，拖拽旋转，享受数学之美 ✨" | 画布区 + 2D/3D 按钮 |

**交互**: ← 上一步 / 下一步 → / 跳过 按钮；完成后设置 localStorage 标记

---

## 八、国际化

- `i18next` + `react-i18next`
- `locales/zh.json` + `locales/en.json`
- 覆盖: 菜单、按钮、预设名、错误、提示、状态
- 顶部栏切换，`localStorage` 记忆，即时生效无需刷新

---

## 九、错误处理

| 场景 | 处理 |
|------|------|
| 非法表达式 | 输入框红边 + 错误提示(双语) |
| 空输入 | 灰色占位引导，不操作 |
| 除零/无穷 | 跳过该采样点 |
| WebGL 不支持 | 降级提示，2D 模式可用 |
| 浏览器不兼容 | 顶栏升级提醒 |

---

## 十、开发阶段

| Phase | 内容 | 关键交付物 |
|-------|------|-----------|
| **P1** 骨架 | Vite + React + Tailwind, 主题 + 字体, 开场动画, 布局 | 可看到暗色玻璃页面 |
| **P2** 2D 基础 | MathEngine, DimDetector, Canvas2D, 曲线绘制动画 | 可输入函数画出线 |
| **P3** 2D 增强 | 设置面板, 预设库, 搜索, 点运动+拖尾, 自定义主题色 | 完整的 2D 体验 |
| **P4** 3D 基础 | Three.js/R3F, 曲面渲染, OrbitControls, 晶体生长 | 可看 3D 曲面 |
| **P5** 3D 增强 | 等高线, 梯度, 截面, 2D/3D 切换 | 完整 3D 功能 |
| **P6** 收尾 | i18n 全面覆盖, 截图, 全屏, 响应式, 性能 | 可发布版本 |
| **P7+** 未来 | 用户登录系统, 自定义预设云端同步, 社区预设分享 | 完整账号体系 |

---

*📌 此文档经用户确认，将作为唯一事实来源驱动实施。*
