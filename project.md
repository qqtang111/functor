# 📐 Functor — Vibe Coding 全栈项目文档

> **状态**: 🟢 Phase 1-6 完成，Phase 7 规划中 | **最后更新**: 2026-06-14
> **开发范式**: Vibe Coding — AI 驱动、角色分工、渐进式交付

---

## 🎬 一、Vibe Coding 是什么？

### 1.1 一句话理解

> **你不再写代码，你指挥 AI 写代码。** 你是导演，AI 是你的演员团队。

Vibe Coding（氛围编程）由 OpenAI 联合创始人 Andrej Karpathy 在 2025 年提出。核心理念：用自然语言描述「我想要什么感觉」，AI 负责把感觉变成精确的代码。传统开发是「产品经理 → 设计 → 前端 → 后端 → 测试 → 运维」的串行链路，Vibe Coding 将其压缩为「**你 ➝ AI 分身团队 ➝ 可上线产品**」。

### 1.2 本项目的 Vibe 开发模式

本项目 **Functor（数学函数可视化工具）** 完全采用 Vibe Coding 方法论构建。一个人 + Claude Code + 多个 AI 角色 = 完整开发团队。下面会详细介绍每个角色如何协作。

### 1.3 跟视频里一样：一人分饰多角

抖音上热门的 Vibe Coding 视频展示的核心玩法就是：**一个人分别扮演产品经理、UI 设计师、前端开发、后端开发、测试工程师、运维部署**，通过 AI 工具让每个角色产出专业级别的交付物，最终把一个想法变成可上线、可盈利的产品。

本项目完整复刻了这个流程——下面就是我们的「虚拟团队」。

---

## 👥 二、分角色研发团队

> **总导演（你）** → 指挥下面 6 个 AI 角色 + 1 个教学导师协作开发 Functor

### 2.1 角色总览

```
                    ┌──────────────┐
                    │    👤 你     │
                    │  (总导演)    │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │       │       │       │       │      │
        ▼       ▼       ▼       ▼       ▼      ▼
    ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
    │ 📋PM ││🎨UI  ││⚛️前端││🔧后端││🧪测试││🚀运维│
    │产品  ││设计  ││开发  ││开发  ││工程  ││部署  │
    │经理  ││师    ││     ││     ││师    ││工程师│
    └──────┘└──────┘└──────┘└──────┘└──────┘└──────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  👨‍🏫 教学导师 │
                    │  部署+盈利   │
                    └──────────────┘
```

### 2.2 各角色职责卡

---

#### 📋 产品经理（Product Manager）

| 项目 | 内容 |
|------|------|
| **AI 工具** | Claude Code（需求分析模式） |
| **核心职责** | 定义产品愿景、撰写 PRD、拆分功能优先级、管理开发路线图 |
| **交付物** | `spec.md`（设计规格）、`project.md`（项目文档）、Phase 规划 |

**工作流程：**
1. 与「你」进行多轮对话，追问目标用户、使用场景、核心痛点
2. 输出包含背景目标、用户旅程、功能模块表、技术架构建议的完整 PRD
3. 将大需求拆分为独立 Phase，每个 Phase 有明确的验收标准
4. 每个 Phase 结束后回顾交付物，调整后续计划

**本项目 PM 产出：**
- ✅ [[spec.md]] — 完整设计规格文档（含 UI 布局、主题系统、动效规范、功能规格）
- ✅ [[project.md]]（本文件）— 项目总控文档
- ✅ 7 个 Phase 的路线图（P1-P6 已完成，P7 规划中）

---

#### 🎨 UI/UX 设计师（UI Designer）

| 项目 | 内容 |
|------|------|
| **AI 工具** | Claude Code + 设计系统生成 + frontend-design skill |
| **核心职责** | 定义视觉风格、设计组件系统、确保交互一致性、响应式适配 |
| **交付物** | 主题系统（4 套）、字体系统（3 套）、动效规范、UI 组件库 |

**工作流程：**
1. 根据 PM 的 spec.md，确定视觉方向（暗色玻璃科技风）
2. 设计 CSS 变量驱动的主题系统，支持一键切换
3. 定义动效规范：弹簧物理、时长、触发条件
4. 输出设计 Token，供前端直接使用
5. 每个 Phase 审查 UI 实现，确保设计还原度

**本项目 UI 产出：**
- ✅ 4 套主题（暗色玻璃 / 轻量高级 / 赛博网格 / 极简玻璃）
- ✅ 3 套字体方案（Space Grotesk / Geist / Playfair）
- ✅ 动效系统（弹簧按钮、脉冲输入、曲线绘制动画、3D 晶体生长、品牌开场）
- ✅ 响应式布局（桌面端侧边栏 + 移动端折叠适配）
- ✅ 品牌 Splash Screen（∫ → Logo → stagger 淡入）
- ✅ 数学专用键盘 UI（6 行分组，发光反馈）

---

#### ⚛️ 前端开发（Frontend Developer）

| 项目 | 内容 |
|------|------|
| **AI 工具** | Claude Code + React + Vite |
| **技术栈** | React 19, Tailwind CSS 4, Framer Motion 12, Zustand 5, Three.js/R3F, i18next |
| **核心职责** | 组件开发、状态管理、Canvas 2D/3D 渲染、国际化、PWA |
| **交付物** | 所有 `src/` 下的组件、engine、stores、i18n、styles |

**工作流程：**
1. 根据 spec.md 的技术架构搭建项目骨架（Vite + React）
2. 按 Phase 顺序实现功能：先骨架 → 2D → 3D → 增强 → 收尾
3. 每个组件独立开发，使用 Zustand 管理全局状态
4. 与 UI 设计师紧密配合，确保像素级还原
5. 每完成一个功能就 `git commit`

**本项目前端产出（共 30+ 文件）：**
- ✅ 布局系统：TopBar, Sidebar, CanvasArea, CommandPalette
- ✅ 2D 引擎：Canvas2D, CurveAnimation, PointMotion（拖尾粒子）
- ✅ 3D 引擎：Canvas3D（Three.js/R3F）, ContourOverlay（等高线）
- ✅ 交互组件：MathKeyboard（弹簧弹出）, PresetBrowser（27+ 预设）, SearchBar, SettingsPanel
- ✅ UI 组件：ThemeSwitcher, LanguageToggle, ModeSwitch, SplashScreen, MicroButton
- ✅ 状态管理：functionStore, viewStore, themeStore, i18nStore
- ✅ 国际化：中英双语全覆盖（含错误提示、预设名/分类名语言感知）
- ✅ PWA：manifest.json + Service Worker + 离线缓存 + 可安装

---

#### 🔧 后端开发（Backend Developer）

| 项目 | 内容 |
|------|------|
| **AI 工具** | Claude Code + Supabase / Node.js |
| **技术栈** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **核心职责** | 用户系统、数据持久化、API 设计、云端同步 |
| **交付物** | 数据库 Schema、API 路由、认证中间件、数据迁移脚本 |

**工作流程：**
1. 根据 PM 的 P7 需求，设计数据库模型（用户、预设、收藏、评论）
2. 搭建 Supabase 项目，配置 Auth（邮箱 + OAuth）
3. 设计 RESTful API（或直接用 Supabase Client SDK）
4. 实现用户预设的 CRUD + 云端同步
5. 实现社区预设广场（公开分享、点赞、收藏）
6. 编写数据迁移脚本和 API 文档

**本项目后端规划（P7）：**

| 功能 | 方案 | 状态 |
|------|------|------|
| 用户注册/登录 | Supabase Auth（邮箱 + GitHub OAuth） | 🔴 待开发 |
| 会话管理 | Supabase JWT + localStorage | 🔴 待开发 |
| 预设 CRUD | Supabase PostgreSQL + Row Level Security | 🔴 待开发 |
| 云端同步 | Supabase Realtime（跨设备即时同步） | 🔴 待开发 |
| 社区预设广场 | 公开预设表 + 点赞/收藏关联表 | 🔴 待开发 |
| API 限流 | Supabase 内置 Rate Limiting | 🔴 待开发 |

**数据库 Schema 设计（P7 规划）：**

```sql
-- 用户预设表
CREATE TABLE user_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  expression TEXT NOT NULL,
  category TEXT,
  notes TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 社区互动表
CREATE TABLE preset_likes (
  user_id UUID REFERENCES auth.users(id),
  preset_id UUID REFERENCES user_presets(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, preset_id)
);

-- 收藏表
CREATE TABLE preset_favorites (
  user_id UUID REFERENCES auth.users(id),
  preset_id UUID REFERENCES user_presets(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, preset_id)
);
```

---

#### 🧪 测试工程师（QA Engineer）

| 项目 | 内容 |
|------|------|
| **AI 工具** | Claude Code + Playwright + Vitest |
| **核心职责** | 功能测试、兼容性测试、边界测试、回归测试、性能测试 |
| **交付物** | 测试用例清单、Bug 报告、测试覆盖率报告 |

**工作流程：**
1. 每个 Phase 完成后进行验收测试
2. 编写自动化测试用例（单元测试 + E2E）
3. 检查边界状态：空输入、非法表达式、除零、WebGL 不支持
4. 多设备兼容性：桌面端 / 平板 / 手机（含 iOS Safari 特殊处理）
5. 性能测试：3D 渲染帧率、大表达式解析速度

**本项目测试产出：**
- ✅ 空输入 → 灰色占位，不报错
- ✅ 非法表达式 → 红框 + 双语错误提示（如 `sin x` 缺少括号）
- ✅ 除零/无穷 → 采样点跳过，不崩溃
- ✅ WebGL 不支持 → 降级提示，2D 模式仍可用
- ✅ 响应式断点 → 320px / 768px / 1024px / 1440px 四档验证
- ✅ iOS Safari → 防 zoom（`maximum-scale=1`）、safe-area 适配
- ✅ 触屏最小交互区域 → 40px（符合 WCAG 2.2）
- ✅ PWA 离线 → Service Worker 缓存策略验证
- ✅ 构建通过 → `npm run build` 零错误
- 🚧 自动化 E2E 测试（P7 补充）
- 🚧 单元测试覆盖率 ≥ 80%（P7 补充）

---

#### 🚀 运维/部署工程师（DevOps Engineer）

| 项目 | 内容 |
|------|------|
| **AI 工具** | Claude Code + Vercel CLI / GitHub Actions |
| **核心职责** | 部署上线、域名配置、HTTPS、CI/CD、监控、成本控制 |
| **交付物** | 部署文档、CI/CD 流水线、成本分析报告 |

**工作流程：**
1. 选择部署方案（静态前端 → Vercel 免费；后端 → Supabase 免费）
2. 配置自动部署（Git Push → Vercel 自动构建）
3. HTTPS 证书（Vercel 自动提供）
4. 监控告警（Vercel Analytics + Supabase 日志）
5. 成本优化（控制在免费额度内）

**本项目部署产出：**
- ✅ 本地开发：`npm run dev`（Vite dev server）
- ✅ 生产构建：`npm run build` → `dist/` 静态文件
- ✅ PWA 就绪：manifest.json + Service Worker
- ✅ GitHub 仓库：[qqtang111/functor](https://github.com/qqtang111/functor)
- ✅ Vercel 部署：`vibe-hazel-xi.vercel.app`（READY，2026-06-14）
- 🚧 Vercel ↔ GitHub 自动部署连接
- 🚧 自定义域名 + HTTPS（待购买域名）
- 🚧 CI/CD 流水线（GitHub Actions → Vercel）

---

### 2.3 角色 × Phase 矩阵

| Phase | 📋 PM | 🎨 UI | ⚛️ 前端 | 🔧 后端 | 🧪 测试 | 🚀 运维 |
|-------|:-----:|:-----:|:-------:|:-------:|:-------:|:-------:|
| P1 骨架 | 定义布局需求 | 设计主题+字体+动效 | 搭建项目+组件库 | — | 验证构建 | 初始化 Vite |
| P2 2D 基础 | 定义函数输入规格 | 设计数学键盘 | Canvas2D+引擎 | — | 表达式边界测试 | — |
| P3 2D 增强 | 预设库+搜索需求 | 设置面板+搜索 UI | 预设+搜索+动画 | — | 27+ 预设验证 | — |
| P4 3D 基础 | 3D 功能规格 | 3D 视觉风格 | Three.js 曲面 | — | WebGL 兼容测试 | — |
| P5 3D 增强 | 等高线+截面需求 | 色标+线框设计 | 等高线+梯度+截面 | — | 3D 性能测试 | — |
| P6 收尾 | i18n+PWA 规格 | 响应式+移动端 UI | i18n+PWA+打磨 | — | iOS/触屏测试 | PWA 配置 |
| P7 用户系统 | 用户+社区需求 | 登录页+广场 UI | 登录/预设/广场 | DB+Auth+API | 安全+E2E | Vercel+Supabase |

---

## 🎓 三、教学篇：如何低成本部署上线并产生收益

> **👨‍🏫 教学导师角色** — 专门教你从零成本到盈利的完整路径

### 3.1 部署总花费：¥0 — 是的，完全免费

Functor 是一个**纯前端 + BaaS 后端**的项目，充分利用各平台的免费额度：

| 服务 | 用途 | 免费额度 | 月费 |
|------|------|----------|:----:|
| **GitHub** | 代码托管 | 无限公共仓库 + Actions 2000 分钟/月 | ¥0 |
| **Vercel** | 前端部署 | 100GB 带宽 + 自动 HTTPS + 全球 CDN | ¥0 |
| **Supabase** | 后端（DB+Auth+API） | 500MB 数据库 + 50,000 月活用户 + 2GB 存储 | ¥0 |
| **Cloudflare** | DNS + CDN 加速（可选） | 无限流量 CDN + DDoS 防护 | ¥0 |
| **Vercel Analytics** | 用户分析（可选） | 基础版免费 | ¥0 |

> **合计：¥0/月**，足够支撑 50,000 月活用户。

### 3.2 部署四步走（30 分钟上线）

#### 第 1 步：推送到 GitHub（5 分钟）

```bash
cd vibe/
git init
git add .
git commit -m "feat: Functor 数学函数可视化工具 v1.0

- 2D/3D 函数绘图
- 4 套主题 + 3 套字体
- 中英双语 + PWA 离线
- 27+ 预设函数库"

# 在 GitHub 创建仓库 functor，然后：
git remote add origin https://github.com/你的用户名/functor.git
git branch -M main
git push -u origin main
```

#### 第 2 步：Vercel 一键部署（3 分钟）

1. 打开 [vercel.com](https://vercel.com) → 用 GitHub 账号登录
2. 点击 **「New Project」** → 导入 `functor` 仓库
3. Vercel 自动检测 Vite 项目，无需任何配置：
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 点击 **「Deploy」**，等待约 17 秒
5. 🎉 获得网址：`https://functor-xxx.vercel.app`

#### 第 3 步：绑定自定义域名（可选，10 分钟）

```bash
# 1. 购买域名（Namesilo/Cloudflare/Porkbun，约 ¥50/年）
# 推荐: functor.app 或 functor.cc

# 2. Cloudflare 添加域名 → 修改 NS 服务器

# 3. Vercel → Settings → Domains → 添加你的域名
#    Vercel 自动配置 SSL 证书（Let's Encrypt）

# 4. Cloudflare DNS 添加 CNAME 记录：
#    functor.app → cname.vercel-dns.com
```

#### 第 4 步：配置 Supabase 后端（P7 需要，15 分钟）

1. 打开 [supabase.com](https://supabase.com) → 用 GitHub 登录
2. 创建新项目 → 设置数据库密码
3. 在 SQL Editor 中执行数据库 Schema（见 2.2 后端开发部分）
4. 开启 Auth：邮箱注册 + GitHub OAuth
5. 获取 API Key → 填入项目 `.env`：
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxxxx...
   ```
6. Vercel → Settings → Environment Variables → 添加上述变量 → Redeploy

### 3.3 盈利模式（5 条路径）

> 基于 Functor 的产品特性，以下是低成本的变现策略：

#### 💰 路径 1：免费增值（Freemium）— 推荐首选

| 层级 | 价格 | 包含功能 |
|------|:----:|----------|
| **Free** | ¥0 | 基础绘图 + 27 个内置预设 + 2D/3D |
| **Pro** | ¥19/月 | 无限保存自定义预设 + 云端同步 + 高清截图导出 + 去广告 |
| **Edu** | ¥9/月 | 学生认证后享受 Pro 全部功能 |

**为什么这个模式好？** 学生群体（核心用户）支付意愿低但基数大，教育机构愿意为团队版付费。

**技术实现：**
- Supabase Row Level Security 控制预设数量上限
- Stripe/Paddle 处理支付（Stripe 无月费，仅抽成 2.9%）
- Vercel Edge Functions 做付费验证

#### 💰 路径 2：教育机构授权

| 客户 | 模式 | 预计收入 |
|------|------|:--------:|
| 高中/大学 | 校内部署版（白标） | ¥5,000-20,000/校 |
| 在线教育平台 | API 嵌入授权 | ¥2,000-5,000/月 |
| 教材出版社 | 配套工具授权 | ¥10,000-50,000/次 |

**为什么可行？** 数学可视化是刚需。Desmos 已被美国 SAT 考试采用。中国学校同样需要国产替代。

#### 💰 路径 3：广告变现（保底方案）

- Google AdSense：教育类 CPM 约 $2-5
- 月访问 10 万 PV → 约 $200-500/月
- 缺点：影响用户体验，与学生工具调性不符
- **建议**：仅在 Free 层展示，Pro 层无广告

#### 💰 路径 4：内容付费 & 社区

- 在预设广场中设「精选付费预设包」（如「考研数学必会函数 50 例」¥9.9）
- 用户可出售自己的预设（平台抽成 20%）
- 数学教学视频 + 配套预设工具包

#### 💰 路径 5：开源 + 赞助

- GitHub Sponsors / 爱发电：接受社区捐赠
- 开源核心代码，Pro 功能作为 SaaS 增值服务
- 技术博客 + YouTube/B站教学 → 广告分成

### 3.4 投入产出估算

| 阶段 | 投入 | 产出 |
|------|------|------|
| **开发期**（已完成） | 1 人 + AI | 可用的 MVP |
| **部署上线** | ¥0（免费额度） | 全球可访问 |
| **推广期**（1-3 月） | 社交媒体 + SEO | 首批 1,000 用户 |
| **变现期**（3-6 月） | 接入支付 + 运营 | ¥500-5,000/月 |
| **规模化**（6-12 月） | 教育渠道 + 内容 | ¥5,000-50,000/月 |

### 3.5 推广获客（低成本）

| 渠道 | 方法 | 预期效果 |
|------|------|----------|
| **小红书** | 发「数学可视化神器」教程帖 | 精准学生流量 |
| **B 站** | 录制「如何用 Functor 学高数」 | 长尾搜索流量 |
| **知乎** | 回答「有哪些好用的数学工具」 | SEO 排名 |
| **GitHub** | 开源 + README 英文版 | 全球开发者关注 |
| **Product Hunt** | 上线首日 Launch | 海外早期用户 |
| **高校论坛** | 考研/期末复习板块发帖 | 精准用户获取 |

---

## 📋 四、项目概述

### 4.1 这是什么？
一个**网页版数学函数可视化工具**，能够在浏览器中绘制 2D 和 3D 数学函数图像。用户输入函数表达式，工具实时渲染出对应的曲线/曲面。

### 4.2 核心目标
- ✅ 支持 2D 函数绘图（y = f(x)）
- ✅ 支持 3D 函数绘图（z = f(x, y)）
- ✅ 交互式操作（旋转、缩放、平移）
- ✅ 直观易用的界面
- ✅ 手机端友好（响应式布局，触屏可操作）
- ✅ 4 套主题 + 3 套字体 + 中英双语
- ✅ 27+ 内置预设函数
- ✅ PWA 离线可用
- 🔴 用户系统 + 云端同步（P7）

### 4.3 目标用户
- 学生（学习微积分、线性代数）
- 教师（课堂演示）
- 数学爱好者
- 开发者（调试算法）

---

## 🛠 五、技术栈

| 层级 | 技术 | 用途 | 说明 |
|------|------|------|------|
| **构建工具** | Vite | 项目构建与热更新 | 启动快，配置简单 |
| **框架** | React 19 | UI 界面 | 组件化，AI 最擅长 |
| **样式** | Tailwind CSS 4 | 原子化样式 | 响应式友好 |
| **动画** | Framer Motion 12 | UI 动效 + 弹簧物理 | 丝滑交互 |
| **状态管理** | Zustand 5 | 全局状态 | 轻量无模板 |
| **3D 渲染** | Three.js + @react-three/fiber + drei | 3D 函数曲面 | WebGL 标准方案 |
| **2D 绘图** | Canvas 2D API | 2D 函数曲线 | 原生高性能 |
| **数学计算** | mathjs 14 | 函数解析与求值 | 支持表达式字符串解析 |
| **国际化** | i18next + react-i18next | 中英双语 | 即时切换 |
| **字体** | Space Grotesk + Inter + JetBrains Mono | 默认字体 | 自托管 |
| **后端** | Supabase (P7) | DB + Auth + API | PostgreSQL + 免费额度 |
| **部署** | Vercel (P7) | 前端部署 | 免费 HTTPS + 全球 CDN |
| **包管理** | npm | 依赖管理 | Node.js 自带 |

---

## 🗺 六、开发路线图

### Phase 1：✅ 环境搭建 + 基础骨架
- [x] 初始化 Vite + React 项目
- [x] 安装核心依赖
- [x] 搭建基本页面布局（TopBar + Sidebar + CanvasArea）
- [x] 4 套主题系统 + 3 套字体方案
- [x] SplashScreen 品牌开场动画
- [x] 本地开发服务器运行正常

**👥 角色分工**: PM 定义需求 → UI 设计主题 → 前端搭建骨架

---

### Phase 2：✅ 2D 函数绘图
- [x] 用户输入函数表达式（如 `sin(x)`、`x^2 + 2*x + 1`）
- [x] MathEngine 表达式解析 + DimDetector 自动维度识别
- [x] Canvas2D 坐标系（网格、轴标签、刻度）
- [x] 函数曲线绘制（抗锯齿 2px）
- [x] 数学键盘（弹簧弹出，6 行分组，发光反馈）
- [x] 新手引导教程（4 步覆盖）

**👥 角色分工**: PM 定义输入规格 → UI 设计键盘 → 前端实现引擎

---

### Phase 3：✅ 2D 交互增强
- [x] 预设函数库（27+ 内置预设，6 个分类）
- [x] 多函数叠加显示（自动配色，独立控制）
- [x] 设置面板（X 范围、Y 范围、颜色、网格开关）
- [x] Ctrl+K 命令面板（中英文模糊搜索）
- [x] 曲线绘制动画（stroke-dasharray）
- [x] 点运动 + 拖尾粒子（播放/暂停/速度/拖拽）
- [x] 自定义主题色（取色器 + localStorage 持久化）
- [x] 中英双语切换（i18next，即时生效）

**👥 角色分工**: PM 定义预设需求 → UI 设计面板 → 前端实现交互

---

### Phase 4：✅ 3D 函数绘图
- [x] Three.js + @react-three/fiber 曲面渲染
- [x] OrbitControls（旋转/缩放/平移，触屏支持）
- [x] 颜色渐变映射（z 值 → 颜色）
- [x] 星场粒子网格（代替传统网格线）
- [x] 曲面「水波式」生成动画
- [x] 2D/3D 模式切换

**👥 角色分工**: PM 定义 3D 规格 → UI 设计视觉 → 前端实现 Three.js

---

### Phase 5：✅ 3D 功能增强
- [x] 等高线叠加（表面 + 底部悬浮投影）
- [x] 色标图例
- [x] 线框模式
- [x] 梯度指示
- [x] 参数动画
- [x] 光标跟随光源

**👥 角色分工**: PM 定义增强功能 → UI 设计色标 → 前端实现渲染

---

### Phase 6：✅ 收尾打磨
- [x] i18n 全面覆盖（消除所有硬编码文本，双语错误提示，预设名/分类名语言感知）
- [x] 截图增强（3D + 2D + Toast 反馈）
- [x] 全屏 API
- [x] 响应式打磨（iOS zoom 防止、safe-area、触屏最小 40px、命令行/侧栏移动适配）
- [x] PWA（manifest.json + Service Worker + 离线缓存 + 可安装）
- [x] 构建通过 ✅

**👥 角色分工**: PM 定义收尾项 → 测试全设备验证 → 前端打磨 → 运维配置 PWA

---

### Phase 7：🔴 用户系统 + 云端同步（当前阶段）

#### 7.1 用户登录系统
- 注册/登录：邮箱 + 密码（Supabase Auth）
- 第三方 OAuth：GitHub / Google 登录
- 会话管理：JWT Token + localStorage 持久化
- 头像和昵称设置
- 密码找回流程

#### 7.2 自定义预设管理
- 用户可保存自己的函数预设（表达式 + 名称 + 分类 + 备注）
- 预设出现在侧边栏「我的预设」分区
- 支持编辑、删除、重命名
- 云端同步（跨设备访问，Supabase Realtime）

#### 7.3 社区预设分享
- 公开预设广场（浏览他人分享的预设）
- 点赞 / 收藏 / 评论
- 一键加载到自己的画布
- 预设排行榜（热门 / 精选）

#### 7.4 部署上线
- 推送代码到 GitHub
- Vercel 一键部署前端
- Supabase 配置后端
- 自定义域名 + HTTPS
- CI/CD 自动化流水线

#### 7.5 P7 角色分工
| 角色 | 任务 |
|------|------|
| 📋 PM | 定义用户系统 PRD、会员体系设计 |
| 🎨 UI | 登录/注册页、预设管理页、社区广场页设计 |
| ⚛️ 前端 | 登录组件、预设 CRUD 组件、社区广场组件 |
| 🔧 后端 | Supabase Schema、Auth 配置、RLS 策略、API |
| 🧪 测试 | 安全测试、E2E 测试、边界测试 |
| 🚀 运维 | Vercel 部署、域名配置、CI/CD |
| 👨‍🏫 教学 | 部署教程 + 盈利策略文档 |

---

## 📐 七、项目结构

```
vibe/
├── project.md            ← 本文档（项目总控）
├── spec.md               ← 设计规格文档（PRD）
├── package.json
├── vite.config.js
├── index.html
├── public/
│   └── fonts/            ← 自托管字体
├── src/
│   ├── main.jsx          ← 入口文件
│   ├── App.jsx           ← 根组件
│   ├── components/
│   │   ├── layout/       ← TopBar, Sidebar, CanvasArea
│   │   ├── panels/       ← FunctionInput, PresetBrowser, SearchBar, SettingsPanel
│   │   ├── canvas/       ← Canvas2D, Canvas3D, PointMotion, CurveAnimation, ContourOverlay
│   │   └── ui/           ← ThemeSwitcher, LanguageToggle, ModeSwitch, SplashScreen, MicroButton
│   ├── engine/           ← MathEngine, DimDetector, PresetLib
│   ├── stores/           ← functionStore, viewStore, themeStore, i18nStore
│   ├── i18n/             ← i18next 配置 + locales/zh.json + en.json
│   └── styles/           ← globals.css + themes.css
└── plans/                ← 各 Phase 实施计划
```

---

## 🧠 八、Vibe Coding 开发规范

### 8.1 核心理念

1. **渐进式复杂** — 从最简单的能跑起来的版本开始，逐步加功能
2. **胶水编程** — 能抄不写，能连不造（优先用成熟库，让 AI 生成模板代码）
3. **可视化验证** — 每改一点就刷新看看效果，眼见为实
4. **文档同步** — 每完成一个功能点就更新 project.md
5. **角色切换** — 每次只让 AI 聚焦于**单一角色、单一任务**，避免上下文混乱

### 8.2 与 Claude Code 协作方式

- 我会以不同角色的身份切换工作
- 你需要做什么：**描述你想要的效果**
- 我会做什么：切换对应角色，产出专业交付物
- 遇到错误直接把错误信息发给我

### 8.3 Vibe Coding 最佳实践

| ✅ DO | ❌ DON'T |
|------|----------|
| 每次只让 AI 做一个角色的工作 | 把所有需求一股脑丢给 AI |
| 拆成独立小任务，每个任务开新对话 | 在一个超长对话里做所有事 |
| 每完成一个功能就 git commit | 攒一堆改动再提交 |
| 需求描述加验收标准 | 模糊地说「做得好看一点」 |
| 技术选型求稳不求新 | 选 AI 不熟悉的冷门框架 |
| 边界状态要明确（loading/empty/error） | 只考虑正常流程 |

### 8.4 提交规范

```
Phase N: [角色] 简短描述
示例: 
  "Phase 2: [前端] 完成 2D 坐标系绘制"
  "Phase 7: [后端] 添加 Supabase 用户预设表"
  "Phase 7: [UI] 设计登录页面"
```

---

## 📝 九、长期记忆

### 项目关键决策记录

| 日期 | 决策 | 原因 |
|------|------|------|
| 2026-06-14 | 技术栈：Vite + React + Tailwind 4 + Framer Motion + Zustand + mathjs + Three.js/R3F | AI 最擅长组合，生态丰富 |
| 2026-06-14 | 项目位置：`vibe/` 文件夹 | 用户指定 |
| 2026-06-14 | 产品名：Functor | 数学函数可视化 |
| 2026-06-14 | 风格：暗色玻璃(默认) + 4 主题切换 + 3 字体方案 | 科技感 |
| 2026-06-14 | P1-P6 完成：2D/3D 引擎 + 预设库 + 双语 + PWA | 30+ 文件，构建通过 |
| 2026-06-14 | P7 后端选型：Supabase | 免费额度大，AI 友好，无需自己搭服务器 |
| 2026-06-14 | P7 部署选型：Vercel + Supabase | 零成本方案，全球 CDN |

### 当前进度
- 🟢 Phase 1-6：✅ 全部完成，构建通过
- 🔴 Phase 7：用户系统 + 云端同步（待开发）

---

## ❓ 十、待商议事项

- [x] UI 布局偏好 → Desmos 风格
- [x] 先 2D 后 3D → ✅
- [x] 触屏/移动端支持 → ✅ 硬性要求
- [x] 后端选型 → Supabase（免费额度大）
- [x] 部署方案 → Vercel（免费 HTTPS + CDN）
- [x] 盈利模式 → Freemium + 教育授权
- [ ] 是否需要用户登录/保存功能？（P7 实现中）
- [ ] 社区预设广场是否要审核机制？
- [ ] 是否要开发移动 App 版本？

---

*📌 本文档随开发进度持续更新。每完成一个新功能，我们以对应角色身份一起回来补充。*
