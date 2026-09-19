// ตรวจจับและนับครั้งท่า High Knees (วิ่งยกเข่าสูงสลับข้าง)
import { LM, dist, smoothstep, visible } from "./common.js";

/**
 * ประเมินฟอร์มและความถูกต้องของท่า High Knees ในเฟรมปัจจุบัน
 * @param {Array} lm - MediaPipe 33 Landmarks
 * @returns {Object} { total, valid, activeSide, kneeHeightRatio, debug }
 */
export function scoreHighKnee(lm) {
  const needed = [LM.L_HIP, LM.R_HIP, LM.L_KNEE, LM.R_KNEE];
  if (!lm || !visible(lm, ...needed)) {
    return { total: 0, valid: false, reason: "ไม่เห็นสะโพกหรือเข่า" };
  }

  const hipW = dist(lm[LM.L_HIP], lm[LM.R_HIP]) || 0.2;
  const avgHipY = (lm[LM.L_HIP].y + lm[LM.R_HIP].y) / 2;

  // ระยะทางที่เข่าสูงขึ้นเมื่อเทียบกับระดับสะโพก (ปกติเข่าจะอยู่ต่ำกว่าสะโพก แกน y มากกว่า)
  // ยิ่งเข่ายกสูงขึ้น ค่า (knee.y - hip.y) จะยิ่งลดลงหรือติดลบถ้าสูงกว่าสะโพก
  const leftKneeLift = (avgHipY - lm[LM.L_KNEE].y) / hipW;
  const rightKneeLift = (avgHipY - lm[LM.R_KNEE].y) / hipW;

  // เช็คว่าเข่าข้างไหนยกสูงกว่า
  const leftActive = leftKneeLift > -0.6 && leftKneeLift > rightKneeLift + 0.35;
  const rightActive = rightKneeLift > -0.6 && rightKneeLift > leftKneeLift + 0.35;

  let activeSide = null;
  let maxLift = -1.5;

  if (leftActive) {
    activeSide = "LEFT";
    maxLift = leftKneeLift;
  } else if (rightActive) {
    activeSide = "RIGHT";
    maxLift = rightKneeLift;
  }

  // คะแนนฟอร์ม: -1.2 (ยืนตรงปกติ) -> -0.4 (เริ่มยก) -> 0.0 ขึ้นไป (ยกสูงเสมอระดับเอว/สะโพก = 100 คะแนน)
  const heightScore = smoothstep(-0.6, 0.1, maxLift);
  const total = activeSide ? Math.round(heightScore * 100) : 40;

  return {
    total,
    valid: true,
    activeSide,
    maxLift: Math.round(maxLift * 100) / 100,
    parts: {
      heightScore: Math.round(heightScore * 100),
    },
  };
}

/**
 * State Machine สำหรับนับครั้งท่า High Knees
 * นับสลับข้าง: ซ้ายยก -> ขวายก -> ซ้ายยก...
 */
export function createHighKneeCounter() {
  let lastSide = null; // null | "LEFT" | "RIGHT"
  let count = 0;
  let streakScore = 0;

  return {
    reset() {
      lastSide = null;
      count = 0;
      streakScore = 0;
    },
    update(score, result) {
      if (!result || !result.valid || !result.activeSide || score < 50) {
        return { counted: false, count, state: lastSide ?? "IDLE", feedback: "ยกเข่าให้สูงระดับเอว!" };
      }

      const currentSide = result.activeSide;
      let counted = false;
      let feedback = "";

      if (currentSide !== lastSide) {
        lastSide = currentSide;
        count++;
        counted = true;
        streakScore = score;
        feedback = `เข่า${currentSide === "LEFT" ? "ซ้าย" : "ขวา"}เยี่ยม! ยกสลับต่อเลย 🔥`;
        return { counted, count, state: currentSide, feedback, accuracy: Math.max(75, score) };
      } else {
        feedback = `สลับไปยกอีกข้าง!`;
      }

      return { counted: false, count, state: lastSide, feedback };
    },
    get count() { return count; },
  };
}
