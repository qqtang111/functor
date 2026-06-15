// Functor API — Cloudflare Pages Functions
// 路由: /api/*
// 与前端同域部署，无 CORS 问题

import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { cors } from 'hono/cors';
import { authRoutes } from '../../workers/src/routes/auth';
import { presetRoutes } from '../../workers/src/routes/presets';
import { socialRoutes } from '../../workers/src/routes/social';
import type { Env } from '../../workers/src/types';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: (origin) => origin,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

app.get('/api/health', (c) => {
  return c.json({
    success: true,
    data: { status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' },
  });
});

app.route('/api/auth', authRoutes);
app.route('/api/presets', presetRoutes);
app.route('/api/social', socialRoutes);

app.notFound((c) => c.json({ success: false, error: '接口不存在' }, 404));
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ success: false, error: '服务器内部错误' }, 500);
});

export const onRequest = handle(app);
