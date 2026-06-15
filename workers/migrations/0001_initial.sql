-- Functor D1 数据库初始迁移
-- 用户系统 + 预设管理 + 社区互动

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 用户预设表
CREATE TABLE IF NOT EXISTS presets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  expression TEXT NOT NULL,
  variables TEXT,
  is_2d INTEGER NOT NULL DEFAULT 1,
  category TEXT,
  notes TEXT,
  is_public INTEGER NOT NULL DEFAULT 0,
  theme TEXT,
  view_config TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 点赞表
CREATE TABLE IF NOT EXISTS preset_likes (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preset_id TEXT NOT NULL REFERENCES presets(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, preset_id)
);

-- 收藏表
CREATE TABLE IF NOT EXISTS preset_favorites (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preset_id TEXT NOT NULL REFERENCES presets(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, preset_id)
);

-- 评论表
CREATE TABLE IF NOT EXISTS preset_comments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preset_id TEXT NOT NULL REFERENCES presets(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets(user_id);
CREATE INDEX IF NOT EXISTS idx_presets_public ON presets(is_public) WHERE is_public = 1;
CREATE INDEX IF NOT EXISTS idx_presets_category ON presets(category);
CREATE INDEX IF NOT EXISTS idx_presets_created ON presets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_preset ON preset_likes(preset_id);
CREATE INDEX IF NOT EXISTS idx_favorites_preset ON preset_favorites(preset_id);
CREATE INDEX IF NOT EXISTS idx_comments_preset ON preset_comments(preset_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON preset_comments(created_at DESC);
