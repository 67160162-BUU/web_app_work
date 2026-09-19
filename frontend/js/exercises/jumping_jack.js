// ตรวจจับและนับครั้งท่า Jumping Jacks (กระโดดตบ)
import { LM, dist, smoothstep, visible } from "./common.js";

/**
 * ประเมินฟอร์มและความถูกต้องของท่า Jumping Jacks ในเฟรมปัจจุบัน
 * @param {Array} lm - MediaPipe 33 Landmarks
 * @returns {Object} { total, valid, isOpen, isClosed, debug }
 */
export function scoreJumpingJack(lm) {
  const needed = [LM.NOSE, LM.L_SHOULDER, LM.R_SHOULDER, LM.L_WRIST, LM.R_WRIST, LM.L_HIP, LM.R_HIP];
  if (!lm || !visible(lm, ...needed)) {
    return { total: 0, valid: false, reason: "ไม่เห็นแขนหรือลำตัวชัดเจน" };
  }

  const shoulderW = dist(lm[LM.L_SHOULDER], lm[LM.R_SHOULDER]);
  if (shoulderW <= 0) return { total: 0, valid: false };

  // 1. ตรวจสอบตำแหน่งแขน (แกน Y ยิ่งน้อยยิ่งอยู่สูง)
  // สูงกว่าไหล่ / เหนือศีรษะ
  const noseY = lm[LM.NOSE].y;
  const avgShoulderY = (lm[LM.L_SHOULDER].y + lm[LM.R_SHOULDER].y) / 2;
  const avgWristY = (lm[LM.L_WRIST].y + lm[LM.R_WRIST].y) / 2;
  const avgHipY = (lm[LM.L_HIP].y + lm[LM.R_HIP].y) / 2;

  // แขนชูเหนือศีรษะ: 1.0 คือแขนสูงกว่าจมูก
  const armRaiseRatio = (avgShoulderY - avgWristY) / shoulderW;
  const armOpenScore = smoothstep(0.4, 1.2, armRaiseRatio);

  // แขนลงแนบลำตัว: ข้อมืออยู่ต่ำกว่าหรือใกล้สะโพก
  const armDownScore = smoothstep(0, 0.4, (avgWristY - avgShoulderY) / shoulderW);

  // 2. ตรวจสอบตำแหน่งขา (ถ้าระยะข้อเท้ามองเห็น)
  let legSpreadRatio = 1.0;
  let legOpenScore = 0.5;
  let legClosedScore = 0.5;

  if (visible(lm, LM.L_ANKLE, LM.R_ANKLE)) {
    const ankleDist = dist(lm[LM.L_ANKLE], lm[LM.R_ANKLE]);
    legSpreadRatio = ankleDist / shoulderW;
    // กางขา > 1.3 เท่าของความกว้างไหล่ = OPEN
    legOpenScore = smoothstep(0.8, 1.5, legSpreadRatio);
    // ขาชิด < 0.9 เท่าของความกว้างไหล่ = CLOSED
    legClosedScore = 1 - smoothstep(0.7, 1.3, legSpreadRatio);
  } else {
    // กรณีจับไม่เห็นข้อเท้า (ตั้งกล้องครึ่งตัว): ใช้องศาแขนและสะโพกเป็นหลัก
    legOpenScore = armOpenScore;
    legClosedScore = armDownScore;
  }

  // สถานะเปิด (Open / Peak Jack) vs สถานะปิด (Closed / Starting Jack)
  const isOpen = (avgWristY < noseY || armOpenScore > 0.65) && legOpenScore > 0.55;
  const isClosed = avgWristY > avgShoulderY && legClosedScore > 0.55;

  // คะแนนความตื่นตัวของฟอร์ม (0-100)
  const total = isOpen ? Math.round((armOpenScore * 0.5 + legOpenScore * 0.5) * 100) : 
                isClosed ? 100 : Math.round(armOpenScore * 60);

  return {
    total,
    valid: true,
    isOpen,
    isClosed,
    armRaiseRatio: Math.round(armRaiseRatio * 100) / 100,
    legSpreadRatio: Math.round(legSpreadRatio * 100) / 100,
    parts: {
      armRaise: Math.round(armOpenScore * 100),
      legSpread: Math.round(legOpenScore * 100),
    },
  };
}

/**
 * State Machine สำหรับนับครั้งท่า Jumping Jacks
 * รอบที่สมบูรณ์: CLOSED -> OPEN -> CLOSED
 */
export function createJumpingJackCounter() {
  let state = "CLOSED"; // CLOSED | OPENING | OPEN
  let count = 0;
  let peakScoreInRep = 0;

  return {
    reset() {
      state = "CLOSED";
      count = 0;
      peakScoreInRep = 0;
    },
    update(score, result) {
      if (!result || !result.valid) {
        return { counted: false, count, state, feedback: "ขยับให้อยู่ในระยะกล้อง" };
      }

      if (score > peakScoreInRep) peakScoreInRep = score;
      let counted = false;
      let feedback = "";

      switch (state) {
        case "CLOSED":
          if (result.isOpen) {
            state = "OPEN";
            feedback = "กางแขนขาเต็มที่!";
          } else {
            feedback = "กระโดดกางแขนขาออก";
          }
          break;

        case "OPEN":
          if (result.isClosed) {
            // หุบแขนขาลงกลับมาชิด นับ 1 Rep!
            count++;
            counted = true;
            state = "CLOSED";
            const repAccuracy = Math.min(100, Math.max(75, peakScoreInRep));
            feedback = "ยอดเยี่ยม! 1 ครั้ง 🔥";
            peakScoreInRep = 0;
            return { counted, count, state, feedback, accuracy: repAccuracy };
          } else {
            feedback = "หุบแขนขากลับมาชิด";
          }
          break;
      }

      return { counted, count, state, feedback };
    },
    get count() { return count; },
  };
}
