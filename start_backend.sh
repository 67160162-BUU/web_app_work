#!/bin/bash
# สคริปต์รัน FastAPI Backend สำหรับทำงานร่วมกับ XAMPP บนพอร์ต 8000
echo "🚀 Starting SMART AI FITNESS Backend (FastAPI)..."
echo "🌐 API URL: http://localhost:8000/api"
echo "🗄️ Database: MySQL (XAMPP Port 3306)"

cd "$(dirname "$0")/backend" || exit 1
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
