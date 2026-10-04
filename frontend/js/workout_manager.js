// ตัวจัดการลำดับคอร์สออกกำลังกายและรอบการฝึก (Workout Routine Manager)
import { CFG, WORKOUT_COURSES, EXERCISES } from "./config.js?v=2.1";
import { evaluatePose, createPoseCounter } from "./poses.js?v=2.1";
import { CalorieTracker } from "./calories.js?v=2.1";
import { isProUser } from "./api.js?v=2.1";

// AI Real-time Verbal Voice Coach สำหรับสมาชิก PRO (Web Speech API)
class VoiceCoach {
  constructor() {
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.enabled = true;
    this.lastSpokenTime = 0;
    this.minIntervalMs = 3800; // ป้องกันการพูดรัวซ้ำ
  }

  speak(text, isPro = false) {
    if (!this.synth || !this.enabled || !isPro || !text) return;
    const now = Date.now();
    if (now - this.lastSpokenTime < this.minIntervalMs) return;
    this.lastSpokenTime = now;

    try {
      if (this.synth.speaking) this.synth.cancel();
      // ตัดสัญลักษณ์ emoji ออกก่อนพูด
      const clean = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "").trim();
      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "th-TH";
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      this.synth.speak(utterance);
    } catch {
      // SpeechSynthesis may fail silently in background tabs
    }
  }
}

// Web Audio API สำหรับเสียงสังเคราะห์ให้กำลังใจและสัญญาณเตือน
class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // เสียงเมื่อนับสำเร็จ 1 Rep
  playRepSound() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // เสียงนับถอยหลังพัก (Tick 3, 2, 1)
  playTickSound() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // เสียงหมดเวลาพัก เริ่มเซ็ตใหม่ (Go!)
  playGoSound() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.25); // C6
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // เสียงจบเซ็ต (Set Complete Fanfare)
  playSetCompleteSound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      const start = now + idx * 0.1;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  }

  // เสียงจบคอร์สชนะเลิศ (Victory!)
  playVictorySound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      const start = now + idx * 0.12;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.28, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  }
}

export class WorkoutRoutineManager {
  constructor(options = {}) {
    this.course = null;
    this.currentExIndex = 0;
    this.currentSet = 1;
    this.currentReps = 0;
    this.totalReps = 0;
    this.totalSetsCount = 0;
    this.completedSets = 0;

    this.state = "IDLE"; // IDLE | COUNTDOWN | ACTIVE_SET | REST_INTERVAL | PAUSED | COMPLETED
    this.restTimeLeft = 0;
    this.restTimer = null;
    this.activeDurationSeconds = 0;
    this.durationTimer = null;

    this.accuracyScores = [];
    this.calorieTracker = new CalorieTracker();
    this.sounds = new SoundEffects();
    this.voiceCoach = new VoiceCoach();

    // Callbacks
    this.onStateChange = options.onStateChange || (() => {});
    this.onRep = options.onRep || (() => {});
    this.onRestTick = options.onRestTick || (() => {});
    this.onCaloriesUpdate = options.onCaloriesUpdate || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onFeedback = options.onFeedback || (() => {});

    this.activeCounter = null;
  }

  loadCourse(courseOrId = "beginner_fullbody") {
    let course;
    if (typeof courseOrId === "object" && courseOrId !== null) {
      course = courseOrId;
    } else {
      course = WORKOUT_COURSES[courseOrId] || WORKOUT_COURSES.beginner_fullbody;
    }
    this.course = course;
    this.currentExIndex = 0;
    this.currentSet = 1;
    this.currentReps = 0;
    this.totalReps = 0;
    this.completedSets = 0;
    this.accuracyScores = [];
    this.activeDurationSeconds = 0;
    this.calorieTracker.reset();

    // คำนวณจำนวนเซ็ตทั้งหมด
    this.totalSetsCount = (course.exercises || []).reduce((sum, ex) => sum + (ex.sets || 1), 0);
    this.setupCurrentExercise();
    this.setState("IDLE");
    return this.course;
  }

  setupCurrentExercise() {
    if (!this.course || !this.course.exercises[this.currentExIndex]) return;
    const currentEx = this.course.exercises[this.currentExIndex];
    this.currentReps = 0;
    this.activeCounter = createPoseCounter(currentEx.pose_key);
    this.calorieTracker.setExercise(currentEx.met || 6.0);
  }

  getCurrentExercise() {
    return this.course?.exercises[this.currentExIndex] || null;
  }

  getCurrentExerciseDef() {
    const ex = this.getCurrentExercise();
    if (!ex) return null;
    return EXERCISES[ex.pose_key] || null;
  }

  start() {
    this.sounds.init();
    this.startActiveDurationTimer();
    this.setState("ACTIVE_SET");
  }

  startActiveDurationTimer() {
    if (this.durationTimer) clearInterval(this.durationTimer);
    this.durationTimer = setInterval(() => {
      if (this.state === "ACTIVE_SET") {
        this.activeDurationSeconds++;
        this.calorieTracker.tick(1);
        this.onCaloriesUpdate(this.calorieTracker.getCalories());
      }
    }, 1000);
  }

  stopTimers() {
    if (this.durationTimer) clearInterval(this.durationTimer);
    if (this.restTimer) clearInterval(this.restTimer);
  }

  setState(newState, payload = {}) {
    this.state = newState;
    this.onStateChange(newState, {
      course: this.course,
      exercise: this.getCurrentExercise(),
      exerciseDef: this.getCurrentExerciseDef(),
      currentExIndex: this.currentExIndex,
      totalExercises: this.course?.exercises.length || 0,
      currentSet: this.currentSet,
      currentReps: this.currentReps,
      totalReps: this.totalReps,
      calories: this.calorieTracker.getCalories(),
      activeDurationSeconds: this.activeDurationSeconds,
      ...payload,
    });
  }

  // เรียกทุกเฟรมจาก MediaPipe
  processPose(landmarks, smoothedScore) {
    if (this.state !== "ACTIVE_SET" || !this.activeCounter) return null;

    const currentEx = this.getCurrentExercise();
    if (!currentEx) return null;

    const result = evaluatePose(currentEx.pose_key, landmarks);
    const counterRes = this.activeCounter.update(smoothedScore, result);

    if (counterRes.feedback) {
      this.onFeedback(counterRes.feedback);
      this.voiceCoach.speak(counterRes.feedback, isProUser());
    }

    if (counterRes.counted) {
      this.currentReps++;
      this.totalReps++;
      const repAccuracy = counterRes.accuracy || Math.round(smoothedScore);
      this.accuracyScores.push(repAccuracy);

      this.calorieTracker.onRep();
      this.sounds.playRepSound();

      this.onRep({
        currentReps: this.currentReps,
        targetReps: currentEx.target_reps,
        totalReps: this.totalReps,
        accuracy: repAccuracy,
        calories: this.calorieTracker.getCalories(),
      });

      // เช็คว่าครบจำนวนเป้าหมายของเซ็ตหรือยัง (Target Reps Reached)
      if (this.currentReps >= currentEx.target_reps) {
        this.handleSetCompleted();
      }
    }

    return { result, counterRes };
  }

  handleSetCompleted() {
    this.completedSets++;
    const currentEx = this.getCurrentExercise();
    const restTime = typeof currentEx.rest_seconds === "number" ? currentEx.rest_seconds : 20;

    if (this.currentSet < currentEx.sets) {
      // ยังมีเซ็ตต่อไปในท่าเดิม -> พักระหว่างเซ็ต (Rest Interval)
      if (restTime <= 0) {
        this.proceedToNextSet(false);
      } else {
        this.sounds.playSetCompleteSound();
        this.startRestInterval(restTime, false);
      }
    } else {
      // เซ็ตสุดท้ายของท่านี้จบแล้ว -> ตรวจสอบว่ายังมีท่าถัดไปในคอร์สหรือไม่
      if (this.currentExIndex + 1 < this.course.exercises.length) {
        if (restTime <= 0) {
          this.proceedToNextSet(true);
        } else {
          this.sounds.playSetCompleteSound();
          this.startRestInterval(restTime + 5, true); // พักเพิ่ม 5 วินาทีก่อนเปลี่ยนท่า
        }
      } else {
        // จบคอร์สทั้งหมดสมบูรณ์ (Course Complete!)
        this.handleWorkoutComplete();
      }
    }
  }

  startRestInterval(durationSeconds = 20, isNextExercise = false) {
    if (durationSeconds <= 0) {
      this.proceedToNextSet(isNextExercise);
      return;
    }
    this.restTimeLeft = durationSeconds;
    const nextInfo = isNextExercise
      ? { nextExercise: this.course.exercises[this.currentExIndex + 1], nextSet: 1 }
      : { nextExercise: this.getCurrentExercise(), nextSet: this.currentSet + 1 };

    this.setState("REST_INTERVAL", {
      restSeconds: this.restTimeLeft,
      isNextExercise,
      ...nextInfo,
    });

    if (this.restTimer) clearInterval(this.restTimer);
    this.restTimer = setInterval(() => {
      this.restTimeLeft--;
      this.onRestTick(this.restTimeLeft);

      if (this.restTimeLeft <= 3 && this.restTimeLeft > 0) {
        this.sounds.playTickSound();
      } else if (this.restTimeLeft === 0) {
        this.sounds.playGoSound();
        clearInterval(this.restTimer);
        this.proceedToNextSet(isNextExercise);
      }
    }, 1000);
  }

  skipRest() {
    if (this.state !== "REST_INTERVAL") return;
    if (this.restTimer) clearInterval(this.restTimer);
    const isNext = this.currentSet >= (this.getCurrentExercise()?.sets || 1);
    this.sounds.playGoSound();
    this.proceedToNextSet(isNext);
  }

  proceedToNextSet(isNextExercise) {
    if (isNextExercise) {
      this.currentExIndex++;
      this.currentSet = 1;
    } else {
      this.currentSet++;
    }

    this.setupCurrentExercise();
    this.setState("ACTIVE_SET");
  }

  handleWorkoutComplete() {
    this.stopTimers();
    this.sounds.playVictorySound();
    this.voiceCoach.speak("ยอดเยี่ยมมาก จบคอร์สการฝึกซ้อมแล้วครับ", isProUser());

    const summary = this.getSummary();
    this.setState("COMPLETED", { summary });
    this.onComplete(summary);
  }

  getSummary() {
    const totalAcc = this.accuracyScores.length > 0
      ? Math.round(this.accuracyScores.reduce((a, b) => a + b, 0) / this.accuracyScores.length)
      : 85;

    return {
      courseId: this.course?.id || "custom",
      courseName: this.course?.name || "Workout Session",
      category: this.course?.category || "Full Body",
      completedSets: this.completedSets,
      totalSets: this.totalSetsCount,
      totalReps: this.totalReps,
      totalCalories: this.calorieTracker.getCalories(),
      durationSeconds: this.activeDurationSeconds,
      avgAccuracy: totalAcc,
    };
  }

  destroy() {
    this.stopTimers();
  }
}
