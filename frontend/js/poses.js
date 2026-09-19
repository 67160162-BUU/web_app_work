// ศูนย์รวมและดัชนีลงทะเบียนท่าทางและการออกกำลังกายทั้งหมด (Exercise & Pose Registry)
import { CFG } from "./config.js";
import { LM, dist, angle, smoothstep, visible } from "./exercises/common.js";
import { scoreSquat, createSquatCounter } from "./exercises/squat.js";
import { scoreJumpingJack, createJumpingJackCounter } from "./exercises/jumping_jack.js";
import { scoreHighKnee, createHighKneeCounter } from "./exercises/high_knee.js";
import { scoreBicepCurl, createBicepCurlCounter } from "./exercises/bicep_curl.js";
import { scoreShoulderPress, createShoulderPressCounter } from "./exercises/shoulder_press.js";
import { scoreStandingCrunch, createStandingCrunchCounter } from "./exercises/standing_crunch.js";

export { LM, dist, angle, smoothstep, visible };
export { scoreSquat, scoreJumpingJack, scoreHighKnee, scoreBicepCurl, scoreShoulderPress, scoreStandingCrunch };

/**
 * ฟังก์ชันประเมินคะแนนและความถูกต้องตามประเภทท่าออกกำลังกาย
 * @param {string} poseKey - คีย์ของท่า (เช่น squats, jumping_jacks)
 * @param {Array} lm - MediaPipe Landmarks 33 จุด
 */
export function evaluatePose(poseKey, lm) {
  switch (poseKey) {
    case "squats":
      return scoreSquat(lm);
    case "jumping_jacks":
      return scoreJumpingJack(lm);
    case "high_knees":
      return scoreHighKnee(lm);
    case "bicep_curls":
      return scoreBicepCurl(lm);
    case "shoulder_press":
      return scoreShoulderPress(lm);
    case "standing_crunches":
      return scoreStandingCrunch(lm);
    default:
      return scoreSquat(lm);
  }
}

/**
 * สร้าง State Machine Counter สำหรับนับ Reps ตามท่าออกกำลังกาย
 * @param {string} poseKey - คีย์ของท่า
 */
export function createPoseCounter(poseKey = "squats") {
  switch (poseKey) {
    case "squats":
      return createSquatCounter();
    case "jumping_jacks":
      return createJumpingJackCounter();
    case "high_knees":
      return createHighKneeCounter();
    case "bicep_curls":
      return createBicepCurlCounter();
    case "shoulder_press":
      return createShoulderPressCounter();
    case "standing_crunches":
      return createStandingCrunchCounter();

    default:
      return createSquatCounter();
  }
}
