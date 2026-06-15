// 预设管理 API
// GET    /api/presets          — 公开预设列表（分页 搜索 分类）
// GET    /api/presets/categories — 所有分类
// GET    /api/presets/mine     — 我的预设（需认证）
// GET    /api/presets/:id      — 预设详情
// POST   /api/presets          — 创建预设（需认证）
// PUT    /api/presets/:id      — 更新预设（需认证 仅作者）
// DELETE /api/presets/:id      — 删除预设（需认证 仅作者）

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth';
import type {
  Env, Preset, PresetWithUser, ApiResponse, PaginatedResponse,
} from '../types';

function generateId(): string {
  return crypto.randomUUID();
}

const createPresetSchema = z.object({
  name: z.string().min(1).max(100),
  expression: z.string().min(1),
  variables: z.string().optional(),
  is_2d: z.boolean().optional().default(true),
  category: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  is_public: z.boolean().optional().default(false),
  theme: z.string().max(50).optional(),
  view_config: z.string().optional(),
});

const updatePresetSchema = createPresetSchema.partial();

const app = new Hono<{ Bindings: Env }>();

// 公开预设列表
app.get('/', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20')));
  const search = c.req.query('search') || '';
  const category = c.req.query('category') || '';
  const sort = c.req.query('sort') || 'latest';

  const offset = (page - 1) * limit;
  let where = 'WHERE p.is_public = 1';
  const params: string[] = [];

  if (search) {
    where += ' AND (p.name LIKE ? OR p.expression LIKE ? OR p.notes LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q);
  }
  if (category) {
    where += ' AND p.category = ?';
    params.push(category);
  }

  const orderBy = sort === 'popular'
    ? 'ORDER BY like_count DESC, p.created_at DESC'
    : 'ORDER BY p.created_at DESC';

  const totalResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM presets p ${where}`
  ).bind(...params).first<{ total: number }>();

  const data = await c.env.DB.prepare(
    `SELECT p.*, u.username, u.avatar_url,
      COALESCE(l.like_count, 0) as like_count,
      COALESCE(c.comment_count, 0) as comment_count
     FROM presets p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN (SELECT preset_id, COUNT(*) as like_count FROM preset_likes GROUP BY preset_id) l ON p.id = l.preset_id
     LEFT JOIN (SELECT preset_id, COUNT(*) as comment_count FROM preset_comments GROUP BY preset_id) c ON p.id = c.preset_id
     ${where} ${orderBy} LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all<PresetWithUser>();

  return c.json<ApiResponse<PaginatedResponse<PresetWithUser>>>({
    success: true,
    data: {
      data: data.results, total: totalResult?.total ?? 0,
      page, limit, has_more: offset + limit < (totalResult?.total ?? 0),
    },
  });
});

// 分类列表
app.get('/categories', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT DISTINCT category FROM presets
     WHERE is_public = 1 AND category IS NOT NULL AND category != ''
     ORDER BY category`
  ).all<{ category: string }>();

  return c.json<ApiResponse<string[]>>({
    success: true, data: result.results.map(r => r.category),
  });
});

// 我的预设
app.get('/mine', authMiddleware, async (c) => {
  const userId = c.get('userId') as string;

  const result = await c.env.DB.prepare(
    `SELECT p.*, u.username, u.avatar_url,
      COALESCE(l.like_count, 0) as like_count,
      COALESCE(c.comment_count, 0) as comment_count
     FROM presets p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN (SELECT preset_id, COUNT(*) as like_count FROM preset_likes GROUP BY preset_id) l ON p.id = l.preset_id
     LEFT JOIN (SELECT preset_id, COUNT(*) as comment_count FROM preset_comments GROUP BY preset_id) c ON p.id = c.preset_id
     WHERE p.user_id = ? ORDER BY p.updated_at DESC`
  ).bind(userId).all<PresetWithUser>();

  return c.json<ApiResponse<PresetWithUser[]>>({
    success: true, data: result.results,
  });
});

// 预设详情
app.get('/:id', async (c) => {
  const presetId = c.req.param('id');

  const preset = await c.env.DB.prepare(
    `SELECT p.*, u.username, u.avatar_url,
      COALESCE(l.like_count, 0) as like_count,
      COALESCE(c.comment_count, 0) as comment_count
     FROM presets p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN (SELECT preset_id, COUNT(*) as like_count FROM preset_likes GROUP BY preset_id) l ON p.id = l.preset_id
     LEFT JOIN (SELECT preset_id, COUNT(*) as comment_count FROM preset_comments GROUP BY preset_id) c ON p.id = c.preset_id
     WHERE p.id = ?`
  ).bind(presetId).first<PresetWithUser>();

  if (!preset) {
    return c.json<ApiResponse>({ success: false, error: '预设不存在' }, 404);
  }

  const userId = c.get('userId') as string | undefined;
  let is_liked = false, is_favorited = false;

  if (userId) {
    const like = await c.env.DB.prepare(
      'SELECT 1 FROM preset_likes WHERE user_id = ? AND preset_id = ?'
    ).bind(userId, presetId).first();
    is_liked = !!like;

    const fav = await c.env.DB.prepare(
      'SELECT 1 FROM preset_favorites WHERE user_id = ? AND preset_id = ?'
    ).bind(userId, presetId).first();
    is_favorited = !!fav;
  }

  return c.json<ApiResponse<PresetWithUser & { is_liked: boolean; is_favorited: boolean }>>({
    success: true, data: { ...preset, is_liked, is_favorited },
  });
});

// 创建预设
app.post('/', authMiddleware, zValidator('json', createPresetSchema), async (c) => {
  const userId = c.get('userId') as string;
  const body = c.req.valid('json');
  const id = generateId();
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO presets (id, user_id, name, expression, variables, is_2d, category, notes, is_public, theme, view_config, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, userId, body.name, body.expression,
    body.variables ?? null, body.is_2d ? 1 : 0,
    body.category ?? null, body.notes ?? null,
    body.is_public ? 1 : 0, body.theme ?? null,
    body.view_config ?? null, now, now
  ).run();

  const preset = await c.env.DB.prepare('SELECT * FROM presets WHERE id = ?')
    .bind(id).first<Preset>();

  return c.json<ApiResponse<Preset>>({ success: true, data: preset! }, 201);
});

// 更新预设
app.put('/:id', authMiddleware, zValidator('json', updatePresetSchema), async (c) => {
  const userId = c.get('userId') as string;
  const presetId = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await c.env.DB.prepare(
    'SELECT * FROM presets WHERE id = ? AND user_id = ?'
  ).bind(presetId, userId).first();

  if (!existing) {
    return c.json<ApiResponse>({ success: false, error: '预设不存在或无权编辑' }, 403);
  }

  const now = new Date().toISOString();
  const updates: string[] = ['updated_at = ?'];
  const values: (string | number | null)[] = [now];

  if (body.name !== undefined) { updates.push('name = ?'); values.push(body.name); }
  if (body.expression !== undefined) { updates.push('expression = ?'); values.push(body.expression); }
  if (body.variables !== undefined) { updates.push('variables = ?'); values.push(body.variables); }
  if (body.is_2d !== undefined) { updates.push('is_2d = ?'); values.push(body.is_2d ? 1 : 0); }
  if (body.category !== undefined) { updates.push('category = ?'); values.push(body.category); }
  if (body.notes !== undefined) { updates.push('notes = ?'); values.push(body.notes); }
  if (body.is_public !== undefined) { updates.push('is_public = ?'); values.push(body.is_public ? 1 : 0); }
  if (body.theme !== undefined) { updates.push('theme = ?'); values.push(body.theme); }
  if (body.view_config !== undefined) { updates.push('view_config = ?'); values.push(body.view_config); }

  values.push(presetId, userId);

  await c.env.DB.prepare(
    `UPDATE presets SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
  ).bind(...values).run();

  const updated = await c.env.DB.prepare('SELECT * FROM presets WHERE id = ?')
    .bind(presetId).first<Preset>();

  return c.json<ApiResponse<Preset>>({ success: true, data: updated! });
});

// 删除预设
app.delete('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId') as string;
  const presetId = c.req.param('id');

  const existing = await c.env.DB.prepare(
    'SELECT id FROM presets WHERE id = ? AND user_id = ?'
  ).bind(presetId, userId).first();

  if (!existing) {
    return c.json<ApiResponse>({ success: false, error: '预设不存在或无权删除' }, 403);
  }

  await c.env.DB.prepare('DELETE FROM presets WHERE id = ?').bind(presetId).run();
  return c.json<ApiResponse>({ success: true, data: null });
});

export { app as presetRoutes };
