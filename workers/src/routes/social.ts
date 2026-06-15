// 社区互动 API
// POST   /api/social/like/:presetId         — 点赞/取消
// POST   /api/social/favorite/:presetId     — 收藏/取消
// GET    /api/social/favorites              — 我的收藏（需认证）
// GET    /api/social/comments/:presetId     — 评论列表
// POST   /api/social/comments/:presetId     — 发表评论（需认证）
// DELETE /api/social/comments/:commentId    — 删除评论（需认证）

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import type { Env, ApiResponse, CommentWithUser } from '../types';

function generateId(): string {
  return crypto.randomUUID();
}

const commentSchema = z.object({
  content: z.string().min(1, '评论不能为空').max(500),
});

const app = new Hono<{ Bindings: Env }>();

// 点赞 toggle
app.post('/like/:presetId', authMiddleware, async (c) => {
  const userId = c.get('userId') as string;
  const presetId = c.req.param('presetId');

  const preset = await c.env.DB.prepare('SELECT id FROM presets WHERE id = ?')
    .bind(presetId).first();
  if (!preset) {
    return c.json<ApiResponse>({ success: false, error: '预设不存在' }, 404);
  }

  const existingLike = await c.env.DB.prepare(
    'SELECT 1 FROM preset_likes WHERE user_id = ? AND preset_id = ?'
  ).bind(userId, presetId).first();

  if (existingLike) {
    await c.env.DB.prepare(
      'DELETE FROM preset_likes WHERE user_id = ? AND preset_id = ?'
    ).bind(userId, presetId).run();

    const count = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM preset_likes WHERE preset_id = ?'
    ).bind(presetId).first<{ count: number }>();

    return c.json<ApiResponse<{ liked: boolean; count: number }>>({
      success: true, data: { liked: false, count: count?.count ?? 0 },
    });
  } else {
    await c.env.DB.prepare(
      'INSERT INTO preset_likes (user_id, preset_id) VALUES (?, ?)'
    ).bind(userId, presetId).run();

    const count = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM preset_likes WHERE preset_id = ?'
    ).bind(presetId).first<{ count: number }>();

    return c.json<ApiResponse<{ liked: boolean; count: number }>>({
      success: true, data: { liked: true, count: count?.count ?? 0 },
    });
  }
});

// 收藏 toggle
app.post('/favorite/:presetId', authMiddleware, async (c) => {
  const userId = c.get('userId') as string;
  const presetId = c.req.param('presetId');

  const preset = await c.env.DB.prepare('SELECT id FROM presets WHERE id = ?')
    .bind(presetId).first();
  if (!preset) {
    return c.json<ApiResponse>({ success: false, error: '预设不存在' }, 404);
  }

  const existingFav = await c.env.DB.prepare(
    'SELECT 1 FROM preset_favorites WHERE user_id = ? AND preset_id = ?'
  ).bind(userId, presetId).first();

  if (existingFav) {
    await c.env.DB.prepare(
      'DELETE FROM preset_favorites WHERE user_id = ? AND preset_id = ?'
    ).bind(userId, presetId).run();
    return c.json<ApiResponse<{ favorited: boolean }>>({
      success: true, data: { favorited: false },
    });
  } else {
    await c.env.DB.prepare(
      'INSERT INTO preset_favorites (user_id, preset_id) VALUES (?, ?)'
    ).bind(userId, presetId).run();
    return c.json<ApiResponse<{ favorited: boolean }>>({
      success: true, data: { favorited: true },
    });
  }
});

// 我的收藏
app.get('/favorites', authMiddleware, async (c) => {
  const userId = c.get('userId') as string;

  const result = await c.env.DB.prepare(
    `SELECT p.*, u.username, u.avatar_url
     FROM preset_favorites f
     JOIN presets p ON f.preset_id = p.id
     JOIN users u ON p.user_id = u.id
     WHERE f.user_id = ? ORDER BY f.created_at DESC`
  ).bind(userId).all();

  return c.json<ApiResponse<typeof result.results>>({
    success: true, data: result.results,
  });
});

// 获取评论
app.get('/comments/:presetId', optionalAuth, async (c) => {
  const presetId = c.req.param('presetId');

  const comments = await c.env.DB.prepare(
    `SELECT c.*, u.username, u.avatar_url
     FROM preset_comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.preset_id = ? ORDER BY c.created_at DESC LIMIT 50`
  ).bind(presetId).all<CommentWithUser>();

  return c.json<ApiResponse<CommentWithUser[]>>({
    success: true, data: comments.results,
  });
});

// 发表评论
app.post('/comments/:presetId', authMiddleware, zValidator('json', commentSchema), async (c) => {
  const userId = c.get('userId') as string;
  const presetId = c.req.param('presetId');
  const { content } = c.req.valid('json');

  const preset = await c.env.DB.prepare(
    'SELECT id FROM presets WHERE id = ? AND is_public = 1'
  ).bind(presetId).first();

  if (!preset) {
    return c.json<ApiResponse>({ success: false, error: '预设不存在或未公开' }, 404);
  }

  const id = generateId();
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO preset_comments (id, user_id, preset_id, content, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, userId, presetId, content, now, now).run();

  const comment = await c.env.DB.prepare(
    `SELECT c.*, u.username, u.avatar_url
     FROM preset_comments c JOIN users u ON c.user_id = u.id
     WHERE c.id = ?`
  ).bind(id).first<CommentWithUser>();

  return c.json<ApiResponse<CommentWithUser>>({ success: true, data: comment! }, 201);
});

// 删除评论
app.delete('/comments/:commentId', authMiddleware, async (c) => {
  const userId = c.get('userId') as string;
  const commentId = c.req.param('commentId');

  const comment = await c.env.DB.prepare(
    'SELECT user_id FROM preset_comments WHERE id = ?'
  ).bind(commentId).first<{ user_id: string }>();

  if (!comment) {
    return c.json<ApiResponse>({ success: false, error: '评论不存在' }, 404);
  }
  if (comment.user_id !== userId) {
    return c.json<ApiResponse>({ success: false, error: '无权删除他人评论' }, 403);
  }

  await c.env.DB.prepare('DELETE FROM preset_comments WHERE id = ?')
    .bind(commentId).run();

  return c.json<ApiResponse>({ success: true, data: null });
});

export { app as socialRoutes };
