// การตั้งค่าหลักของแอปพลิเคชัน (Config)
// รองรับระบบคอร์สออกกำลังกาย (Workout Courses & Targeted Splits) และการตรวจจับท่าทาง

export const EXERCISES = {
  squats: {
    key: "squats",
    name: "Bodyweight Squats",
    icon: "🦵",
    targetArea: "ต้นขาด้านหน้า & ก้น (Quads & Glutes)",
    equipment: "ไม่ต้องใช้อุปกรณ์ (Bodyweight)",
    met: 5.0,
    gif: "assets/demos/squats.gif",
    instructions: "ยืนกางขาเท่าช่วงไหล่ ย่อตัวลงจนต้นขาขนานพื้น (เข่าทำมุม 90°-100°) หลังตรง ไม่งอหลัง แล้วดันตัวกลับขึ้นมายืนตรง",
    steps: [
      "1. ท่าเตรียม: ยืนตัวตรง กางขากว้างประมาณช่วงหัวไหล่ ปลายเท้าเปิดออกเล็กน้อย",
      "2. จังหวะย่อ: ดันสะโพกไปข้างหลัง ย่อเข่าลงเหมือนกำลังจะนั่งเก้าอี้ จนต้นขาขนานกับพื้น",
      "3. จังหวะดันตัว: ออกแรงดันจากส้นเท้า ลำตัวตรง เกร็งก้นขณะกลับขึ้นมายืนตรง"
    ],
    mistakes: [
      "⚠️ หลังค่อมหรืองอหลังส่วนล่าง (ควรเกร็งลำตัวให้หลังตรงตลอด)",
      "⚠️ หัวเข่าเลยปลายเท้ามากเกินไปจนน้ำหนักเทลงข้อเข่า",
      "⚠️ ทิ้งน้ำหนักลงที่ปลายเท้าแทนที่จะถ่ายน้ำหนักลงกึ่งกลางเท้าถึงส้นเท้า"
    ],
    aiTip: "📷 ถอยห่างจากกล้อง 2-2.5 เมตร ให้กล้องมองเห็นสะโพก เข่า และข้อเท้าได้อย่างชัดเจน",
    enterScore: 70,
  },
  jumping_jacks: {
    key: "jumping_jacks",
    name: "Jumping Jacks",
    icon: "⭐",
    targetArea: "คาร์ดิโอเผาผลาญทั้งตัว & หัวไหล่ (Full Body Cardio)",
    equipment: "ไม่ต้องใช้อุปกรณ์ (Bodyweight)",
    met: 8.0,
    gif: "assets/demos/jumping_jacks.gif",
    instructions: "กระโดดกางขาพร้อมชูมือทั้งสองข้างขึ้นแตะกันเหนือศีรษะ แล้วกระโดดหุบขากลับมาชิดข้างลำตัวอย่างต่อเนื่อง",
    steps: [
      "1. ท่าเตรียม: ยืนตรง เท้าชิด แขนแนบข้างลำตัว สายตามองตรงไปข้างหน้า",
      "2. จังหวะกาง: กระโดดแยกเท้าออกกว้างกว่าช่วงไหล่เล็กน้อย พร้อมวาดแขนขึ้นแตะกันเหนือศีรษะ",
      "3. จังหวะหุบ: กระโดดสปริงตัวเบาๆ นำเท้ากลับมาชิดและผ่อนแขนกลับมาแนบข้างลำตัว"
    ],
    mistakes: [
      "⚠️ ยกแขนไม่สุด (ควรยกแขนขึ้นแตะหรือเกือบแตะกันเหนือศีรษะเพื่อให้ AI นับครั้ง)",
      "⚠️ ลงน้ำหนักเท้าแรงเกินไป (ควรลงด้วยปลายเท้าเบาๆ ช่วยซับแรงกระแทกข้อเข่า)"
    ],
    aiTip: "📷 ตรวจสอบให้กล้องมองเห็นแขนเหนือศีรษะและเท้าทั้งสองข้างได้อย่างครบถ้วน",
    enterScore: 70,
  },
  high_knees: {
    key: "high_knees",
    name: "High Knees",
    icon: "🏃",
    targetArea: "เบิร์นคาร์ดิโอ & กล้ามเนื้อแกนกลางลำตัว (Cardio & Core)",
    equipment: "ไม่ต้องใช้อุปกรณ์ (Bodyweight)",
    met: 8.0,
    gif: "assets/demos/high_knees.gif",
    instructions: "วิ่งหรือก้าวยกเข่าสลับข้างขึ้นมาให้สูงระดับเอว/สะโพก พร้อมแกว่งแขนตามจังหวะเพื่อเร่งอัตราการเผาผลาญ",
    steps: [
      "1. ท่าเตรียม: ยืนตรง กางเท้ากว้างเท่าช่วงสะโพก เกร็งหน้าท้องเล็กน้อย",
      "2. จังหวะยก: ยกเข่าข้างหนึ่งขึ้นมาให้ทำมุมประมาณ 90 องศา (ระดับสะโพก/เอว)",
      "3. จังหวะสลับ: ลดเท้าลงแตะพื้นเบาๆ พร้อมกับสลับยกเข่าอีกข้างขึ้นมาทันทีอย่างมีจังหวะ"
    ],
    mistakes: [
      "⚠️ ยกเข่าต่ำเกินไป (AI จะตรวจจับเข่าที่ยกสูงระดับเอวขึ้นไป)",
      "⚠️ ลำตัวเอียงไปข้างหลังมากเกินไป (ควรรักษาแนวลำตัวให้ตรงหรือโน้มไปข้างหน้าเล็กน้อย)"
    ],
    aiTip: "📷 ยืนหันหน้าตรงเข้าหากล้องในระยะประมาณ 2 เมตร เพื่อให้กล้องจับมุมเข่าและสะโพกได้แม่นยำ",
    enterScore: 60,
  },
  bicep_curls: {
    key: "bicep_curls",
    name: "Dumbbell Bicep Curls",
    icon: "💪",
    targetArea: "ต้นแขนด้านหน้า (Biceps)",
    equipment: "ดัมเบล 1 คู่ หรือขวดน้ำ",
    met: 4.5,
    gif: "assets/demos/bicep_curls.gif",
    instructions: "ถือดัมเบลข้างลำตัว ข้อศอกแนบชิดลำตัว พับแขนยกดัมเบลขึ้นเกร็งกล้ามเนื้อไบเซพ แล้วค่อยๆ ผ่อนลงสุด",
    steps: [
      "1. ท่าเตรียม: ยืนหรือนั่งตรง ถือและหงายฝ่ามือ ข้อศอกแนบชิดข้างลำตัว",
      "2. จังหวะยก: พับข้อศอกยกดัมเบลขึ้นสู่ระดับหัวไหล่ เกร็งกล้ามเนื้อต้นแขนค้างไว้ 1 วินาที",
      "3. จังหวะผ่อน: ค่อยๆ ผ่อนดัมเบลลงอย่างช้าๆ จนแขนเหยียดลงสุด"
    ],
    mistakes: [
      "⚠️ ใช้แรงเหวี่ยงหลังแทนแรงแขน (ลำตัวต้องนิ่ง ข้อศอกต้องไม่ขยับไปข้างหน้า/หลัง)"
    ],
    aiTip: "📷 ยืนให้กล้องเห็นข้อศอกและข้อมือชัดเจนทั้งสองข้าง",
    enterScore: 75,
  },
  shoulder_press: {
    key: "shoulder_press",
    name: "Dumbbell Shoulder Press",
    icon: "🏋️",
    targetArea: "หัวไหล่ & หลังแขน (Shoulders & Triceps)",
    equipment: "ดัมเบล 1 คู่",
    met: 5.0,
    gif: "assets/demos/shoulder_press.gif",
    instructions: "ถือดัมเบลระดับหู ข้อศอกตั้งฉาก 90° ดันดัมเบลขึ้นตรงเหนือศีรษะจนแขนเหยียดตรง แล้วค่อยๆ ผ่อนลงระดับเดิม",
    steps: [
      "1. ท่าเตรียม: ยกข้อศอกขึ้นทำมุม 90 องศา ดัมเบลอยู่ระดับเสมอใบหู",
      "2. จังหวะดัน: หายใจออก ดันดัมเบลขึ้นตรงเหนือศีรษะจนแขนเหยียดตึง",
      "3. จังหวะลด: หายใจเข้า ค่อยๆ ผ่อนดัมเบลลงกลับมาที่ตำแหน่งหู 90 องศาอย่างควบคุม"
    ],
    mistakes: [
      "⚠️ แอ่นหลังส่วนล่างมากเกินไปขณะดันดัมเบล (ควรเกร็งหน้าท้องประคองหลัง)",
      "⚠️ ผ่อนข้อศอกลงต่ำเกินไปจนไหล่ห่อ"
    ],
    aiTip: "📷 หันหน้าตรงเข้าหากล้อง ให้เห็นช่วงลำตัวตั้งแต่เอวขึ้นไปจนถึงแขนเหนือศีรษะ",
    enterScore: 75,
  },
  standing_crunches: {
    key: "standing_crunches",
    name: "Standing Cross Crunches",
    icon: "⚡",
    targetArea: "หน้าท้อง & รอบเอวด้านข้าง (Abs & Obliques)",
    equipment: "ไม่ต้องใช้อุปกรณ์ (Bodyweight)",
    met: 5.5,
    gif: "assets/demos/standing_crunches.gif",
    instructions: "ยืนยกมือแตะท้ายทอย บิดข้อศอกข้างหนึ่งลงมาแตะเข่าฝั่งตรงข้าม เกร็งหน้าท้อง แล้วสลับข้างอย่างต่อเนื่อง",
    steps: [
      "1. ท่าเตรียม: ยืนตรง กางเท้ากว้างเท่าไหล่ ยกมือทั้งสองข้างขึ้นแตะบริเวณหลังใบหู/ท้ายทอย",
      "2. จังหวะบิด: ยกเข่าขวาเฉียงขึ้นมาพร้อมกับบิดข้อศอกซ้ายลงไปแตะหรือเข้าใกล้เข่าขวา เกร็งหน้าท้อง",
      "3. จังหวะสลับ: นำเท้ากลับลงแตะพื้น แล้วสลับทำอีกข้าง (ศอกขวาแตะเข่าซ้าย)"
    ],
    mistakes: [
      "⚠️ ก้มหลังแทนที่จะบิดลำตัวและเกร็งหน้าท้อง",
      "⚠️ ดึงคอหรือกดศีรษะ (มือแค่แตะเบาๆ ไม่ดึงต้นคอ)"
    ],
    aiTip: "📷 ยืนระยะ 2 เมตร ให้กล้องจับท่อนบนและท่อนล่างได้พร้อมกัน",
    enterScore: 65,
  },
};

export const WORKOUT_COURSES = {
  beginner_fullbody: {
    id: "beginner_fullbody",
    name: "Beginner Full Body Burn",
    category: "Full Body (ทั่วเรือนร่าง)",
    difficulty: "Easy / ระดับเริ่มต้น",
    badgeColor: "#10b981",
    equipment: "ไม่ต้องใช้อุปกรณ์ (Bodyweight)",
    description: "คอร์สปลุกพลังเผาผลาญไขมันทั่วร่างกาย เหมาะสำหรับผู้เริ่มต้น หรือวอร์มอัปวันเบาๆ",
    target_calories_est: 45,
    exercises: [
      { pose_key: "jumping_jacks", name: "Jumping Jacks", target_reps: 15, sets: 2, rest_seconds: 20, met: 8.0 },
      { pose_key: "squats", name: "Bodyweight Squats", target_reps: 10, sets: 2, rest_seconds: 30, met: 5.0 },
      { pose_key: "high_knees", name: "High Knees", target_reps: 20, sets: 2, rest_seconds: 25, met: 8.0 },
    ],
  },
  adv_upper_body: {
    id: "adv_upper_body",
    name: "Advanced Upper Body Sculpt",
    category: "Upper Body (แขน & หัวไหล่)",
    difficulty: "Hard / ระดับเข้มข้น",
    badgeColor: "#8b5cf6",
    equipment: "ดัมเบล 1 คู่ (Dumbbells)",
    description: "เน้นกระชับต้นแขน สร้างกล้ามเนื้อหัวไหล่ทรงลูกมะพร้าว และปิดท้ายด้วยคาร์ดิโอเร่งชีพจร",
    target_calories_est: 85,
    exercises: [
      { pose_key: "bicep_curls", name: "Dumbbell Bicep Curls", target_reps: 12, sets: 3, rest_seconds: 30, met: 4.5 },
      { pose_key: "shoulder_press", name: "Dumbbell Shoulder Press", target_reps: 10, sets: 3, rest_seconds: 35, met: 5.0 },
      { pose_key: "jumping_jacks", name: "Burnout Jumping Jacks", target_reps: 25, sets: 2, rest_seconds: 20, met: 8.5 },
    ],
  },
  adv_lower_power: {
    id: "adv_lower_power",
    name: "Advanced Leg & Glute Power",
    category: "Lower Body (ขา & สะโพก)",
    difficulty: "Hard / ระดับเข้มข้น",
    badgeColor: "#ec4899",
    equipment: "ดัมเบล 1 ลูก หรือ Bodyweight",
    description: "สร้างกล้ามเนื้อขาและก้นให้กระชับแข็งแกร่ง เพิ่มพลังสปริงตัวและการเผาผลาญพลังงานสูงสุด",
    target_calories_est: 95,
    exercises: [
      { pose_key: "squats", name: "Goblet Squats (ถือดัมเบล)", target_reps: 15, sets: 3, rest_seconds: 35, met: 6.5 },
      { pose_key: "high_knees", name: "Explosive High Knees", target_reps: 30, sets: 3, rest_seconds: 30, met: 8.5 },
    ],
  },
  adv_core_abs: {
    id: "adv_core_abs",
    name: "Standing Core Shredder",
    category: "Core & Abs (แกนกลางลำตัว & หน้าท้อง)",
    difficulty: "Medium-Hard / เข้มข้นปานกลาง",
    badgeColor: "#06b6d4",
    equipment: "ไม่ต้องใช้อุปกรณ์ (Bodyweight)",
    description: "กระชับรอบเอวและซิกแพคแบบท่ายืน ไม่ต้องนอนกับพื้น กล้องจับฟอร์มเป๊ะตลอดเวลา",
    target_calories_est: 70,
    exercises: [
      { pose_key: "standing_crunches", name: "Standing Cross Crunches", target_reps: 20, sets: 3, rest_seconds: 25, met: 5.5 },
      { pose_key: "high_knees", name: "Sprint High Knees", target_reps: 25, sets: 2, rest_seconds: 20, met: 8.0 },
    ],
  },
};

export const CFG = {
  COUNTDOWN_DESKTOP: 3,
  COUNTDOWN_MOBILE: 5,
  SMOOTH_FRAMES: 5,
  MIN_VISIBILITY: 0.5,

  // การตั้งค่าท่าออกกำลังกายและคอร์ส
  EXERCISES,
  COURSES: WORKOUT_COURSES,

  // ความเข้ากันได้ย้อนหลังสำหรับระบบเดิม
  POSES: EXERCISES,

  MEDIAPIPE: {
    WASM_URL: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
    MODEL_URL:
      "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
  },
};
