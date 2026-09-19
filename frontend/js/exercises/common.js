// เครื่องมือและสูตรคณิตศาสตร์ร่วมสำหรับวิเคราะห์ท่าออกกำลังกาย
import { CFG } from "../config.js";

// ดัชนีจุด Landmark 33 จุดของ MediaPipe Pose
export const LM = {
  NOSE: 0,
  L_EYE_INNER: 1, L_EYE: 2, L_EYE_OUTER: 3,
  R_EYE_INNER: 4, R_EYE: 5, R_EYE_OUTER: 6,
  L_EAR: 7, R_EAR: 8,
  MOUTH_L: 9, MOUTH_R: 10,
  L_SHOULDER: 11, R_SHOULDER: 12,
  L_ELBOW: 13, R_ELBOW: 14,
  L_WRIST: 15, R_WRIST: 16,
  L_PINKY: 17, R_PINKY: 18,
  L_INDEX: 19, R_INDEX: 20,
  L_THUMB: 21, R_THUMB: 22,
  L_HIP: 23, R_HIP: 24,
  L_KNEE: 25, R_KNEE: 26,
  L_ANKLE: 27, R_ANKLE: 28,
  L_HEEL: 29, R_HEEL: 30,
  L_FOOT_INDEX: 31, R_FOOT_INDEX: 32,
};

/**
 * คำนวณระยะห่างแบบ Euclidean ระยะ 2D
 */
export function dist(a, b) {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * คำนวณมุม (องศา 0..180) ที่จุดร่วม b ระหว่างจุด a - b - c
 */
export function angle(a, b, c) {
  if (!a || !b || !c) return 180;
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (mag === 0) return 0;
  const clamped = Math.max(-1, Math.min(1, dot / mag));
  return (Math.acos(clamped) * 180) / Math.PI;
}

/**
 * ฟังก์ชันปรับความลื่นไหลแบบ Hermite Interpolation (0..1)
 */
export function smoothstep(lo, hi, x) {
  if (lo === hi) return x >= hi ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}

/**
 * ตรวจสอบความชัดเจนในการมองเห็นของ Landmark
 */
export function visible(lm, ...ids) {
  if (!lm || lm.length < 33) return false;
  const minVis = CFG?.MIN_VISIBILITY ?? 0.5;
  return ids.every((id) => (lm[id]?.visibility ?? 1) >= minVis);
}

/**
 * กรองคะแนนย้อนหลัง N เฟรมเพื่อไม่ให้กระพริบ
 */
export function createSmoother(n = 5) {
  const buf = [];
  return (v) => {
    buf.push(v);
    if (buf.length > n) buf.shift();
    return buf.reduce((a, b) => a + b, 0) / buf.length;
  };
}
