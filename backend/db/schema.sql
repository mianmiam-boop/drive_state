-- schema.sql
-- PostgreSQL schema for driver_state_analysis system
-- 使用方式: psql -U postgres -d driver_state_analysis -f schema.sql

-- 可选：启用扩展（用于 JSONB、加密函数等）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- users 表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- detection_records 表
CREATE TABLE IF NOT EXISTS detection_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  detection_type VARCHAR(50) NOT NULL, -- 'image' 或 'video'
  file_path TEXT NOT NULL,
  file_name TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- analysis_results 表
CREATE TABLE IF NOT EXISTS analysis_results (
  id SERIAL PRIMARY KEY,
  detection_id INTEGER NOT NULL REFERENCES detection_records(id) ON DELETE CASCADE,
  result JSONB NOT NULL, -- 存储模型返回的 JSON 结果
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 索引（按需）
CREATE INDEX IF NOT EXISTS idx_detection_user_id ON detection_records(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_detection_id ON analysis_results(detection_id);

-- 示例：确保至少有一个schema版本记录（可选）
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);