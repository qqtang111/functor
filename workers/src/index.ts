// Functor API 入口 — Cloudflare Workers + D1
// 部署: wrangler deploy
// 本地: wrangler dev

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { presetRoutes } from './routes/presets';
import { socialRoutes } from './routes/social';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use('*', cors({
  origin: (origin, c) => {
    const allowed = c.env.CORS_ORIGIN || '*';
    if (allowed === '*') return '*';
    const origins = allowed.split(',');
    return origins.includes(origin) ? origin : origins[0];
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['X-Total-Count'],
  maxAge: 86400,
}));

// 健康检查
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    data: { status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' },
  });
});

// 路由挂载
app.route('/api/auth', authRoutes);
app.route('/api/presets', presetRoutes);
app.route('/api/social', socialRoutes);

// 404
app.notFound((c) => c.json({ success: false, error: '接口不存在' }, 404));

// 全局错误处理
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ success: false, error: '服务器内部错误' }, 500);
});

export default app;
