# SMART AI FITNESS — On-Device AI Workout Coach & Routine Tracker

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MediaPipe](https://img.shields.io/badge/AI_Engine-MediaPipe_Pose_33_Landmarks-FF6F00.svg?logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![WebAssembly](https://img.shields.io/badge/Runtime-WebAssembly_%2F_WebGL-654FF0.svg?logo=webassembly&logoColor=white)](https://webassembly.org)
[![MySQL](https://img.shields.io/badge/Database-MySQL_8.0_%7C_MariaDB_10.4-4479A1.svg?logo=mysql&logoColor=white)](https://www.mysql.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_15-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Containers-Docker_Compose-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com)
[![Status](https://img.shields.io/badge/Sprint_Score-78%25_(B%2B)-yellowgreen.svg)](#-การประเมินคะแนนระบบ-system-scorecard-78--100)

ระบบเว็บแอปพลิเคชันออกกำลังกายอัจฉริยะที่ใช้ **Computer Vision บนเบราว์เซอร์ (Client-side Edge AI)** ผ่าน **Google MediaPipe Pose** ตรวจจับโครงสร้างร่างกาย 33 จุดแบบเรียลไทม์ 60 FPS วิเคราะห์ฟอร์ม นับครั้ง (Reps) นับเซ็ต (Sets) จับเวลาพัก (Rest Timers) และคำนวณการเผาผลาญแคลอรี่ (MET Equation) โดยตรงตามข้อมูลสรีระจริงของผู้ใช้ (น้ำหนักและส่วนสูง) โดยปราศจากการส่งภาพวิดีโอออกจากอุปกรณ์ (Privacy-First 100%)

---

## 📊 การประเมินคะแนนระบบ (System Scorecard: 78 / 100)

จากการประเมินประสิทธิภาพการทำงานแบบองค์รวม (End-to-End Evaluation) ประจำสัปดาห์นี้ ระบบได้รับคะแนนรวม **78% (เกรด B+)** โดยมีรายละเอียดคะแนนแยกตามหมวดหมู่ดังนี้:

| หมวดหมู่การประเมิน (Evaluation Category) | คะแนนเต็ม | คะแนนที่ได้ | ผลการประเมินและสถานะ |
| :--- | :---: | :---: | :--- |
| **1. สถาปัตยกรรม & ความปลอดภัย (Architecture & Privacy)** | 20 | **20** | **100% (ดีเยี่ยม):** ระบบ Edge AI ประมวลผลบนเครื่อง 100% ไร้ความเสี่ยงข้อมูลภาพรั่วไหล (Zero Data Leakage) ออกแบบ Microservices 4 Tiers และ RESTful API ชัดเจน |
| **2. ฐานข้อมูล & การจัดการโปรไฟล์ (Backend & Persistence)** | 25 | **24** | **96% (ยอดเยี่ยม):** รองรับ Dual DB (MySQL/MariaDB + PostgreSQL), จัดการ JWT Auth, ซิงค์ข้อมูลสรีระ (`weight`, `height`) เข้ากับ Calorie Engine แบบ Real-time |
| **3. ส่วนต่อประสานผู้ใช้ & โหมดการฝึก (UI/UX & Routine)** | 25 | **23** | **92% (ดีมาก):** ดีไซน์ Clean Light Theme, State Machine ควบคุมเซ็ตและเวลาพักสมบูรณ์, มีระบบเสียง Web Audio และตัวอย่างท่าเคลื่อนไหวคนจริงทั้ง 6 ท่า |
| **4. ความแม่นยำของกล้องและโมเดล AI (Camera & Model Accuracy)** | 30 | **11** | **36.7% ⚠️ (ต้องปรับปรุงเร่งด่วน):** กล้องและโมเดลยังไม่ค่อยแม่นยำ มีข้อจำกัดเรื่องระยะกล้อง (FOV), แสงสว่าง, ข้อต่อหลุดเฟรม และ Motion Blur |
| **คะแนนรวมสุทธิ (Total Overall Score)** | **100** | **78 / 100** | **เกรด B+ (โครงสร้างพื้นฐานพร้อมระดับ Production แต่ต้องปรับจูน Model Accuracy)** |

---

## 📝 รายงานสรุปการเปลี่ยนแปลงและประเมินผลประจำสัปดาห์ (Weekly Sprint Report)

### 1. รายการเปลี่ยนแปลงที่พัฒนาเสร็จสิ้น (Changelog)
1. **User Profile & Biometrics Sync:** เชื่อมโยงข้อมูลน้ำหนักและส่วนสูงจากฐานข้อมูล `users` เข้าสู่ระบบคำนวณแคลอรี่อัตโนมัติ ไม่ต้องกรอกซ้ำในหน้าฝึกซ้อม พร้อมระบบแก้ไขโปรไฟล์ที่อัปเดตตรงถึง MySQL/phpMyAdmin
2. **Workout Routine Engine:** ปรับโครงสร้างระบบจากเกมท่าเดี่ยวสู่ **Workout Routine Tracker** แบ่งเป็นคอร์สมาตรฐาน 4 รูปแบบ (Full Body, Upper Body, Lower Body, Core) รองรับการตั้งเป้าหมายครั้ง, นับเซ็ต, และจับเวลาพักระหว่างเซ็ต (Rest Interval)
3. **Real Human Exercise Demos:** ติดตั้งภาพเคลื่อนไหวคนจริง (GIF) ครบทั้ง 6 ท่า (`jumping_jacks`, `squats`, `high_knees`, `bicep_curls`, `shoulder_press`, `standing_crunches`) ในหน้าต่าง Modal สำหรับกดดูตัวอย่างก่อนเริ่มฝึก
4. **Audio Feedback Synthesizer:** ใช้ Web Audio API สังเคราะห์เสียงนับจังหวะและเสียงนับถอยหลังพักโดยไม่ต้องพึ่งไฟล์ mp3 ภายนอก
5. **System Architecture & Diagrams:** จัดทำเอกสารสถาปัตยกรรม Microservices Architecture (Tier 1–4) และ Technology Stack Diagram (6 Layers) พร้อม Export ไฟล์ภาพความละเอียดสูง 16:9 สำหรับนำเสนอ

### 2. การประเมินผลประสิทธิภาพ: "กล้องและโมเดล AI ยังไม่ค่อยแม่นยำ"
จากการทดสอบจริงในการฝึกซ้อม พบว่าโมเดลตรวจจับท่าทางยังมีความคลาดเคลื่อนในบางสถานการณ์ โดยวิเคราะห์สาเหตุเชิงลึกได้ 4 ประการ:
- **ขอบเขตมุมมองและระยะห่างของกล้อง (Camera FOV & Distance):** กล้องเว็บแคมมีมุมมองแคบ เมื่อผู้ใช้ยืนใกล้เกินไป ข้อเท้าหรือหัวเข่าจะหลุดเฟรมล่าง ทำให้ AI ทำการเดาตำแหน่งข้อต่อผิดพลาด ส่งผลต่อการนับท่า Squats และ High Knees
- **แสงสว่างและฉากหลังรบกวน (Lighting & Background Clutter):** สภาพแสงน้อยหรือแสงย้อนทำให้คอนทราสต์ร่างกายลดลง จุด Landmark เกิดอาการสั่น (Jitter) ส่งผลให้การคำนวณองศาข้อต่อกระโดดข้ามเกณฑ์
- **ภาพเบลอจากการเคลื่อนไหวเร็ว (Motion Blur):** ท่ากระโดดตบ (Jumping Jacks) และยกเข่าไว อัตราการจับภาพของกล้องไม่ทันต่อความเร็ว ทำให้ AI พลาดจุดพีก (Peak Extension Frame)
- **อัตราเฟรมเรตตกบนอุปกรณ์ที่ไม่มี GPU:** เครื่องที่ไม่มี WebGL Hardware Acceleration จะมีอัตราประมวลผลลดลงจาก 60 FPS เหลือ 15–20 FPS ทำให้การจับลำดับท่าทางขาดช่วง

### 3. แผนการปรับปรุงในสัปดาห์ถัดไป (Next Sprint Plan)
- ติดตั้ง **One Euro Filter / Exponential Smoothing** กรอง Noise พิกัดข้อต่อเพื่อลดอาการสั่นกระตุก
- เพิ่มเส้นกรอบร่างกาย (**Smart Silhouette Bounding Box**) บนหน้าจอเพื่อตรวจเช็กว่าผู้ใช้ยืนอยู่ในระยะที่มองเห็นทั้งตัวก่อนเริ่มนับครั้ง
- พัฒนาระบบ **Dynamic Angle Calibration** ประเมินสรีระช่วงแขนขาของผู้ใช้ก่อนเริ่มฝึก

---

## 🏛️ สถาปัตยกรรมระบบ (System Architecture)

ระบบใช้สถาปัตยกรรมแบบ **Decoupled Client Edge-AI & Microservices** แยกการประมวลผล Computer Vision ออกจาก Backend เพื่อประสิทธิภาพสูงสุดและรักษาความเป็นส่วนตัวของผู้ใช้ 100%:

### 1. Microservices Architecture Diagram
![Microservices Architecture](frontend/assets/architecture_diagram.png)

- **Tier 1: Client Edge Device (Browser & Mobile):** รันโมเดล MediaPipe Pose (WASM/WebGL), คำนวณองศาชีวกลศาสตร์ (Biomechanics Engine), Workout Routine State Machine และ Real-time MET Calorie Calculator
- **Tier 2: API Gateway & Static Delivery:** เว็บเซิร์ฟเวอร์ Apache (XAMPP Port 80) / Nginx ทำหน้าที่แจกจ่าย Static Assets (HTML, CSS, JS, GIFs) และทำหน้าที่ Reverse Proxy พร้อมควบคุมนโยบาย CORS
- **Tier 3: Core Backend Microservices (FastAPI Async Engine):** แยกโมดูลบริการ Auth & JWT Service, User Profile & Biometrics Service, Workout Routine Catalog, Score Ingestion และ Leaderboard Service
- **Tier 4: Data Persistence & Storage:** ฐานข้อมูลหลัก MySQL 8.0 / MariaDB 10.4 (XAMPP) หรือ PostgreSQL 15 (Docker) เชื่อมต่อผ่าน SQLAlchemy Connection Pooling

---

### 2. Technology Stack Diagram (6 Layers)
![Technology Stack Diagram](frontend/assets/tech_stack_diagram.png)

| ชั้น (Layer) | เทคโนโลยีที่ใช้ | วัตถุประสงค์และบทบาทในระบบ |
| :--- | :--- | :--- |
| **1. Client & Presentation** | HTML5, Vanilla CSS3, ES6+ JS, Web Audio API | โครงสร้างหน้าเว็บ Clean Modern Light Theme ไร้ Overhead เฟรมเวิร์ก โหลดเร็วระดับมิลลิวินาที |
| **2. Edge AI & Computer Vision** | Google MediaPipe Pose, WebAssembly (WASM), WebGL | ตรวจจับข้อต่อร่างกาย 33 จุด (Landmarks) แบบเรียลไทม์ 60 FPS บนเครื่องไคลเอนต์โดยตรง |
| **3. Gateway & Web Server** | Apache HTTP Server / Uvicorn ASGI | ให้บริการ Static Assets และทำหน้าที่ Reverse Proxy เชื่อมต่อไปยัง Python Backend |
| **4. Application Backend** | Python 3.10+, FastAPI, Pydantic v2, PyJWT, Passlib | บริการ Asynchronous RESTful API ความเร็วสูง รองรับ Non-blocking I/O และตรวจสอบ Schema ข้อมูล |
| **5. Database & Persistence** | MySQL 8.0 / MariaDB 10.4, PostgreSQL 15, phpMyAdmin | บันทึกข้อมูลบัญชีผู้ใช้, ข้อมูลสรีระ, ประวัติการฝึก, และคะแนน Leaderboard |
| **6. DevOps & Infrastructure** | Docker, Docker Compose, Git | จัดการ Containerization ทุกบริการ (DB, Backend, phpMyAdmin) ให้รันได้ในคำสั่งเดียว |

---

## 🏋️ คอร์สการฝึกและท่าออกกำลังกายที่รองรับ

### คอร์สออกกำลังกายมาตรฐาน (Workout Courses)
1. **Beginner Full Body Burn:** เหมาะสำหรับผู้เริ่มต้น ท่ากระโดดตบ, สควอท, และยกเข่าสูง (3 ท่า x 2 เซ็ต)
2. **Upper Body & Core Strength:** เน้นกระชับกล้ามเนื้อท่อนบนและแกนกลางลำตัว (3 ท่า x 3 เซ็ต)
3. **Lower Body & Leg Power:** เพิ่มความแข็งแรงของต้นขาและสะโพก (3 ท่า x 3 เซ็ต)
4. **Core & Cardio Crusher:** เน้นการเผาผลาญไขมันและฝึกกล้ามเนื้อหน้าท้อง (3 ท่า x 3 เซ็ต)

### รายการท่าออกกำลังกาย (6 Exercises with Real Human Demos)
- **Jumping Jacks (`jumping_jacks`):** กระโดดตบเปิดแขนและขา กระตุ้นอัตราการเต้นของหัวใจ
- **Bodyweight Squats (`squats`):** ย่อเข่าดันสะโพกไปด้านหลัง สร้างกล้ามเนื้อต้นขาและสะโพก
- **High Knees (`high_knees`):** วิ่งยกเข่าสูงแตะระดับเอว เผาผลาญแคลอรี่อย่างเข้มข้น
- **Bicep Curls (`bicep_curls`):** งอข้อศอกยกเกร็งกล้ามเนื้อแขนท่อนบน
- **Overhead Shoulder Press (`shoulder_press`):** ดันแขนทั้งสองข้างขึ้นเหนือศีรษะ เสริมสร้างกล้ามเนื้อไหล่
- **Standing Crunches (`standing_crunches`):** ดึงเข่าแตะข้อศอกฝั่งตรงข้าม บริหารกล้ามเนื้อแกนกลางลำตัว

---

## 🚀 วิธีการติดตั้งและรันระบบ (Installation & Getting Started)

### วิธีที่ 1: รันบน XAMPP (Apache + MariaDB / MySQL) — แนะนำสำหรับการพัฒนา
1. คัดลอกโปรเจกต์ไว้ที่ไดเรกทอรี `htdocs/web_app_dab`:
   ```bash
   # สำหรับ macOS
   /Applications/XAMPP/xamppfiles/htdocs/web_app_dab
   # สำหรับ Windows
   C:\xampp\htdocs\web_app_dab
   ```
2. เปิด XAMPP Control Panel และกด Start:
   - **Apache Web Server** (Port 80)
   - **MySQL Database Server** (Port 3306)
3. เปิดเบราว์เซอร์เข้าใช้งาน:
   - **หน้าแรกของระบบ (Main Portal):** `frontend/index.html`
   - **โหมดฝึกซ้อม AI (AI Workout Coach):** `frontend/pages/play.html`
   - **สถาปัตยกรรมระบบ & รายงานประเมิน:** `frontend/pages/architecture.html`
   - **สไลด์นำเสนอผลงาน (Slide Deck):** `frontend/pages/presentation.html`
   - **จัดการฐานข้อมูล (Database GUI):** phpMyAdmin Console

---

### วิธีที่ 2: รันผ่าน Docker Compose (Full Stack Isolated)
รันคำสั่งเดียว ระบบจะสร้าง PostgreSQL 15, MySQL 8.0, phpMyAdmin และ FastAPI Server:

```bash
docker compose up --build -d
```

- **เว็บแอปพลิเคชัน & API Gateway:** รันที่พอร์ต `8000` (FastAPI Web Server)
- **ระบบผู้ดูแลระบบ (Admin Console):** เข้าถึงผ่านเส้นทาง `/pages/admin.html`
- **จัดการฐานข้อมูล MySQL:** เข้าใช้งาน phpMyAdmin ผ่านพอร์ต `8080`

---

## 🔑 บัญชีผู้ใช้สำหรับการทดสอบ (Default Test Accounts)

| ประเภทบัญชี | Username | Email | Password | บทบาท (Role) | สิทธิ์การเข้าถึง |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin@dancedetector.com` | `adminpassword123` | `admin` | จัดการผู้ใช้, ดูประวัติคะแนน, แก้ไข Role |
| **Player 1** | `player1` | `player1@gmail.com` | `adminpassword123` | `player` | ฝึกซ้อม, สะสมคะแนน, บันทึกน้ำหนักและส่วนสูง |

---

## 📡 REST API Endpoints Specification

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` — สมัครสมาชิกใหม่ (รับ username, password, display_name, weight, height)
- `POST /api/auth/login` — เข้าสู่ระบบ คืนค่า JWT Bearer Access Token
- `GET /api/auth/me` — ดึงข้อมูลโปรไฟล์ของผู้ใช้ปัจจุบัน
- `POST /api/auth/logout` — ออกจากระบบ

### 2. User Profile & Biometrics (`/api/users`)
- `GET /api/users/{id}` — ดึงข้อมูลโปรไฟล์ สรีระ (`weight`, `height`) และค่า BMI
- `PUT /api/users/{id}` — อัปเดตข้อมูล Display Name, น้ำหนัก และส่วนสูง
- `GET /api/users` — ดึงรายชื่อผู้ใช้ทั้งหมด (สำหรับ Admin พร้อม Pagination)
- `DELETE /api/users/{id}` — ลบบัญชีผู้ใช้ (Admin only)

### 3. Scores & Calorie Ingestion (`/api/scores`)
- `POST /api/scores/` — บันทึกผลการออกกำลังกาย (calories, duration_seconds, accuracy, reps, course_id)
- `GET /api/scores/leaderboards` — ดึงกระดานผู้นำแยกตามคอร์สและคะแนนรวม
- `GET /api/scores/top` — ดึงคะแนนสูงสุดตามหมวดหมู่

---

## 📁 โครงสร้างโปรเจกต์ (Project Directory Structure)

```text
web_app_dab/
├── backend/                  # FastAPI Backend Microservices
│   ├── app/
│   │   ├── api/              # Routers: auth.py, users.py, scores.py
│   │   ├── core/             # config.py, security.py (JWT & Bcrypt)
│   │   ├── db/               # database.py, session.py
│   │   ├── models/           # SQLAlchemy models: user.py, score.py
│   │   └── schemas/          # Pydantic DTOs
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # Client Edge Application
│   ├── assets/               # Media Assets & Generated Diagrams
│   │   ├── architecture_diagram.png   # High-Res Architecture Diagram
│   │   ├── tech_stack_diagram.png     # High-Res Tech Stack Diagram
│   │   └── demos/            # 6 Real Human Exercise GIFs
│   ├── css/
│   │   └── style.css         # Modern Clean Design System
│   ├── js/                   # ES6 Modular Application Engine
│   │   ├── api.js            # REST API Client & Session Manager
│   │   ├── camera.js         # Webcam Feed Handler
│   │   ├── detector.js       # MediaPipe Pose Landmarker Wrapper
│   │   ├── workout-engine.js # Workout State Machine & Rep Counters
│   │   └── config.js         # API Gateway URLs
│   ├── pages/
│   │   ├── play.html         # Live AI Workout Coach HUD
│   │   ├── leaderboard.html  # High Scores Board
│   │   ├── architecture.html # Architecture & Evaluation Dashboard
│   │   ├── presentation.html # Slide Deck Presentation
│   │   └── admin.html        # Administrative Console
│   └── index.html            # Main Portal & Routine Catalog
├── plan/                     # Architectural Documentation & Reports
│   ├── architecture_and_tech_stack.md
│   ├── weekly_report_and_evaluation.md
│   └── workout-plan.md
├── docker-compose.yml        # Docker Multi-service Orchestration
└── README.md                 # Project Documentation (Current File)
```

---

## 📄 ลิขสิทธิ์และการพัฒนาต่อยอด (License & Contributors)
พัฒนาขึ้นสำหรับโครงการ **Smart AI Fitness Routine & Calorie Tracker** สถาปัตยกรรมระบบได้รับการออกแบบตามมาตรฐานความปลอดภัยข้อมูลส่วนบุคคล (PDPA / GDPR Compliant) โดยประมวลผลวิดีโอบนเบราว์เซอร์ 100%
