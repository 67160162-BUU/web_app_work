// ตรวจจับและนับครั้งท่า Standing Cross Crunches (ยืนบิดศอกแตะเข่าสลับข้าง - หน้าท้องและแกนกลางลำตัว)
import { LM, dist, smoothstep, visible } from "./common.js";

/**
 * ประเมินฟอร์มและความถูกต้องของท่า Standing Cross Crunches ในเฟรมปัจจุบัน
 * @param {Array} lm - MediaPipe 33 Landmarks
 * @returns {Object} { total, valid, activeSide, crossDist, debug }
 */
export function scoreStandingCrunch(lm) {
  const needed = [LM.L_SHOULDER, LM.R_SHOULDER, LM.L_ELBOW, LM.R_ELBOW, LM.L_KNEE, LM.R_KNEE, LM.L_HIP, LM.R_HIP];
  if (!lm || !visible(lm, ...needed)) {
    return { total: 0, valid: false, reason: "ไม่เห็นข้อศอกหรือเข่า" };
  }

  const midShoulder = {
    x: (lm[LM.L_SHOULDER].x + lm[LM.R_SHOULDER].x) / 2,
    y: (lm[LM.L_SHOULDER].y + lm[LM.R_SHOULDER].y) / 2,
  };
  const midHip = {
    x: (lm[LM.L_HIP].x + lm[LM.R_HIP].x) / 2,
    y: (lm[LM.L_HIP].y + lm[LM.R_HIP].y) / 2,
  };
  const torsoLength = dist(midShoulder, midHip) || 0.3;

  // ระยะข้ามฝั่ง: ศอกซ้ายไปหาเข่าขวา (Left Crunch) vs ศอกขวาไปหาเข่าซ้าย (Right Crunch)
  const distLeftElbowRightKnee = dist(lm[LM.L_ELBOW], lm[LM.R_KNEE]) / torsoLength;
  const distRightElbowLeftKnee = dist(lm[LM.R_ELBOW], lm[LM.L_KNEE]) / torsoLength;

  // ยิ่งระยะห่างน้อย แปลว่ายิ่งบิดตัวดึงศอกกับเข่าเข้าหากันได้ลึก
  const isLeftCrunch = distLeftElbowRightKnee < 0.65 && distLeftElbowRightKnee < distRightElbowLeftKnee - 0.2;
  const isRightCrunch = distRightElbowLeftKnee < 0.65 && distRightElbowLeftKnee < distLeftElbowRightKnee - 0.2;

  let activeSide = null;
  let minCrossDist = 2.0;

  if (isLeftCrunch) {
    activeSide = "LEFT_TO_RIGHT";
    minCrossDist = distLeftElbowRightKnee;
  } else if (isRightCrunch) {
    activeSide = "RIGHT_TO_LEFT";
    minCrossDist = distRightElbowLeftKnee;
  }

  // คะแนน: 1.0 (ห่างมาก ยืนตรง) -> 0.4 หรือต่ำกว่า (ศอกเกือบแตะเข่า เกร็งท้องเต็มที่ = 100 คะแนน)
  const crunchScore = 1 - smoothstep(0.35, 0.9, minCrossDist);
  const total = activeSide ? Math.round(crunchScore * 100) : 30;

  return {
    total,
    valid: true,
    activeSide,
    crossDist: Math.round(minCrossDist * 100) / 100,
    parts: {
      crunchDepth: Math.round(crunchScore * 100),
    },
  };
}

/**
 * State Machine สำหรับนับครั้งท่า Standing Cross Crunches
 * นับสลับข้าง: บิดซ้ายแตะขวา -> บิดขวาแตะซ้าย...
 */
export function createStandingCrunchCounter() {
  let lastSide = null; // null | "LEFT_TO_RIGHT" | "RIGHT_TO_LEFT"
  let count = 0;
  let peakAccuracy = 0;

  return {
    reset() {
      lastSide = null;
      count = 0;
      peakAccuracy = 0;
    },
    update(score, result) {
      if (!result || !result.valid || !result.activeSide || score < 50) {
        return { counted: false, count, state: lastSide ?? "IDLE", feedback: "บิดศอกไปแตะเข่าฝั่งตรงข้าม!" };
      }

      const currentSide = result.activeSide;
      let counted = false;
      let feedback = "";

      if (currentSide !== lastSide) {
        lastSide = currentSide;
        count++;
        counted = true;
        peakAccuracy = score;
        feedback = "เกร็งหน้าท้องเยี่ยมมาก! บิดสลับอีกข้างต่อเลย 🔥";
        return { counted, count, state: currentSide, feedback, accuracy: Math.max(75, score) };
      } else {
        feedback = "สลับบิดอีกข้าง!";
      }

      return { counted: false, count, state: lastSide, feedback };
    },
    get count() { return count; },
  };
}
