# 🏗️ Functor Backend — Cloudflare Workers + D1

> **状态**: 🟢 代码就绪 | **部署**: 待推送 | **最后更新**: 2026-06-15
>
> Functor 数学函数可视化工具的后端 API。
> **零成本、零冷启动、国内可用。**

---

## 一、架构概览

```
┌─────────────────────────┐
│   Functor 前端          │
│   (Cloudflare Pages)    │
└───────────┬─────────────┘
            │ HTTPS (JWT Bearer Token)
            ▼
┌─────────────────────────┐
│   Workers API           │
│                         │
│  ┌───────────────────┐  │
│  │  Hono 路由层       │  │
│  │  /api/auth/*       │  │
│  │  /api/presets/*    │  │
│  │  /api/social/*     │  │
│  └────────┬──────────┘  │
│           │              │
│  ┌────────▼──────────┐  │
│  │  JWT 认证中间件    │  │
│  └────────┬──────────┘  │
│           │              │
│  ┌────────▼──────────┐  │
│  │  D1 数据库 (SQLite)│  │
│  └───────────────────┘  │
└─────────────────────────┘
```

| 决策 | 原因 |
|------|------|
| Workers 而非 Vercel Functions | 已用 Cloudflare Pages，Workers 原生集成 |
| D1 而非 Supabase PG | 边缘部署、无冷启动、中国速度快 |
| 自实现 JWT 而非 Auth0 | 零外部依赖、Workers 友好、免费 |
| Hono 而非 Express | 专为 Workers 设计、轻量、Zod 集成 |

---

## 二、技术栈

| 层级 | 技术 |
|------|------|
| 运行时 | Cloudflare Workers |
| 框架 | Hono 4 |
| 校验 | Zod + @hono/zod-validator |
| 数据库 | D1 (SQLite) |
| 认证 | 自实现 JWT (Web Crypto API, HS256) |
| 密码 | SHA-256 (Web Crypto API) |
| 语言 | TypeScript 5 |

---

## 三、数据库设计

```
users ──< presets ──< preset_likes
  │         │
  │         ├────< preset_favorites
  │         └────< preset_comments
  └─────────────────┘
```

### `users`
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID |
| email | TEXT UNIQUE | 邮箱 |
| username | TEXT UNIQUE | 用户名（字母/数字/下划线/中文） |
| password_hash | TEXT | SHA-256 |
| avatar_url | TEXT? | 头像 |
| created_at | TEXT | ISO 8601 |
| updated_at | TEXT | ISO 8601 |

### `presets`
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID |
| user_id | TEXT FK | 创建者 |
| name | TEXT | 预设名称 |
| expression | TEXT | 数学表达式 |
| variables | TEXT? | JSON: `{"x":"-10,10"}` |
| is_2d | INTEGER | 1=2D, 0=3D |
| category | TEXT? | 分类 |
| notes | TEXT? | 备注 |
| is_public | INTEGER | 0=私有, 1=公开 |
| theme | TEXT? | 主题 |
| view_config | TEXT? | JSON 视角配置 |

### `preset_likes` / `preset_favorites` / `preset_comments`
点赞、收藏、评论表——标准的多对多/一对多关系。

---

## 四、API 文档

> 基础 URL：`https://functor-api.workers.dev`
> 认证：Header `Authorization: Bearer <JWT>`
> 响应格式：`{ "success": true/false, "data": ..., "error": "..." }`

### 健康检查
```
GET /api/health
→ { success: true, data: { status: "ok", version: "1.0.0" } }
```

### 认证
| 方法 | 路径 | 认证 | 说明 |
|------|------|:----:|------|
| POST | /api/auth/register | - | 注册（email, username, password） |
| POST | /api/auth/login | - | 登录 → 返回 JWT |
| GET | /api/auth/me | ✅ | 获取当前用户 |

### 预设
| 方法 | 路径 | 认证 | 说明 |
|------|------|:----:|------|
| GET | /api/presets | - | 公开列表（?page=1&limit=20&search=&category=&sort=latest） |
| GET | /api/presets/categories | - | 所有分类 |
| GET | /api/presets/mine | ✅ | 我的预设（含私有） |
| GET | /api/presets/:id | - | 详情（已登录返回 is_liked/is_favorited） |
| POST | /api/presets | ✅ | 创建 |
| PUT | /api/presets/:id | ✅ | 更新（仅作者） |
| DELETE | /api/presets/:id | ✅ | 删除（仅作者） |

### 社区
| 方法 | 路径 | 认证 | 说明 |
|------|------|:----:|------|
| POST | /api/social/like/:presetId | ✅ | 点赞 toggle → `{liked, count}` |
| POST | /api/social/favorite/:presetId | ✅ | 收藏 toggle → `{favorited}` |
| GET | /api/social/favorites | ✅ | 我的收藏 |
| GET | /api/social/comments/:presetId | - | 评论列表 |
| POST | /api/social/comments/:presetId | ✅ | 发表评论 |
| DELETE | /api/social/comments/:commentId | ✅ | 删除评论（仅作者） |

### 示例请求

```bash
# 注册
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"tester","password":"123456"}'

# 登录（保存 TOKEN）
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# 创建预设
curl -X POST http://localhost:8787/api/presets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"正弦波","expression":"sin(x)","is_2d":true,"is_public":true}'

# 获取广场
curl "http://localhost:8787/api/presets?sort=popular&page=1"

# 点赞
curl -X POST http://localhost:8787/api/social/like/<preset-id> \
  -H "Authorization: Bearer $TOKEN"
```

---

## 五、项目结构

```
workers/
├── wrangler.toml              # CF Workers 配置（D1 绑定 + 环境变量）
├── package.json               # 依赖 (hono, zod, drizzle-orm)
├── tsconfig.json
├── migrations/
│   └── 0001_initial.sql       # D1 Schema（5 张表 + 索引）
└── src/
    ├── index.ts               # Hono 入口（CORS + 路由挂载 + 错误处理）
    ├── types.ts               # TS 类型（User, Preset, ApiResponse, Env...）
    ├── middleware/
    │   └── auth.ts            # JWT 自实现（signJwt / verifyJwt / authMiddleware）
    └── routes/
        ├── auth.ts            # 注册 + 登录 + 获取当前用户
        ├── presets.ts         # CRUD + 公开列表（分页/搜索/分类/排序）
        └── social.ts          # 点赞/收藏 toggle + 评论 CRUD
```

**总代码量**：~800 行 TypeScript + SQL。

---

## 六、本地开发

```bash
cd workers/
npm install

# 创建本地 D1 数据库
npx wrangler d1 create functor-db
# → 将输出的 database_id 填入 wrangler.toml

# 执行迁移
npx wrangler d1 migrations apply functor-db --local

# 启动
npm run dev
# → http://localhost:8787
```

---

## 七、部署上线

```bash
cd workers/

# 1. 创建远程 D1
npx wrangler d1 create functor-db
# → 将 database_id 替换 wrangler.toml 中的值

# 2. 远程迁移
npx wrangler d1 migrations apply functor-db --remote

# 3. 设置生产密钥
npx wrangler secret put JWT_SECRET
# → 输入 64 字符以上的随机字符串

# 4. 部署
npm run deploy
# → https://functor-api.<subdomain>.workers.dev

# 5. 前端配置
# 在 vibe/.env 添加: VITE_API_URL=https://functor-api.<subdomain>.workers.dev
```

---

## 八、免费额度

| 资源 | 免费 | 够用 |
|------|------|:--:|
| Workers 请求 | 10 万次/天 | ~1 万日活 |
| D1 存储 | 5 GB | 无限 |
| D1 读取 | 500 万行/月 | ~10 万用户 |
| D1 写入 | 100 万行/月 | ~5 万用户 |

> 超量后 Workers Paid $5/月（1000 万次/月），D1 按量极低。

---

## 九、前端接入

```javascript
// src/api/client.js
const API = import.meta.env.VITE_API_URL || 'http://localhost:8787';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
    ...options,
  });
  return res.json();
}

// 使用
const presets = await api('/api/presets?page=1&sort=popular');
const user = await api('/api/auth/me');
```

---

## 十、安全

| 项目 | 实现 |
|------|------|
| 密码 | SHA-256（生产建议 bcryptjs WASM） |
| JWT | HS256 via Web Crypto API |
| SQL 注入 | 参数化查询 |
| CORS | 白名单域名 |
| 输入验证 | Zod schema |
| 所有权 | 更新/删除前检查 user_id |

### 生产改进建议
1. 密码升级为 bcryptjs WASM
2. JWT 添加 exp + refresh token
3. Cloudflare Rate Limiting
4. 评论 XSS 过滤
5. 数据定期导出备份

---

## 十一、命令速查

```bash
npm run dev                    # 本地开发
npm run deploy                 # 部署
npx wrangler d1 migrations apply functor-db --local   # 本地迁移
npx wrangler d1 migrations apply functor-db --remote  # 远程迁移
npx wrangler secret put JWT_SECRET                    # 设置密钥
npx wrangler tail              # 实时日志
npx wrangler d1 export functor-db --remote --output=backup.sql  # 备份
```

---

## FAQ

**D1 vs Supabase？** D1 无冷启动、Workers 原生、中国快。Supabase 自带 Auth/Realtime，但中国慢且有 7 天暂停。

**需要 OAuth？** 当前是邮箱注册。OAuth 可通过 Cloudflare Access 或 Supabase Auth（只接 Auth）扩展。

**超免费额度？** Workers Paid $5/月，D1 极低按量。过渡无缝。

*📌 本文档随开发进度更新。*
