-- ========================================================
-- SMART AI FITNESS — MOCKUP DATA FOR phpMyAdmin / MySQL
-- โค้ด SQL สำหรับสร้างข้อมูลจำลอง (Mockup Data) ผู้ใช้งานและคะแนนออกกำลังกาย
-- ฐานข้อมูล: dance_detector
-- ========================================================

USE `dance_detector`;

-- 1. เพิ่มข้อมูลผู้ใช้งานจำลอง (Mockup Fitness Athletes)
-- รหัสผ่านเริ่มต้นสำหรับผู้ใช้ที่มีบัญชี: adminpassword123 ($2b$12$tpR6hHLGOhWzpNmPixNoMey2KaHpgcRJnFUvzr6DiGhO1O/fxPi8a)
INSERT INTO `users` (`username`, `email`, `password_hash`, `display_name`, `role`, `is_guest`, `weight`, `height`, `created_at`) VALUES
('coach_alex', 'alex@fitness.ai', '$2b$12$tpR6hHLGOhWzpNmPixNoMey2KaHpgcRJnFUvzr6DiGhO1O/fxPi8a', 'Coach Alex 🏋️‍♂️', 'player', 0, 75.0, 180.0, NOW() - INTERVAL 10 DAY),
('sarah_fit', 'sarah@fitness.ai', '$2b$12$tpR6hHLGOhWzpNmPixNoMey2KaHpgcRJnFUvzr6DiGhO1O/fxPi8a', 'Sarah Power 🔥', 'player', 0, 54.0, 165.0, NOW() - INTERVAL 9 DAY),
('iron_mike', 'mike@fitness.ai', '$2b$12$tpR6hHLGOhWzpNmPixNoMey2KaHpgcRJnFUvzr6DiGhO1O/fxPi8a', 'Iron Mike 💪', 'player', 0, 82.0, 178.0, NOW() - INTERVAL 8 DAY),
('emily_r', 'emily@fitness.ai', '$2b$12$tpR6hHLGOhWzpNmPixNoMey2KaHpgcRJnFUvzr6DiGhO1O/fxPi8a', 'Emily Runner 🏃‍♀️', 'player', 0, 51.0, 162.0, NOW() - INTERVAL 7 DAY),
('kenji_k', 'kenji@fitness.ai', '$2b$12$tpR6hHLGOhWzpNmPixNoMey2KaHpgcRJnFUvzr6DiGhO1O/fxPi8a', 'Kenji Workout ⚡', 'player', 0, 68.0, 174.0, NOW() - INTERVAL 6 DAY),
('somchai99', 'somchai@fitness.ai', '$2b$12$tpR6hHLGOhWzpNmPixNoMey2KaHpgcRJnFUvzr6DiGhO1O/fxPi8a', 'สมชาย สายฟิต ⭐', 'player', 0, 67.0, 171.0, NOW() - INTERVAL 5 DAY),
('ploy_healthy', 'ploy@fitness.ai', '$2b$12$tpR6hHLGOhWzpNmPixNoMey2KaHpgcRJnFUvzr6DiGhO1O/fxPi8a', 'น้องพลอย Healthy 🥗', 'player', 0, 48.0, 158.0, NOW() - INTERVAL 4 DAY),
('david_beast', 'david@fitness.ai', '$2b$12$tpR6hHLGOhWzpNmPixNoMey2KaHpgcRJnFUvzr6DiGhO1O/fxPi8a', 'David Beast Mode 💥', 'player', 0, 86.0, 184.0, NOW() - INTERVAL 3 DAY),
('lisa_core', 'lisa@fitness.ai', '$2b$12$tpR6hHLGOhWzpNmPixNoMey2KaHpgcRJnFUvzr6DiGhO1O/fxPi8a', 'Lisa Core Pro 🧘‍♀️', 'player', 0, 52.0, 166.0, NOW() - INTERVAL 2 DAY),
('natthawut_c', 'nat@fitness.ai', '$2b$12$tpR6hHLGOhWzpNmPixNoMey2KaHpgcRJnFUvzr6DiGhO1O/fxPi8a', 'ณัฐวุฒิ Crossfit 🥇', 'player', 0, 72.0, 175.0, NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE `display_name` = VALUES(`display_name`), `weight` = VALUES(`weight`), `height` = VALUES(`height`);

-- 2. เพิ่มประวัติคะแนนสำหรับท่า Squats (Bodyweight Squats)
INSERT INTO `scores` (`user_id`, `pose_key`, `score`, `count`, `pose_accuracy_details`, `created_at`)
SELECT id, 'squats', 3850, 52, JSON_OBJECT('avg_accuracy', 97.4, 'max_reps', 52, 'calories', 135), NOW() - INTERVAL 1 DAY FROM users WHERE username = 'coach_alex'
UNION ALL
SELECT id, 'squats', 3420, 46, JSON_OBJECT('avg_accuracy', 95.1, 'max_reps', 46, 'calories', 142), NOW() - INTERVAL 2 DAY FROM users WHERE username = 'iron_mike'
UNION ALL
SELECT id, 'squats', 2950, 40, JSON_OBJECT('avg_accuracy', 96.8, 'max_reps', 40, 'calories', 98), NOW() - INTERVAL 1 DAY FROM users WHERE username = 'sarah_fit'
UNION ALL
SELECT id, 'squats', 2550, 35, JSON_OBJECT('avg_accuracy', 93.5, 'max_reps', 35, 'calories', 105), NOW() - INTERVAL 3 DAY FROM users WHERE username = 'kenji_k'
UNION ALL
SELECT id, 'squats', 2180, 30, JSON_OBJECT('avg_accuracy', 91.2, 'max_reps', 30, 'calories', 90), NOW() - INTERVAL 4 DAY FROM users WHERE username = 'somchai99'
UNION ALL
SELECT id, 'squats', 1850, 26, JSON_OBJECT('avg_accuracy', 94.0, 'max_reps', 26, 'calories', 65), NOW() - INTERVAL 2 DAY FROM users WHERE username = 'ploy_healthy';

-- 3. เพิ่มประวัติคะแนนสำหรับท่า Jumping Jacks (กระโดดตบ)
INSERT INTO `scores` (`user_id`, `pose_key`, `score`, `count`, `pose_accuracy_details`, `created_at`)
SELECT id, 'jumping_jacks', 5200, 125, JSON_OBJECT('avg_accuracy', 98.2, 'max_reps', 125, 'calories', 145), NOW() - INTERVAL 1 DAY FROM users WHERE username = 'emily_r'
UNION ALL
SELECT id, 'jumping_jacks', 4400, 105, JSON_OBJECT('avg_accuracy', 96.5, 'max_reps', 105, 'calories', 130), NOW() - INTERVAL 2 DAY FROM users WHERE username = 'sarah_fit'
UNION ALL
SELECT id, 'jumping_jacks', 3800, 90, JSON_OBJECT('avg_accuracy', 94.7, 'max_reps', 90, 'calories', 152), NOW() - INTERVAL 3 DAY FROM users WHERE username = 'coach_alex'
UNION ALL
SELECT id, 'jumping_jacks', 3350, 80, JSON_OBJECT('avg_accuracy', 92.0, 'max_reps', 80, 'calories', 160), NOW() - INTERVAL 4 DAY FROM users WHERE username = 'david_beast'
UNION ALL
SELECT id, 'jumping_jacks', 3100, 75, JSON_OBJECT('avg_accuracy', 95.3, 'max_reps', 75, 'calories', 88), NOW() - INTERVAL 2 DAY FROM users WHERE username = 'lisa_core'
UNION ALL
SELECT id, 'jumping_jacks', 2700, 65, JSON_OBJECT('avg_accuracy', 93.1, 'max_reps', 65, 'calories', 95), NOW() - INTERVAL 5 DAY FROM users WHERE username = 'somchai99';

-- 4. เพิ่มประวัติคะแนนสำหรับท่า High Knees (ยกเข่าสูง)
INSERT INTO `scores` (`user_id`, `pose_key`, `score`, `count`, `pose_accuracy_details`, `created_at`)
SELECT id, 'high_knees', 4600, 98, JSON_OBJECT('avg_accuracy', 97.5, 'max_reps', 98, 'calories', 128), NOW() - INTERVAL 1 DAY FROM users WHERE username = 'emily_r'
UNION ALL
SELECT id, 'high_knees', 3900, 82, JSON_OBJECT('avg_accuracy', 94.0, 'max_reps', 82, 'calories', 125), NOW() - INTERVAL 2 DAY FROM users WHERE username = 'kenji_k'
UNION ALL
SELECT id, 'high_knees', 3450, 72, JSON_OBJECT('avg_accuracy', 92.8, 'max_reps', 72, 'calories', 110), NOW() - INTERVAL 3 DAY FROM users WHERE username = 'somchai99'
UNION ALL
SELECT id, 'high_knees', 3100, 65, JSON_OBJECT('avg_accuracy', 91.5, 'max_reps', 65, 'calories', 108), NOW() - INTERVAL 2 DAY FROM users WHERE username = 'natthawut_c'
UNION ALL
SELECT id, 'high_knees', 2850, 60, JSON_OBJECT('avg_accuracy', 95.0, 'max_reps', 60, 'calories', 72), NOW() - INTERVAL 4 DAY FROM users WHERE username = 'lisa_core'
UNION ALL
SELECT id, 'high_knees', 2400, 50, JSON_OBJECT('avg_accuracy', 93.2, 'max_reps', 50, 'calories', 58), NOW() - INTERVAL 1 DAY FROM users WHERE username = 'ploy_healthy';

-- 5. เพิ่มประวัติคะแนนสำหรับท่า Bicep Curls (ดัมเบลยกแขน)
INSERT INTO `scores` (`user_id`, `pose_key`, `score`, `count`, `pose_accuracy_details`, `created_at`)
SELECT id, 'bicep_curls', 4300, 64, JSON_OBJECT('avg_accuracy', 96.1, 'max_reps', 64, 'calories', 112), NOW() - INTERVAL 1 DAY FROM users WHERE username = 'iron_mike'
UNION ALL
SELECT id, 'bicep_curls', 3850, 58, JSON_OBJECT('avg_accuracy', 93.8, 'max_reps', 58, 'calories', 118), NOW() - INTERVAL 2 DAY FROM users WHERE username = 'david_beast'
UNION ALL
SELECT id, 'bicep_curls', 3400, 50, JSON_OBJECT('avg_accuracy', 95.5, 'max_reps', 50, 'calories', 85), NOW() - INTERVAL 3 DAY FROM users WHERE username = 'coach_alex'
UNION ALL
SELECT id, 'bicep_curls', 2900, 42, JSON_OBJECT('avg_accuracy', 92.0, 'max_reps', 42, 'calories', 70), NOW() - INTERVAL 1 DAY FROM users WHERE username = 'natthawut_c'
UNION ALL
SELECT id, 'bicep_curls', 2450, 36, JSON_OBJECT('avg_accuracy', 90.4, 'max_reps', 36, 'calories', 58), NOW() - INTERVAL 4 DAY FROM users WHERE username = 'kenji_k';

-- 6. เพิ่มประวัติคะแนนสำหรับท่า Shoulder Press (ดัมเบลยกลอยเหนือไหล่)
INSERT INTO `scores` (`user_id`, `pose_key`, `score`, `count`, `pose_accuracy_details`, `created_at`)
SELECT id, 'shoulder_press', 3900, 48, JSON_OBJECT('avg_accuracy', 95.0, 'max_reps', 48, 'calories', 98), NOW() - INTERVAL 2 DAY FROM users WHERE username = 'iron_mike'
UNION ALL
SELECT id, 'shoulder_press', 3550, 44, JSON_OBJECT('avg_accuracy', 93.2, 'max_reps', 44, 'calories', 102), NOW() - INTERVAL 1 DAY FROM users WHERE username = 'david_beast'
UNION ALL
SELECT id, 'shoulder_press', 3200, 40, JSON_OBJECT('avg_accuracy', 96.0, 'max_reps', 40, 'calories', 78), NOW() - INTERVAL 3 DAY FROM users WHERE username = 'coach_alex'
UNION ALL
SELECT id, 'shoulder_press', 2650, 32, JSON_OBJECT('avg_accuracy', 91.8, 'max_reps', 32, 'calories', 56), NOW() - INTERVAL 2 DAY FROM users WHERE username = 'natthawut_c'
UNION ALL
SELECT id, 'shoulder_press', 2300, 28, JSON_OBJECT('avg_accuracy', 94.5, 'max_reps', 28, 'calories', 42), NOW() - INTERVAL 4 DAY FROM users WHERE username = 'sarah_fit';

-- 7. เพิ่มประวัติคะแนนสำหรับท่า Standing Crunches (ยืนแทงเข่าเกร็งหน้าท้อง)
INSERT INTO `scores` (`user_id`, `pose_key`, `score`, `count`, `pose_accuracy_details`, `created_at`)
SELECT id, 'standing_crunches', 4200, 72, JSON_OBJECT('avg_accuracy', 97.2, 'max_reps', 72, 'calories', 115), NOW() - INTERVAL 1 DAY FROM users WHERE username = 'lisa_core'
UNION ALL
SELECT id, 'standing_crunches', 3650, 62, JSON_OBJECT('avg_accuracy', 95.8, 'max_reps', 62, 'calories', 96), NOW() - INTERVAL 2 DAY FROM users WHERE username = 'sarah_fit'
UNION ALL
SELECT id, 'standing_crunches', 3150, 54, JSON_OBJECT('avg_accuracy', 94.1, 'max_reps', 54, 'calories', 82), NOW() - INTERVAL 3 DAY FROM users WHERE username = 'emily_r'
UNION ALL
SELECT id, 'standing_crunches', 2800, 48, JSON_OBJECT('avg_accuracy', 93.5, 'max_reps', 48, 'calories', 90), NOW() - INTERVAL 1 DAY FROM users WHERE username = 'coach_alex'
UNION ALL
SELECT id, 'standing_crunches', 2350, 40, JSON_OBJECT('avg_accuracy', 91.0, 'max_reps', 40, 'calories', 52), NOW() - INTERVAL 4 DAY FROM users WHERE username = 'ploy_healthy';
