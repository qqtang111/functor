// 用户认证路由
// POST /api/auth/register  — 注册
// POST /api/auth/login     — 登录
// GET  /api/auth/me        — 获取当前用户

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { signJwt, authMiddleware } from '../middleware/auth';
import type { Env, User, UserPublic, ApiResponse } from '../types';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateId(): string {
  return crypto.randomUUID();
}

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  username: z
    .string()
    .min(2, '用户名至少2个字符')
    .max(30, '用户名最多30个字符')
    .regex(/^[a-zA-Z0-9_一-鿿]+$/, '用户名只能包含字母数字下划线和中文'),
  password: z.string().min(6, '密码至少6个字符').max(100),
});

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码'),
});

const app = new Hono<{ Bindings: Env }>();

app.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, username, password } = c.req.valid('json');

  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ? OR username = ?'
  ).bind(email, username).first();

  if (existing) {
    return c.json<ApiResponse>(
      { success: false, error: '邮箱或用户名已被注册' }, 409
    );
  }

  const id = generateId();
  const passwordHash = await hashPassword(password);

  await c.env.DB.prepare(
    'INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?)'
  ).bind(id, email, username, passwordHash).run();

  const token = await signJwt({ user_id: id, email }, c.env.JWT_SECRET);

  const user: UserPublic = {
    id, email, username, avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return c.json<ApiResponse<{ user: UserPublic; token: string }>>(
    { success: true, data: { user, token } }, 201
  );
});

app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first<User>();

  if (!user) {
    return c.json<ApiResponse>({ success: false, error: '邮箱或密码错误' }, 401);
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.password_hash) {
    return c.json<ApiResponse>({ success: false, error: '邮箱或密码错误' }, 401);
  }

  const token = await signJwt(
    { user_id: user.id, email: user.email }, c.env.JWT_SECRET
  );

  const { password_hash: _, ...userPublic } = user;

  return c.json<ApiResponse<{ user: UserPublic; token: string }>>({
    success: true, data: { user: userPublic, token },
  });
});

app.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId') as string;

  const user = await c.env.DB.prepare(
    'SELECT id, email, username, avatar_url, created_at, updated_at FROM users WHERE id = ?'
  ).bind(userId).first<UserPublic>();

  if (!user) {
    return c.json<ApiResponse>({ success: false, error: '用户不存在' }, 404);
  }

  return c.json<ApiResponse<UserPublic>>({ success: true, data: user });
});

export { app as authRoutes };
