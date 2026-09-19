// ตรวจจับและนับครั้งท่า Dumbbell Shoulder Overhead Press (ไหล่ & หลังแขน)
import { LM, dist, angle, smoothstep, visible } from "./common.js";

/**
 * ประเมินฟอร์มและความถูกต้องของท่า Shoulder Press ในเฟรมปัจจุบัน
 * @param {Array} lm - MediaPipe 33 Landmarks
 * @returns {Object} { total, valid, isPressed, isLowered, debug }
 */
export function scoreShoulderPress(lm) {
  const needed = [LM.NOSE, LM.L_SHOULDER, LM.R_SHOULDER, LM.L_ELBOW, LM.R_ELBOW, LM.L_WRIST, LM.R_WRIST];
  if (!lm || !visible(lm, ...needed)) {
    return { total: 0, valid: false, reason: "ไม่เห็นหัวไหล่และท่อนแขน" };
  }

  const shoulderW = dist(lm[LM.L_SHOULDER], lm[LM.R_SHOULDER]) || 0.2;
  const noseY = lm[LM.NOSE].y;
  const avgShoulderY = (lm[LM.L_SHOULDER].y + lm[LM.R_SHOULDER].y) / 2;
  const avgWristY = (lm[LM.L_WRIST].y + lm[LM.R_WRIST].y) / 2;

  // คำนวณมุมข้อศอกทั้งสองข้าง
  const angleL = angle(lm[LM.L_SHOULDER], lm[LM.L_ELBOW], lm[LM.L_WRIST]);
  const angleR = angle(lm[LM.R_SHOULDER], lm[LM.R_ELBOW], lm[LM.R_WRIST]);
  const avgElbowAngle = (angleL + angleR) / 2;

  // ตำแหน่งดันขึ้นสุด (Pressed Overhead):
  // มือทั้งสองข้างสูงกว่าจมูก และข้อศอกเหยียดเกือบตรง (> 145°)
  const overheadRaise = (avgShoulderY - avgWristY) / shoulderW;
  const isPressed = avgWristY < noseY && avgElbowAngle >= 145 && overheadRaise > 0.7;

  // ตำแหน่งผ่อนลง (Lowered to Ears/Shoulders):
  // มืออยู่ระดับหูหรือใกล้ไหล่ และข้อศอกพับมุม 70° - 110°
  const isLowered = avgWristY >= noseY && avgElbowAngle <= 115;

  const pressFactor = smoothstep(0.4, 1.0, overheadRaise);
  const extensionFactor = smoothstep(100, 160, avgElbowAngle);
  const total = isPressed ? 100 : Math.round((pressFactor * 0.6 + extensionFactor * 0.4) * 100);

  return {
    total,
    valid: true,
    isPressed,
    isLowered,
    avgElbowAngle: Math.round(avgElbowAngle),
    overheadRaise: Math.round(overheadRaise * 100) / 100,
    parts: {
      extension: Math.round(extensionFactor * 100),
      height: Math.round(pressFactor * 100),
    },
  };
}

/**
 * State Machine สำหรับนับครั้งท่า Shoulder Press
 * รอบที่สมบูรณ์: LOWERED (ระดับหู/ไหล่) -> PRESSED (ดันเหนือหัวสุด) -> LOWERED
 */
export function createShoulderPressCounter() {
  let state = "LOWERED"; // LOWERED | PRESSING | PRESSED
  let count = 0;
  let maxScoreInRep = 0;

  return {
    reset() {
      state = "LOWERED";
      count = 0;
      maxScoreInRep = 0;
    },
    update(score, result) {
      if (!result || !result.valid) {
        return { counted: false, count, state, feedback: "จัดตัวให้อยู่ในเฟรมกล้อง" };
      }

      if (score > maxScoreInRep) maxScoreInRep = score;
      let counted = false;
      let feedback = "";

      switch (state) {
        case "LOWERED":
          if (result.overheadRaise > 0.45) {
            state = "PRESSING";
            feedback = "ดันดัมเบลขึ้นตรงเหนือหัว!";
          } else {
            feedback = "เตรียมพร้อม ดันขึ้นเหนือศีรษะ";
          }
          break;

        case "PRESSING":
          if (result.isPressed) {
            state = "PRESSED";
            feedback = "เหยียดแขนตรงสุด ดีมาก! ค่อยๆ ผ่อนลง";
          } else if (result.isLowered) {
            state = "LOWERED";
            maxScoreInRep = 0;
            feedback = "ดันขึ้นให้แขนเหยียดตรงสุดก่อน";
          } else {
            feedback = "ดันขึ้นอีกนิด...";
          }
          break;

        case "PRESSED":
          if (result.isLowered) {
            // ผ่อนลงมาระดับหูสำเร็จ นับ 1 Rep!
            count++;
            counted = true;
            state = "LOWERED";
            const repAccuracy = Math.min(100, Math.max(75, maxScoreInRep));
            feedback = "นับ 1 ครั้ง! ฟอร์มไหล่แน่นปึ้ก 🔥";
            maxScoreInRep = 0;
            return { counted, count, state, feedback, accuracy: repAccuracy };
          } else {
            feedback = "ค่อยๆ ผ่อนดัมเบลลงมาระดับหู";
          }
          break;
      }

      return { counted, count, state, feedback };
    },
    get count() { return count; },
  };
}
