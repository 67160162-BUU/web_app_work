# 📋 รายงานสรุปการเปลี่ยนแปลงครั้งที่ 1 (Update 1 Changelog)
**โครงการ:** Smart AI Fitness — On-Device AI Workout Coach & Routine Tracker  
**วันที่บันทึก:** 3 ตุลาคม 2026  
**สถานะ:** บันทึกการเปลี่ยนแปลงบนเครื่อง Mac (Local Working Tree — เตรียมพร้อมสำหรับ Commit & Push)

---

## 🌟 ภาพรวมความคืบหน้าสำคัญ (Key Highlights)

การอัปเดตครั้งนี้มุ่งเน้นการยกระดับ 3 เสาหลักของระบบ:
1. **AI Pose Detection & Biomechanics Engine (ความแม่นยำโมเดล):** ปรับจูนระบบตรวจจับโครงสร้างร่างกาย 33 จุด (MediaPipe Pose) และ State Machine นับรอบให้จำท่าทางและนับครั้งได้อย่างแม่นยำสูง ไร้ปัญหา Ghost Reps
2. **Sandbox Mode (โหมดฝึกซ้อมอิสระ):** เพิ่มฟีเจอร์ให้ผู้ใช้ปรับแต่งเป้าหมาย Reps, Sets, เวลาพัก (Rest Time) สำหรับท่าเดี่ยว (Single Focus) หรือออกแบบผสมท่าฝึกเอง (Custom Routine Builder)
3. **Database Performance & Indexing Optimization:** ปรับแต่ง Index ในฐานข้อมูล (MySQL & PostgreSQL) โดยอ้างอิงผลลัพธ์จาก Indexing Lab ช่วยลดเวลาคิวรี Leaderboard และลดการทำ Sequential Scan

---

## 🔍 รายละเอียดการเปลี่ยนแปลงแยกตามโมดูล

### 1. โมเดล AI และความแม่นยำในการนับท่าทาง (AI Engine & Accuracy)
- **ปรับปรุง State Machine Hysteresis:** ป้องกันการนับเบิ้ลหรือนับหลอก โดยต้องผ่านเกณฑ์มุมองศาต่ำสุด (Peak Contraction) และกลับสู่ท่ายืนตรง (Full Extension) อย่างชัดเจน
- **Biomechanical Angle & Torso Verification:** 
  - เพิ่มการตรวจสอบองศาลำตัว (Torso Tilt) ในท่า Squats ไม่ให้เอนเกินเกณฑ์
  - เพิ่มเกณฑ์ตรวจสอบระยะข้อต่อและความชัดเจนของพิกัด (`minVisibility >= 0.5`) ใน `common.js` เพื่อตัดปัญหาจุด Landmark สั่นไหว
- **Smoothing Buffer:** เพิ่ม Hermite Interpolation และ Rolling Average กรอง Noise พิกัดข้อต่อ ทำให้การวิเคราะห์ฟอร์มลื่นไหล ไม่กระตุก

### 2. โหมดฝึกซ้อม Sandbox (Frontend & UX)
- **Single Exercise Focus:** ผู้ใช้สามารถเลือกฝึกเฉพาะท่าที่ต้องการ พร้อมปรับ:
  - Target Reps (1 - 100 ครั้ง)
  - Sets (1 - 10 เซ็ต)
  - Rest Duration (0 - 120 วินาที ปรับเป็น 0 วิ เพื่อฝึกต่อเนื่องได้)
- **Custom Routine Builder:** รองรับการจัดชุดท่าฝึกผสมเอง เรียงลำดับท่าได้ตามใจชอบ พร้อมคำนวณสถิติภาพรวม:
  - จำนวนท่าทั้งหมด (Total Exercises)
  - จำนวนเซ็ตรวม (Total Sets)
  - จำนวนครั้งรวม (Total Reps)
  - ประเมินแคลอรี่ที่เผาผลาญล่วงหน้า (Real-time Estimated Calories จากสูตร MET x น้ำหนักตัวจริง)
- **Dynamic Course Creation:** เพิ่มฟังก์ชัน `createCustomCourse()` ใน `frontend/js/config.js` เพื่อแปลงค่าจาก Sandbox เป็นคอร์สฝึกส่งให้ `WorkoutRoutineManager` รันได้ทันที
- **Navigation & Flow Improvement:** 
  - เพิ่มปุ่มกลับไปยังหน้า Sandbox / หน้าเลือกคอร์สเดิมหลังฝึกจบ หรือกดยกเลิก
  - ปรับปรุงการล้าง Memory กล้องและลูปประมวลผลเมื่อออกจากการฝึก
  - เพิ่มทางลัดเข้าสู่ Sandbox บน Hero Section ของหน้าหลัก

### 3. ประสิทธิภาพฐานข้อมูล (Database & Indexing Optimization)
- **Backend Models (`backend/app/models.py`):**
  - เพิ่ม B-Tree Index บนคอลัมน์ `display_name` ของโมเดล `User` เพื่อเร่งความเร็วการค้นหาชื่อผู้เล่น
  - เพิ่ม Index บน Foreign Key `user_id` ในตาราง `scores` และ `user_sessions` ป้องกัน Full Table Scan เมื่อ JOIN หรือทำ Cascading Delete
  - สร้าง **Composite Index** `idx_scores_pose_user_score` (`pose_key`, `user_id`, `score`, `count`) รองรับการดึงข้อมูล Leaderboard แยกตามท่าได้อย่างรวดเร็ว
  - เพิ่ม Composite Index `idx_scores_user_created` (`user_id`, `created_at`) เพื่อดึงประวัติการเล่นล่าสุดของผู้ใช้
- **Database Schemas (`backend/database/schema.sql`, `schema_postgres.sql`):**
  - รองรับการสร้าง Partial Index บน PostgreSQL สำหรับผู้ใช้สิทธิ์ Admin (`WHERE role = 'admin'`) ประหยัดพื้นที่จัดเก็บและลด Overhead ในการ Insert
  - ปรับโครงสร้าง Index สำหรับ MySQL ให้สอดคล้องกัน

### 4. ชุดทดลอง Indexing Lab (`indexing-lab/`)
- เพิ่มระบบจำลองและทดสอบการทำ Database Indexing ในสภาพแวดล้อม PostgreSQL ผ่าน Docker Compose
- มีสคริปต์ทดสอบครบทั้ง 7 หัวข้อ:
  - `01-explain.sql` & `01b-create-index-live.sql`: การอ่าน Execution Plan (Seq Scan vs Index Scan)
  - `02-size.sql`: การวัดขนาดของ Table เทียบกับ Index Size
  - `03-insert-cost.sql`: การวัดผลกระทบ (Write Overhead) ของ Index ต่อคำสั่ง INSERT
  - `04-pitfalls.sql`: ปัญหา Index ไม่ทำงาน (Low Cardinality, Function on Column)
  - `05-composite.sql`: การออกแบบ Composite Index และ Leftmost Prefix Rule
  - `06-workshop.sql` & `07-choose-columns.sql`: เวิร์กช็อปวิเคราะห์และคัดเลือกคอลัมน์ที่ควรทำ Index
- จัดทำเอกสารรายงานผลสรุปเชิงลึก [indexing-lab/INDEXING_LAB_REPORT.md](file:///Applications/XAMPP/xamppfiles/htdocs/web_app_dab/indexing-lab/INDEXING_LAB_REPORT.md)

---

## 📁 สรุปรายการไฟล์ที่มีการแก้ไขและสร้างใหม่

| ประเภท | พาธไฟล์ | รายละเอียด |
| :--- | :--- | :--- |
| **Modified** | `backend/app/models.py` | เพิ่ม Index บน display_name, FK user_id, Composite Index บน scores |
| **Modified** | `backend/database/schema.sql` | ปรับปรุงคำสั่ง Index ใน MySQL |
| **Modified** | `backend/database/schema_postgres.sql` | ปรับปรุง Index, Composite Index และ Partial Index ใน PostgreSQL |
| **Modified** | `frontend/css/style.css` | เพิ่มคลาส CSS สำหรับ Sandbox UI, Routine Builder, Stepper Controls |
| **Modified** | `frontend/index.html` | เพิ่มปุ่มทางลัด Sandbox และปรับการ์ด Leaderboard Preview |
| **Modified** | `frontend/js/config.js` | เพิ่มฟังก์ชัน `createCustomCourse()` และ Export การตั้งค่า |
| **Modified** | `frontend/js/workout_manager.js` | รองรับ Dynamic Course Object, ปรับปรุง Logic การพักเซ็ต |
| **Modified** | `frontend/pages/play.html` | เพิ่ม UI/UX โหมด Sandbox เต็มรูปแบบและระบบ Flow Control |
| **Added** | `indexing-lab/` | โฟลเดอร์ชุดปฏิบัติการ Database Indexing Lab พร้อม Docker & SQL Scripts |
| **Added** | `.htaccess` | ไฟล์คอนฟิก Apache สำหรับ XAMPP |
| **Added** | `CHANGELOG_UPDATE_1.md` | เอกสารบันทึกการเปลี่ยนแปลงครั้งที่ 1 (ไฟล์นี้) |

---

## 🚀 คำสั่งสำหรับบันทึกและ Push ขึ้น Git (เมื่อต้องการ Commit)

```bash
# 1. ตรวจสอบสถานะไฟล์
git status

# 2. เพิ่มไฟล์ทั้งหมดเข้า Staging
git add .

# 3. ทำ Commit ด้วยข้อความที่สื่อความหมายชัดเจน
git commit -m "feat: enhance AI pose detection accuracy, implement Sandbox mode, and optimize database indexing"

# 4. Push ขึ้น GitHub Remote
git push origin main
```
