// JWT 认证中间件
// 纯 Web Crypto API 实现，零外部依赖

import type { Context, Next } from 'hono';
import type { JwtPayload, Env } from '../types';

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

async function hmacSign(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(data)
  );
  return base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );
}

// 生成 JWT
export async function signJwt(
  payload: Omit<JwtPayload, 'iat'>,
  secret: string
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = await hmacSign(secret, `${headerB64}.${payloadB64}`);

  return `${headerB64}.${payloadB64}.${signature}`;
}

// 验证 JWT
export async function verifyJwt(
  token: string,
  secret: string
): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const expectedSig = await hmacSign(secret, `${headerB64}.${payloadB64}`);

    if (signatureB64 !== expectedSig) return null;

    const payload: JwtPayload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// 必须认证
export async function authMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: '未提供认证令牌' }, 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyJwt(token, c.env.JWT_SECRET);

  if (!payload) {
    return c.json({ success: false, error: '认证令牌无效或已过期' }, 401);
  }

  c.set('userId', payload.user_id);
  c.set('userEmail', payload.email);
  await next();
}

// 可选认证
export async function optionalAuth(
  c: Context<{ Bindings: Env }>,
  next: Next
): Promise<void> {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = await verifyJwt(token, c.env.JWT_SECRET);
    if (payload) {
      c.set('userId', payload.user_id);
      c.set('userEmail', payload.email);
    }
  }
  await next();
}
