// ตรวจจับและนับครั้งท่า Dumbbell Bicep Curls (เล่นท่อนแขนด้านหน้า)
import { LM, dist, angle, smoothstep, visible } from "./common.js";

/**
 * ประเมินฟอร์มและความถูกต้องของท่า Bicep Curls ในเฟรมปัจจุบัน
 * @param {Array} lm - MediaPipe 33 Landmarks
 * @returns {Object} { total, valid, leftAngle, rightAngle, isCurled, isDown }
 */
export function scoreBicepCurl(lm) {
  const needed = [LM.L_SHOULDER, LM.R_SHOULDER, LM.L_ELBOW, LM.R_ELBOW, LM.L_WRIST, LM.R_WRIST];
  if (!lm || !visible(lm, ...needed)) {
    return { total: 0, valid: false, reason: "ไม่เห็นแขนและข้อศอกชัดเจน" };
  }

  // คำนวณมุมข้อศอกทั้ง 2 ข้าง
  const angleL = angle(lm[LM.L_SHOULDER], lm[LM.L_ELBOW], lm[LM.L_WRIST]);
  const angleR = angle(lm[LM.R_SHOULDER], lm[LM.R_ELBOW], lm[LM.R_WRIST]);

  // จุดยอดของการ Curl: มุมข้อศอกน้อยกว่า 65° (ยิ่งพับชิด ยิ่งเกร็งไบเซพได้เต็มที่)
  const curlScoreL = 1 - smoothstep(45, 120, angleL);
  const curlScoreR = 1 - smoothstep(45, 120, angleR);

  // เช็คว่าข้างไหนกำลังโฟกัส หรือทั้งสองข้าง
  const maxCurlScore = Math.max(curlScoreL, curlScoreR);
  const minAngle = Math.min(angleL, angleR);

  // สถานะ Curled (พับขึ้นสุด) vs Down (เหยียดลงสุด)
  const isCurled = minAngle <= 65;
  const isDown = angleL >= 140 && angleR >= 140;

  const total = isCurled ? 100 : Math.round(maxCurlScore * 90);

  return {
    total,
    valid: true,
    angleL: Math.round(angleL),
    angleR: Math.round(angleR),
    minAngle: Math.round(minAngle),
    isCurled,
    isDown,
    parts: {
      curlScore: Math.round(maxCurlScore * 100),
    },
  };
}

/**
 * State Machine สำหรับนับครั้งท่า Dumbbell Bicep Curls
 * รอบที่สมบูรณ์: DOWN (เหยียดแขน > 140°) -> CURLED (พับแขน <= 65°) -> DOWN (เหยียดแขน > 140°)
 */
export function createBicepCurlCounter() {
  let state = "DOWN"; // DOWN | CURLING | CURLED
  let count = 0;
  let peakAccuracy = 0;

  return {
    reset() {
      state = "DOWN";
      count = 0;
      peakAccuracy = 0;
    },
    update(score, result) {
      if (!result || !result.valid) {
        return { counted: false, count, state, feedback: "จัดแขนให้อยู่ในเฟรมกล้อง" };
      }

      const { minAngle, isCurled, isDown } = result;
      if (score > peakAccuracy) peakAccuracy = score;

      let counted = false;
      let feedback = "";

      switch (state) {
        case "DOWN":
          if (minAngle < 110) {
            state = "CURLING";
            feedback = "ยกดัมเบลขึ้น เกร็งต้นแขน!";
          } else {
            feedback = "เริ่มยกดัมเบลขึ้น";
          }
          break;

        case "CURLING":
          if (isCurled || minAngle <= 65) {
            state = "CURLED";
            feedback = "บีบไบเซพค้างไว้แป๊บ แล้วค่อยๆ ผ่อนลง";
          } else if (isDown) {
            state = "DOWN";
            peakAccuracy = 0;
            feedback = "พับข้อศอกขึ้นให้สุดก่อนค่อยผ่อน";
          } else {
            feedback = "ยกขึ้นอีกนิด...";
          }
          break;

        case "CURLED":
          if (isDown || minAngle >= 140) {
            // ผ่อนแขนลงสุด นับ 1 Rep!
            count++;
            counted = true;
            state = "DOWN";
            const repAccuracy = Math.min(100, Math.max(75, peakAccuracy));
            feedback = "สวยงาม! 1 ครั้ง เกร็งต่อไป 💪";
            peakAccuracy = 0;
            return { counted, count, state, feedback, accuracy: repAccuracy };
          } else {
            feedback = "ค่อยๆ ผ่อนแขนลงสุด";
          }
          break;
      }

      return { counted, count, state, feedback };
    },
    get count() { return count; },
  };
}
