// ตรวจจับและนับครั้งท่า Push-ups (วิดพื้น)
// รองรับมุมมองด้านข้าง (Side Profile) และมุมเฉียง 45 องศา พร้อมระบบวิเคราะห์ความตรงของหลัง (Plank Alignment)
import { LM, dist, angle, smoothstep, visible } from "./common.js";

/**
 * ประเมินฟอร์มและความถูกต้องของท่า Push-ups ในเฟรมปัจจุบัน
 * @param {Array} lm - MediaPipe 33 Landmarks
 * @returns {Object} { total, valid, stage, avgElbowAngle, plankAngle, isPlankStraight, feedback }
 */
export function scorePushup(lm) {
  if (!lm || lm.length < 33) {
    return { total: 0, valid: false, stage: "UNKNOWN", reason: "ไม่พบโครงร่างร่างกาย" };
  }

  // ตรวจสอบข้างที่มองเห็นชัดเจนที่สุด (ซ้าย หรือ ขวา)
  const leftArmVisible = visible(lm, LM.L_SHOULDER, LM.L_ELBOW, LM.L_WRIST);
  const rightArmVisible = visible(lm, LM.R_SHOULDER, LM.R_ELBOW, LM.R_WRIST);

  if (!leftArmVisible && !rightArmVisible) {
    return { total: 0, valid: false, stage: "UNKNOWN", reason: "จัดมุมกล้องให้เห็นแขนและข้อศอกชัดเจน" };
  }

  // คำนวณมุมข้อศอก
  let elbowAngleL = 180;
  let elbowAngleR = 180;
  let usedElbowAngle = 180;

  if (leftArmVisible && rightArmVisible) {
    elbowAngleL = angle(lm[LM.L_SHOULDER], lm[LM.L_ELBOW], lm[LM.L_WRIST]);
    elbowAngleR = angle(lm[LM.R_SHOULDER], lm[LM.R_ELBOW], lm[LM.R_WRIST]);
    usedElbowAngle = (elbowAngleL + elbowAngleR) / 2;
  } else if (leftArmVisible) {
    elbowAngleL = angle(lm[LM.L_SHOULDER], lm[LM.L_ELBOW], lm[LM.L_WRIST]);
    usedElbowAngle = elbowAngleL;
  } else {
    elbowAngleR = angle(lm[LM.R_SHOULDER], lm[LM.R_ELBOW], lm[LM.R_WRIST]);
    usedElbowAngle = elbowAngleR;
  }

  // ตรวจสอบความตรงของลำตัว (Plank Alignment: Shoulder -> Hip -> Ankle หรือ Knee)
  let plankAngle = 170;
  let isPlankStraight = true;
  let plankScore = 1.0;

  const leftBodyVisible = visible(lm, LM.L_SHOULDER, LM.L_HIP) && (visible(lm, LM.L_ANKLE) || visible(lm, LM.L_KNEE));
  const rightBodyVisible = visible(lm, LM.R_SHOULDER, LM.R_HIP) && (visible(lm, LM.R_ANKLE) || visible(lm, LM.R_KNEE));

  if (leftBodyVisible || rightBodyVisible) {
    const sId = leftBodyVisible ? LM.L_SHOULDER : LM.R_SHOULDER;
    const hId = leftBodyVisible ? LM.L_HIP : LM.R_HIP;
    const legId = (leftBodyVisible && visible(lm, LM.L_ANKLE)) ? LM.L_ANKLE :
                  (leftBodyVisible && visible(lm, LM.L_KNEE)) ? LM.L_KNEE :
                  visible(lm, LM.R_ANKLE) ? LM.R_ANKLE : LM.R_KNEE;

    plankAngle = angle(lm[sId], lm[hId], lm[legId]);

    // ฟอร์มแพลงก์ที่ดี มุม Shoulder-Hip-Leg ควรอยู่ระหว่าง 150° ถึง 190°
    if (plankAngle < 145) {
      // สะโพกตก (Sagging hips)
      isPlankStraight = false;
      plankScore = Math.max(0.3, plankAngle / 150);
    } else if (plankAngle > 195) {
      // ก้นโด่งเกินไป (Pike hips)
      isPlankStraight = false;
      plankScore = Math.max(0.4, (220 - plankAngle) / 25);
    } else {
      isPlankStraight = true;
      plankScore = 1.0;
    }
  }

  // คำนวณคะแนนความลึกของการย่อ (Depth Factor)
  // 150°+ = แขนตึง (UP) -> 0%
  // 90°-95° = ย่ออกลึกสมบูรณ์ (BOTTOM) -> 100%
  const depthFactor = 1 - smoothstep(85, 145, usedElbowAngle);
  const total = Math.round((depthFactor * 0.75 + plankScore * 0.25) * 100);

  let stage = "PLANK_UP";
  if (usedElbowAngle <= 95) {
    stage = "BOTTOM";
  } else if (usedElbowAngle <= 135) {
    stage = "DESCENDING";
  }

  return {
    total,
    valid: true,
    stage,
    avgElbowAngle: Math.round(usedElbowAngle),
    plankAngle: Math.round(plankAngle),
    isPlankStraight,
    parts: {
      depth: Math.round(depthFactor * 100),
      posture: Math.round(plankScore * 100),
    },
  };
}

/**
 * State Machine สำหรับนับจำนวนครั้งของท่า Push-ups
 * รอบที่สมบูรณ์: PLANK_UP (>= 145°) -> DESCENDING -> BOTTOM (<= 95°) -> ASCENDING -> PLANK_UP (>= 145°) [Count +1]
 */
export function createPushupCounter() {
  let state = "PLANK_UP"; // PLANK_UP | DESCENDING | BOTTOM | ASCENDING
  let count = 0;
  let minElbowAngleInRep = 180;
  let maxScoreInRep = 0;
  let straightPlankHold = true;

  return {
    reset() {
      state = "PLANK_UP";
      count = 0;
      minElbowAngleInRep = 180;
      maxScoreInRep = 0;
      straightPlankHold = true;
    },
    update(score, result) {
      if (!result || !result.valid) {
        return { counted: false, count, state, feedback: "จัดตัวให้อยู่ในเฟรมกล้องด้านข้างหรือเฉียง 45°" };
      }

      const elbow = result.avgElbowAngle;
      if (elbow < minElbowAngleInRep) minElbowAngleInRep = elbow;
      if (score > maxScoreInRep) maxScoreInRep = score;
      if (!result.isPlankStraight) straightPlankHold = false;

      let counted = false;
      let feedback = "";

      switch (state) {
        case "PLANK_UP":
          if (elbow <= 95) {
            state = "BOTTOM";
            feedback = result.isPlankStraight ? "ลึกเยี่ยมมาก! ดันตัวขึ้น 🔥" : "ย่อได้ดี ดันตัวขึ้น";
          } else if (elbow < 140) {
            state = "DESCENDING";
            feedback = "ย่อตัวลง...";
          } else {
            feedback = result.isPlankStraight ? "พร้อม! ย่ออกลงพื้น" : "เกร็งหน้าท้อง รักษาหลังให้ตรง";
          }
          break;

        case "DESCENDING":
          if (elbow <= 95) {
            state = "BOTTOM";
            feedback = result.isPlankStraight ? "ลึกเยี่ยมมาก! ดันตัวขึ้น 🔥" : "ย่อได้ดี แต่ระวังอย่าให้ก้นหรือสะโพกตก";
          } else if (elbow >= 150) {
            // ย่อไม่ลึกพอแล้วดันกลับขึ้นมา
            state = "PLANK_UP";
            minElbowAngleInRep = 180;
            maxScoreInRep = 0;
            feedback = "ย่อให้ลึกอีกนิด ให้ข้อศอกพับ 90°";
          } else {
            feedback = "ย่ออกลงอีก...";
          }
          break;

        case "BOTTOM":
          if (elbow >= 145) {
            // ดันแขนตึงสำเร็จทันที
            count++;
            counted = true;
            state = "PLANK_UP";
            const repAccuracy = Math.min(100, Math.max(70, maxScoreInRep));
            feedback = straightPlankHold 
              ? (repAccuracy > 85 ? "วิดพื้นฟอร์มเป๊ะมาก! 🔥" : "นับ 1 ครั้ง! เยี่ยมมาก")
              : "นับ 1 ครั้ง! พยายามเกร็งลำตัวให้เป็นเส้นตรง";

            minElbowAngleInRep = 180;
            maxScoreInRep = 0;
            straightPlankHold = true;
            return { counted, count, state, feedback, accuracy: repAccuracy };
          } else if (elbow > 115) {
            state = "ASCENDING";
            feedback = "ดันแขนเหยียดขึ้นให้สุด";
          } else {
            feedback = "ดันตัวขึ้น";
          }
          break;

        case "ASCENDING":
          if (elbow >= 145) {
            // ดันแขนตึงสำเร็จ นับ 1 Rep!
            count++;
            counted = true;
            state = "PLANK_UP";
            const repAccuracy = Math.min(100, Math.max(70, maxScoreInRep));
            feedback = straightPlankHold 
              ? (repAccuracy > 85 ? "วิดพื้นฟอร์มเป๊ะมาก! 🔥" : "นับ 1 ครั้ง! เยี่ยมมาก")
              : "นับ 1 ครั้ง! พยายามเกร็งลำตัวให้เป็นเส้นตรง";

            minElbowAngleInRep = 180;
            maxScoreInRep = 0;
            straightPlankHold = true;
            return { counted, count, state, feedback, accuracy: repAccuracy };
          } else {
            feedback = "ดันขึ้นอีกนิด ให้แขนเหยียดตึง";
          }
          break;
      }

      return { counted, count, state, feedback };
    },
    get count() { return count; },
  };
}
