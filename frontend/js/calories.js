// คำนวณการเผาผลาญพลังงาน (Calories Burned Engine)
// อิงมาตรฐานสากล MET (Metabolic Equivalent of Task)
// สูตรมาตรฐาน:
// Calories (kcal) = (MET * 3.5 * Weight_kg / 200) * (Duration_seconds / 60)

export const DEFAULT_USER_WEIGHT_KG = 65; // น้ำหนักเฉลี่ยเริ่มต้น (กก.)
export const DEFAULT_USER_HEIGHT_CM = 170; // ส่วนสูงเฉลี่ยเริ่มต้น (ซม.)

/**
 * ดึงน้ำหนักตัวที่บันทึกไว้ หรือคืนค่า default
 */
export function getUserWeight() {
  if (typeof localStorage === "undefined" || !localStorage.getItem) return DEFAULT_USER_WEIGHT_KG;
  try {
    const saved = localStorage.getItem("dd_user_weight");
    const parsed = parseFloat(saved);
    return parsed && parsed > 20 && parsed < 250 ? parsed : DEFAULT_USER_WEIGHT_KG;
  } catch {
    return DEFAULT_USER_WEIGHT_KG;
  }
}

/**
 * บันทึกค่าน้ำหนักตัวของผู้ใช้
 */
export function setUserWeight(weightKg) {
  const parsed = parseFloat(weightKg);
  if (parsed && parsed > 20 && parsed < 250) {
    if (typeof localStorage !== "undefined" && localStorage.setItem) {
      try {
        localStorage.setItem("dd_user_weight", parsed.toString());
      } catch {}
    }
    return parsed;
  }
  return DEFAULT_USER_WEIGHT_KG;
}

/**
 * ดึงส่วนสูงตัวที่บันทึกไว้ หรือคืนค่า default (ซม.)
 */
export function getUserHeight() {
  if (typeof localStorage === "undefined" || !localStorage.getItem) return DEFAULT_USER_HEIGHT_CM;
  try {
    const saved = localStorage.getItem("dd_user_height");
    const parsed = parseFloat(saved);
    return parsed && parsed >= 100 && parsed <= 250 ? parsed : DEFAULT_USER_HEIGHT_CM;
  } catch {
    return DEFAULT_USER_HEIGHT_CM;
  }
}

/**
 * บันทึกค่าส่วนสูงของผู้ใช้ (ซม.)
 */
export function setUserHeight(heightCm) {
  const parsed = parseFloat(heightCm);
  if (parsed && parsed >= 100 && parsed <= 250) {
    if (typeof localStorage !== "undefined" && localStorage.setItem) {
      try {
        localStorage.setItem("dd_user_height", parsed.toString());
      } catch {}
    }
    return parsed;
  }
  return DEFAULT_USER_HEIGHT_CM;
}

/**
 * คำนวณค่าดัชนีมวลกาย (BMI) พร้อมแปลผลภาษาไทย
 */
export function calculateBMI(weightKg = null, heightCm = null) {
  const w = weightKg ?? getUserWeight();
  const h = heightCm ?? getUserHeight();
  const heightM = h / 100;
  if (heightM <= 0) return { bmi: 22.5, category: "สมส่วน", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" };
  const bmi = Math.round((w / (heightM * heightM)) * 10) / 10;

  let category = "สมส่วน / ปกติ";
  let color = "#059669";
  let bg = "#ecfdf5";
  let border = "#a7f3d0";

  if (bmi < 18.5) {
    category = "น้ำหนักน้อยกว่าเกณฑ์";
    color = "#0284c7";
    bg = "#f0f9ff";
    border = "#bae6fd";
  } else if (bmi < 23.0) {
    category = "สมส่วน / ปกติ";
    color = "#059669";
    bg = "#ecfdf5";
    border = "#a7f3d0";
  } else if (bmi < 25.0) {
    category = "น้ำหนักเกินเกณฑ์เล็กน้อย";
    color = "#d97706";
    bg = "#fffbeb";
    border = "#fde68a";
  } else if (bmi < 30.0) {
    category = "เริ่มเข้าเกณฑ์อ้วน (ระดับ 1)";
    color = "#ea580c";
    bg = "#fff7ed";
    border = "#fed7aa";
  } else {
    category = "อ้วนมาก (ระดับ 2)";
    color = "#dc2626";
    bg = "#fef2f2";
    border = "#fecaca";
  }

  return { bmi, category, color, bg, border };
}

/**
 * คำนวณแคลอรี่ที่เผาผลาญในช่วงเวลาหนึ่ง (Active Duration)
 * @param {number} met - ค่าความเข้มข้นของการออกกำลังกาย (MET)
 * @param {number} durationSeconds - เวลาออกกำลังกายจริง (วินาที)
 * @param {number} weightKg - น้ำหนักตัวผู้ใช้ (กิโลกรัม)
 * @param {number} intensityCadence - ตัวคูณความเร็วและความต่อเนื่อง (1.0 - 1.25)
 * @returns {number} กิโลแคลอรี่ (kcal)
 */
export function calculateCaloriesBurned(met = 6.0, durationSeconds = 0, weightKg = null, intensityCadence = 1.0) {
  const weight = weightKg ?? getUserWeight();
  if (durationSeconds <= 0) return 0;

  // แคลอรี่ต่อวินาที = (MET * 3.5 * weight) / (200 * 60)
  const caloriesPerSec = (met * 3.5 * weight) / 12000;
  const burned = caloriesPerSec * durationSeconds * Math.max(0.8, Math.min(1.4, intensityCadence));
  return Math.round(burned * 100) / 100;
}

/**
 * คลาสสำหรับสะสมและติดตามแคลอรี่ตลอดเซสชั่นการออกกำลังกาย
 */
export class CalorieTracker {
  constructor(weightKg = null, heightCm = null) {
    this.weightKg = weightKg ?? getUserWeight();
    this.heightCm = heightCm ?? getUserHeight();
    this.totalCalories = 0;
    this.exerciseStartTime = null;
    this.currentMet = 5.0;
    this.repCount = 0;
  }

  setExercise(met = 5.0) {
    this.currentMet = met;
    this.repCount = 0;
    this.exerciseStartTime = performance.now();
  }

  onRep() {
    this.repCount++;
    // โบนัสเพิ่มเล็กน้อยต่อ 1 Rep สำหรับแรงจูงใจ (ประมาณ 0.2 - 0.5 kcal ขึ้นกับ MET)
    const repBonus = (this.currentMet / 10) * 0.15;
    this.totalCalories += repBonus;
  }

  tick(deltaSeconds = 1) {
    if (deltaSeconds <= 0) return this.totalCalories;
    // เผาผลาญตามเวลาและอัตรา MET ต่อเนื่อง
    const tickCal = ((this.currentMet * 3.5 * this.weightKg) / 12000) * deltaSeconds;
    this.totalCalories += tickCal;
    return this.totalCalories;
  }

  getCalories() {
    return Math.round(this.totalCalories * 10) / 10;
  }

  reset() {
    this.totalCalories = 0;
    this.repCount = 0;
    this.exerciseStartTime = null;
  }
}
