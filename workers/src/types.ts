// Functor API 类型定义

// ---- 用户 ----
export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type UserPublic = Omit<User, 'password_hash'>;

// ---- 预设 ----
export interface Preset {
  id: string;
  user_id: string;
  name: string;
  expression: string;
  variables: string | null;
  is_2d: number;
  category: string | null;
  notes: string | null;
  is_public: number;
  theme: string | null;
  view_config: string | null;
  created_at: string;
  updated_at: string;
}

export type PresetWithUser = Preset & {
  username: string;
  avatar_url: string | null;
  like_count: number;
  comment_count: number;
};

// ---- 互动 ----
export interface PresetLike {
  user_id: string;
  preset_id: string;
  created_at: string;
}

export interface PresetFavorite {
  user_id: string;
  preset_id: string;
  created_at: string;
}

export interface PresetComment {
  id: string;
  user_id: string;
  preset_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type CommentWithUser = PresetComment & {
  username: string;
  avatar_url: string | null;
};

// ---- 请求 ----
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreatePresetRequest {
  name: string;
  expression: string;
  variables?: string;
  is_2d?: boolean;
  category?: string;
  notes?: string;
  is_public?: boolean;
  theme?: string;
  view_config?: string;
}

export type UpdatePresetRequest = Partial<CreatePresetRequest>;

export interface CreateCommentRequest {
  content: string;
}

// ---- 响应 ----
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ---- JWT ----
export interface JwtPayload {
  user_id: string;
  email: string;
  iat?: number;
  exp?: number;
}

// ---- Cloudflare 环境 ----
export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
}
