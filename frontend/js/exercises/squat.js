// ตรวจจับและนับครั้งท่า Squat (สควอท / Goblet Squat)
import { LM, dist, angle, smoothstep, visible } from "./common.js";

/**
 * ประเมินฟอร์มและความถูกต้องของท่า Squat ในเฟรมปัจจุบัน
 * @param {Array} lm - MediaPipe 33 Landmarks
 * @returns {Object} { total, valid, stage, debug }
 */
export function scoreSquat(lm) {
  const needed = [LM.L_HIP, LM.R_HIP, LM.L_KNEE, LM.R_KNEE, LM.L_ANKLE, LM.R_ANKLE];
  if (!lm || !visible(lm, ...needed)) {
    return { total: 0, valid: false, stage: "unknown", reason: "เห็นขาไม่ชัดเจน" };
  }

  // คำนวณมุมข้อเข่าทั้งสองข้าง
  const kneeAngleL = angle(lm[LM.L_HIP], lm[LM.L_KNEE], lm[LM.L_ANKLE]);
  const kneeAngleR = angle(lm[LM.R_HIP], lm[LM.R_KNEE], lm[LM.R_ANKLE]);
  const avgKneeAngle = (kneeAngleL + kneeAngleR) / 2;

  // ตรวจสอบมุมลำตัว (Back/Torso angle: Shoulder -> Hip vs Vertical)
  let torsoScore = 1.0;
  if (visible(lm, LM.L_SHOULDER, LM.R_SHOULDER)) {
    const midShoulder = {
      x: (lm[LM.L_SHOULDER].x + lm[LM.R_SHOULDER].x) / 2,
      y: (lm[LM.L_SHOULDER].y + lm[LM.R_SHOULDER].y) / 2,
    };
    const midHip = {
      x: (lm[LM.L_HIP].x + lm[LM.R_HIP].x) / 2,
      y: (lm[LM.L_HIP].y + lm[LM.R_HIP].y) / 2,
    };
    // ลำตัวเอนไม่ควรเกิน 45 องศาจากแนวดิ่ง
    const torsoTilt = Math.abs(Math.atan2(midShoulder.x - midHip.x, midHip.y - midShoulder.y) * 180 / Math.PI);
    torsoScore = 1 - smoothstep(25, 60, torsoTilt);
  }

  // ความลึกของการย่อ (Squat Depth Score):
  // 170° = ยืนตรง (คะแนนย่อ = 0)
  // 120° = เริ่มย่อ (คะแนน ~ 40)
  // 90° - 100° = ขนานพื้น สมบูรณ์แบบ (คะแนน 100)
  const depthFactor = 1 - smoothstep(90, 160, avgKneeAngle);
  const total = Math.round((depthFactor * 0.75 + torsoScore * 0.25) * 100);

  let stage = "STANDING";
  if (avgKneeAngle <= 105) {
    stage = "DEEP_SQUAT";
  } else if (avgKneeAngle <= 135) {
    stage = "DESCENDING";
  }

  return {
    total,
    valid: true,
    stage,
    avgKneeAngle: Math.round(avgKneeAngle),
    kneeL: Math.round(kneeAngleL),
    kneeR: Math.round(kneeAngleR),
    parts: {
      depth: Math.round(depthFactor * 100),
      posture: Math.round(torsoScore * 100),
    },
  };
}

/**
 * State Machine สำหรับนับจำนวนครั้งของท่า Squat
 * รอบที่สมบูรณ์: STANDING -> DOWN (<= 105°) -> STANDING (>= 150°)
 */
export function createSquatCounter() {
  let state = "STANDING"; // STANDING | SQUATTING | BOTTOM
  let count = 0;
  let minAngleInRep = 180;
  let maxScoreInRep = 0;

  return {
    reset() {
      state = "STANDING";
      count = 0;
      minAngleInRep = 180;
      maxScoreInRep = 0;
    },
    update(score, result) {
      if (!result || !result.valid) {
        return { counted: false, count, state, feedback: "จัดตัวให้อยู่ในเฟรมกล้อง" };
      }

      const angle = result.avgKneeAngle;
      if (angle < minAngleInRep) minAngleInRep = angle;
      if (score > maxScoreInRep) maxScoreInRep = score;

      let counted = false;
      let feedback = "";

      switch (state) {
        case "STANDING":
          if (angle < 140) {
            state = "SQUATTING";
            feedback = "ย่อลงไปอีก!";
          } else {
            feedback = "เตรียมพร้อม ย่อตัวลง";
          }
          break;

        case "SQUATTING":
          if (angle <= 105) {
            state = "BOTTOM";
            feedback = "ดีมาก! ดันตัวขึ้น";
          } else if (angle >= 155) {
            // ย่อไม่สุดแล้วดันขึ้น
            state = "STANDING";
            minAngleInRep = 180;
            maxScoreInRep = 0;
            feedback = "ย่อลึกอีกนิด ให้ต้นขาขนานพื้น";
          } else {
            feedback = "ย่อลงอีก...";
          }
          break;

        case "BOTTOM":
          if (angle >= 150) {
            // ขึ้นมายืนตรงสำเร็จ นับ 1 Rep!
            count++;
            counted = true;
            state = "STANDING";
            const repAccuracy = Math.min(100, Math.max(70, maxScoreInRep));
            feedback = repAccuracy > 85 ? "ฟอร์มเป๊ะมาก! 🔥" : "นับ 1 ครั้ง! พยายามยืดตัวตรง";
            minAngleInRep = 180;
            maxScoreInRep = 0;
            return { counted, count, state, feedback, accuracy: repAccuracy };
          } else {
            feedback = "ดันตัวขึ้นมายืนตรง";
          }
          break;
      }

      return { counted, count, state, feedback };
    },
    get count() { return count; },
  };
}
