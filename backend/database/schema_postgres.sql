-- ========================================================
-- DANCE DETECTOR DATABASE SCHEMA (for PostgreSQL 15+)
-- ========================================================

-- Create Type for User Role if not exists
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('player', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- --------------------------------------------------------
-- Table structure for users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NULL,
  email VARCHAR(100) UNIQUE NULL,
  password_hash VARCHAR(255) NULL,
  display_name VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'player',
  is_guest BOOLEAN NOT NULL DEFAULT TRUE,
  weight REAL NOT NULL DEFAULT 65.0,
  height REAL NOT NULL DEFAULT 170.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [Indexing Lab Insight]: เพิ่ม Index บน display_name สำหรับค้นหาผู้เล่นตอน submit_score (หลีกเลี่ยง Seq Scan)
CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name);

-- [Indexing Lab 04/07 Insight]: หลีกเลี่ยง Single-column Index บน Low Cardinality (role มีแค่ 2 ค่า)
-- ใช้ Partial Index เจาะจงเฉพาะ role = 'admin' ช่วยประหยัดพื้นที่ดิสก์และเร็วสูงสุด
CREATE INDEX IF NOT EXISTS idx_users_admins ON users(id) WHERE role = 'admin';

-- --------------------------------------------------------
-- Table structure for scores
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pose_key VARCHAR(50) NOT NULL DEFAULT 'dab',
  score INT NOT NULL DEFAULT 0,
  count INT NOT NULL DEFAULT 0,
  pose_accuracy_details JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [Indexing Lab 01b Insight]: ทำ Index บน Foreign Key (user_id) เสมอ เพื่อเร่งความเร็ว JOIN และ Cascading Delete
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);

-- [Indexing Lab 05/06 Composite Index]: ปรับแต่งสำหรับ Leaderboard ที่ค้นหาแยกท่า (pose_key) และเรียงตามคะแนน
CREATE INDEX IF NOT EXISTS idx_scores_pose_user_score ON scores(pose_key, user_id, score DESC, count DESC);

-- สำหรับดึงประวัติการเล่นล่าสุดของแต่ละผู้เล่น (user_id + created_at)
CREATE INDEX IF NOT EXISTS idx_scores_user_created ON scores(user_id, created_at DESC);

-- Index ทั่วไปเดิม
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at);

-- --------------------------------------------------------
-- Table structure for user_sessions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(100) PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [Indexing Lab Insight]: เพิ่ม Index บน FK user_id และ expires_at สำหรับตรวจสอบ Session หมดอายุ
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);

