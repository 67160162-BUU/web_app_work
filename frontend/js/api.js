// รวมการเรียก backend ทุกเส้นทางไว้ที่เดียว (Auth, Scores, Admin, Share)
const BASE = (() => {
  if (typeof window === "undefined") return "http://localhost:8000/api";
  // ถ้าเข้าใช้งานผ่านพอร์ต 8000 ของ FastAPI Backend โดยตรง
  if (window.location.port === "8000") return "/api";
  
  // ถ้าเข้าใช้งานผ่าน XAMPP Apache (พอร์ต 80 หรือ port ว่าง) หรือ Local Dev Server อื่นๆ (3000, 5500, file://)
  // ให้เชื่อมต่อไปยัง Backend FastAPI ที่รันบนพอร์ต 8000
  const host = (window.location.hostname && window.location.hostname !== "") ? window.location.hostname : "localhost";
  const protocol = (window.location.protocol === "https:") ? "https:" : "http:";
  return `${protocol}//${host}:8000/api`;
})();


function getLocalScores() {
  const data = localStorage.getItem("dd_local_scores");
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    // กรองเอาคะแนนทดสอบเก่า (เช่น bill หรือ dab เก่า) ออกจาก LocalStorage ทันที
    const filtered = parsed.filter(s => {
      const name = (s.nickname || s.display_name || "").toLowerCase();
      return name !== "bill" && !name.includes("test") && s.pose_key !== "dab";
    });
    if (filtered.length !== parsed.length) {
      if (filtered.length === 0) {
        localStorage.removeItem("dd_local_scores");
      } else {
        localStorage.setItem("dd_local_scores", JSON.stringify(filtered));
      }
    }
    return filtered;
  } catch {
    localStorage.removeItem("dd_local_scores");
    return [];
  }
}

function saveLocalScore(scoreData) {
  const scores = getLocalScores();
  const newId = Date.now();
  const newEntry = {
    id: newId,
    user_id: newId,
    nickname: scoreData.display_name || "Guest",
    pose_key: scoreData.pose_key || "squats",
    course_key: scoreData.course_key || null,
    calories_burned: Number(scoreData.calories_burned) || (scoreData.pose_accuracy_details?.calories_burned ? Number(scoreData.pose_accuracy_details.calories_burned) : 0),
    score: Number(scoreData.score) || 0,
    count: Number(scoreData.count) || 0,
    pose_accuracy_details: scoreData.pose_accuracy_details || null,
    created_at: new Date().toISOString().replace("T", " ").substring(0, 19)
  };
  scores.push(newEntry);
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem("dd_local_scores", JSON.stringify(scores));
  return newEntry;
}

// ── Auth Token & Session Helpers ──
export function getAuthToken() {
  return localStorage.getItem("dd_token");
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("dd_token", token);
  } else {
    localStorage.removeItem("dd_token");
  }
}

export function getSavedSession() {
  const data = localStorage.getItem("dd_user_session");
  if (!data) return null;
  try {
    const sessionObj = JSON.parse(data);
    if (sessionObj && sessionObj.token) {
      setAuthToken(sessionObj.token);
    }
    return sessionObj;
  } catch {
    return null;
  }
}

export function saveSession(user, token) {
  if (token) setAuthToken(token);
  if (user) {
    const sessionObj = { token: token || getAuthToken(), user };
    localStorage.setItem("dd_user_session", JSON.stringify(sessionObj));
    localStorage.setItem("dd_current_user", JSON.stringify(user));
    if (user.weight) localStorage.setItem("dd_user_weight", user.weight.toString());
    if (user.height) localStorage.setItem("dd_user_height", user.height.toString());
  }
}

export function clearSession() {
  setAuthToken(null);
  localStorage.removeItem("dd_user_session");
  localStorage.removeItem("dd_current_user");
  localStorage.removeItem("dd_is_pro");
  localStorage.removeItem("dd_pro_expires");
  if (typeof document !== "undefined") {
    document.documentElement.classList.remove("is-pro-member");
    if (document.body) document.body.classList.remove("is-pro-member");
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dd_pro_status_changed", {
      detail: { isPro: false, expiresAt: null }
    }));
  }
}

function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

// ── Score APIs ──
export async function syncLocalScoresToDatabase() {
  const localScores = getLocalScores();
  if (!localScores || localScores.length === 0) return { synced: 0, remaining: 0 };

  const remainingScores = [];
  let syncedCount = 0;

  for (const s of localScores) {
    try {
      const res = await fetch(`${BASE}/scores/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          display_name: s.nickname || s.display_name || "Guest",
          score: Math.round(Number(s.score) || 0),
          count: Number(s.count || s.dab_count || 0),
          pose_key: s.pose_key || "dab",
        }),
      });
      if (res.ok) {
        syncedCount++;
      } else {
        remainingScores.push(s);
      }
    } catch {
      remainingScores.push(s);
    }
  }

  if (remainingScores.length === 0) {
    localStorage.removeItem("dd_local_scores");
  } else {
    localStorage.setItem("dd_local_scores", JSON.stringify(remainingScores));
  }

  if (syncedCount > 0) {
    console.log(`🚀 [Auto-Sync] Successfully synced ${syncedCount} score(s) from LocalStorage to MySQL Database!`);
  }
  return { synced: syncedCount, remaining: remainingScores.length };
}

export async function fetchTopScores(limit = 20) {
  try {
    const res = await fetch(`${BASE}/scores/top?limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // ซิงค์ข้อมูลค้างใน LocalStorage ไปยัง DB อัตโนมัติเมื่อต่อ DB ได้
        syncLocalScoresToDatabase().catch(() => {});
        return data;
      }
    }
  } catch (err) {
    console.warn("⚠️ DB Connection offline, using local storage fallback:", err);
  }
  const scores = getLocalScores();
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, limit);
}

export async function fetchLeaderboards(limit = 10) {
  try {
    const res = await fetch(`${BASE}/scores/leaderboards?limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      // ซิงค์คะแนนออฟไลน์ที่เคยบันทึกไว้ใน LocalStorage เข้าสู่ MySQL อัตโนมัติ
      syncLocalScoresToDatabase().catch(() => {});
      return data;
    }
  } catch (err) {
    console.warn("⚠️ DB Connection offline, using local storage fallback:", err);
  }

  const scores = getLocalScores();
  const getBoard = (poseFilter = null, sortBy = "score") => {
    let list = scores.slice();
    if (poseFilter) {
      list = list.filter((s) => (s.pose_key || "dab") === poseFilter);
    }
    if (sortBy === "count") {
      list.sort((a, b) => (b.count ?? b.dab_count ?? 0) - (a.count ?? a.dab_count ?? 0));
    } else {
      list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
    return list.slice(0, limit);
  };

  return {
    overall: getBoard(null, "score"),
    pushups: getBoard("pushups", "count"),
    squats: getBoard("squats", "count"),
    jumping_jacks: getBoard("jumping_jacks", "count"),
    high_knees: getBoard("high_knees", "count"),
    bicep_curls: getBoard("bicep_curls", "count"),
    shoulder_press: getBoard("shoulder_press", "count"),
    standing_crunches: getBoard("standing_crunches", "count"),
    // Fallback
    dab: getBoard("dab", "count"),
  };
}

export async function submitScore(scoreData) {
  const payload = {
    ...scoreData,
    score: Math.round(Number(scoreData.score) || 0),
    count: Number(scoreData.count) || 0,
    calories_burned: Number(scoreData.calories_burned) || (scoreData.pose_accuracy_details?.calories_burned ? Number(scoreData.pose_accuracy_details.calories_burned) : 0),
    course_key: scoreData.course_key || null
  };

  // 1. ส่งบันทึกเข้า Database โดยตรงเป็นหลัก
  try {
    const res = await fetch(`${BASE}/scores/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const dbResult = await res.json();
      console.log("✅ Saved successfully to Database:", dbResult);
      return dbResult;
    } else {
      console.warn("⚠️ DB API returned non-OK status:", res.status, await res.text());
    }
  } catch (err) {
    console.warn("⚠️ Cannot connect to DB Server, using LocalStorage fallback:", err);
  }

  // 2. สำรองลง LocalStorage เฉพาะกรณี DB หลุดหรือเชื่อมต่อไม่ได้เท่านั้น
  const saved = saveLocalScore(payload);
  return {
    id: saved.id,
    user_id: saved.user_id,
    display_name: saved.nickname,
    pose_key: saved.pose_key,
    course_key: saved.course_key,
    calories_burned: saved.calories_burned,
    score: saved.score,
    count: saved.count,
    created_at: saved.created_at
  };
}

// ── Auth APIs ──
export async function loginUser(username, password) {
  const cleanUname = username.trim().toLowerCase();
  try {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: cleanUname, password }),
    });
    
    if (res.ok) {
      const data = await res.json();
      saveSession(data.user, data.access_token);
      setProStatus(Boolean(data.user?.is_pro), data.user?.pro_expires_at);
      return data;
    } else {
      if (res.status === 404) {
        console.warn("⚠️ Auth API returned 404, using local session fallback");
        const localUser = { id: Date.now(), username: cleanUname, display_name: username, role: "player", is_guest: false };
        const localToken = "offline-token-" + Date.now();
        saveSession(localUser, localToken);
        return { user: localUser, access_token: localToken };
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Username หรือ Password ไม่ถูกต้อง");
    }
  } catch (err) {
    if (err.name === "TypeError" && (err.message.includes("fetch") || err.message.includes("Failed"))) {
      // Fallback สำหรับกรณีรันแบบ Offline โดยไม่ได้เปิด Backend FastAPI
      console.warn("⚠️ Backend Server offline, creating local offline session");
      const localUser = { id: Date.now(), username: cleanUname, display_name: username, role: "player", is_guest: false };
      const localToken = "offline-token-" + Date.now();
      saveSession(localUser, localToken);
      return { user: localUser, access_token: localToken };
    }
    throw err;
  }
}

export async function registerUser(username, password, displayName, email = null, weight = 65, height = 170) {
  const cleanUname = username.trim().toLowerCase();
  const numWeight = parseFloat(weight) || 65;
  const numHeight = parseFloat(height) || 170;
  try {
    const res = await fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        username: cleanUname, 
        password, 
        display_name: displayName, 
        email: email || null,
        weight: numWeight,
        height: numHeight
      }),
    });

    if (res.ok) {
      const data = await res.json();
      saveSession(data.user, data.access_token);
      setProStatus(Boolean(data.user?.is_pro), data.user?.pro_expires_at);
      return data;
    } else {
      if (res.status === 404) {
        console.warn("⚠️ Auth API returned 404, using local session fallback");
        const localUser = { id: Date.now(), username: cleanUname, display_name: displayName, email: email || null, weight: numWeight, height: numHeight, role: "player", is_guest: false };
        const localToken = "offline-token-" + Date.now();
        saveSession(localUser, localToken);
        return { user: localUser, access_token: localToken };
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "ไม่สามารถลงทะเบียนได้ (อาจมี Username หรือ Email นี้แล้ว)");
    }
  } catch (err) {
    if (err.name === "TypeError" && (err.message.includes("fetch") || err.message.includes("Failed"))) {
      // Fallback สำหรับกรณีรันแบบ Offline โดยไม่ได้เปิด Backend FastAPI
      console.warn("⚠️ Backend Server offline, registering local offline user");
      const localUser = { id: Date.now(), username: cleanUname, display_name: displayName, email: email || null, weight: numWeight, height: numHeight, role: "player", is_guest: false };
      const localToken = "offline-token-" + Date.now();
      saveSession(localUser, localToken);
      return { user: localUser, access_token: localToken };
    }
    throw err;
  }
}

export async function fetchCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch(`${BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ใช้ LocalStorage เมื่อไม่ได้รัน Backend Server
  }
  const localUser = localStorage.getItem("dd_current_user");
  return localUser ? JSON.parse(localUser) : { username: "Player", display_name: "Player" };
}

export async function updateUserProfile(userId, updateData) {
  try {
    const res = await fetch(`${BASE}/users/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    if (res.ok) {
      const resp = await res.json();
      const updatedUser = resp.user || resp;
      const session = getSavedSession();
      if (session) {
        session.user = { ...session.user, ...updatedUser };
        saveSession(session.user, session.token);
      }
      return updatedUser;
    }
  } catch (err) {
    console.warn("⚠️ Cannot connect to backend server, updating local session only:", err);
  }
  // Local fallback
  const session = getSavedSession();
  if (session && session.user) {
    if (updateData.display_name) session.user.display_name = updateData.display_name;
    if (updateData.email) session.user.email = updateData.email;
    if (updateData.weight !== undefined) session.user.weight = parseFloat(updateData.weight);
    if (updateData.height !== undefined) session.user.height = parseFloat(updateData.height);
    saveSession(session.user, session.token);
    return session.user;
  }
  return updateData;
}

// ── Admin APIs ──
export async function fetchAdminUsers() {
  const res = await fetch(`${BASE}/admin/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "ไม่สามารถโหลดรายชื่อผู้ใช้ได้ (ต้องใช้สิทธิ์ Admin)");
  }
  return res.json();
}


export async function updateAdminUserRole(userId, newRole) {
  const res = await fetch(`${BASE}/admin/users/${userId}/role`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ role: newRole }),
  });
  if (!res.ok) throw new Error("เปลี่ยนสิทธิ์ผู้ใช้ไม่สำเร็จ");
  return res.json();
}

export async function deleteAdminUser(userId) {
  const res = await fetch(`${BASE}/admin/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("ลบผู้ใช้ไม่สำเร็จ");
  return res.json();
}

export async function deleteAdminScore(scoreId) {
  const res = await fetch(`${BASE}/admin/scores/${scoreId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("ลบคะแนนไม่สำเร็จ");
  return res.json();
}

// ── Subscription & Pro Tier APIs (PromptPay Scan-to-Pay Engine) ──

export function isProUser() {
  if (typeof window === "undefined") return false;

  // 1. ตรวจสอบจาก URL Query Parameter ก่อนเสมอ (สำหรับการทดสอบ ?pro=1 หรือ ?pro=0)
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("pro") === "1") return true;
    if (params.get("pro") === "0") return false;
  } catch (e) {}

  const checkExpired = (expires) => {
    if (!expires) return false;
    const cleanExpires = typeof expires === "string" ? expires.replace(" ", "T") : expires;
    const expDate = new Date(cleanExpires);
    return !isNaN(expDate.getTime()) && expDate < new Date();
  };

  // 2. ตรวจสอบจาก Session ของ User ที่ล็อกอิน (ข้อมูลจาก Database คือ Single Source of Truth)
  const session = getSavedSession();
  if (session && session.user) {
    if (Boolean(session.user.is_pro)) {
      const expires = session.user.pro_expires_at || localStorage.getItem("dd_pro_expires");
      if (checkExpired(expires)) {
        session.user.is_pro = false;
        saveSession(session.user, session.token);
        localStorage.removeItem("dd_is_pro");
        localStorage.removeItem("dd_pro_expires");
        return false;
      }
      return true;
    }
    // หากเป็นผู้ใช้ที่ล็อกอินแล้ว และใน DB ระบุว่า is_pro = false ให้ยึดตาม DB ทันที (ห้ามตกไปเช็ค dd_is_pro ตกค้าง)
    return false;
  }

  // 3. ตรวจสอบจาก LocalStorage Flag เฉพาะผู้ใช้ทั่วไป / Guest ที่ทดลองเปิดใช้งาน
  if (localStorage.getItem("dd_is_pro") === "true") {
    const expires = localStorage.getItem("dd_pro_expires");
    if (checkExpired(expires)) {
      localStorage.removeItem("dd_is_pro");
      localStorage.removeItem("dd_pro_expires");
      return false;
    }
    return true;
  }

  return false;
}

/**
 * ดึงสถานะ is_pro ล่าสุดจาก Database จริงผ่าน Backend API
 * หากเป็น Pro ระบบจะซิงค์เข้า Session และแจ้งเตือน UI อัตโนมัติ
 */
export async function checkDbProStatus() {
  const session = getSavedSession();
  if (!session || !session.user) {
    return isProUser();
  }

  try {
    let freshUser = null;
    const token = getAuthToken();
    if (token && !token.startsWith("offline-token-")) {
      const res = await fetch(`${BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        freshUser = await res.json();
      }
    }

    if (!freshUser && session.user.id) {
      const resUser = await fetch(`${BASE}/users/${session.user.id}`, {
        headers: getAuthHeaders(),
      });
      if (resUser.ok) {
        freshUser = await resUser.json();
      }
    }

    if (freshUser) {
      const checkExpired = (expires) => {
        if (!expires) return false;
        const cleanExpires = typeof expires === "string" ? expires.replace(" ", "T") : expires;
        const expDate = new Date(cleanExpires);
        return !isNaN(expDate.getTime()) && expDate < new Date();
      };

      let isProDb = Boolean(freshUser.is_pro);
      if (isProDb && checkExpired(freshUser.pro_expires_at)) {
        isProDb = false;
      }

      session.user = { ...session.user, ...freshUser, is_pro: isProDb };
      saveSession(session.user, session.token);
      setProStatus(isProDb, freshUser.pro_expires_at || session.user.pro_expires_at);
      return isProDb;
    }
  } catch (err) {
    console.warn("⚠️ Could not check is_pro from DB, using cached status:", err);
  }

  return isProUser();
}

export function setProStatus(isPro, expiresAt = null) {
  if (isPro) {
    localStorage.setItem("dd_is_pro", "true");
    if (expiresAt) {
      localStorage.setItem("dd_pro_expires", expiresAt);
    } else {
      const defaultExp = new Date();
      defaultExp.setDate(defaultExp.getDate() + 30);
      localStorage.setItem("dd_pro_expires", defaultExp.toISOString());
    }
  } else {
    localStorage.removeItem("dd_is_pro");
    localStorage.removeItem("dd_pro_expires");
  }

  // อัปเดต class ใน DOM ทันที
  if (typeof document !== "undefined") {
    if (isPro) {
      document.documentElement.classList.add("is-pro-member");
      if (document.body) document.body.classList.add("is-pro-member");
    } else {
      document.documentElement.classList.remove("is-pro-member");
      if (document.body) document.body.classList.remove("is-pro-member");
    }
  }

  // อัปเดตใน session ถ้ามี
  const session = getSavedSession();
  if (session && session.user) {
    session.user.is_pro = Boolean(isPro);
    if (expiresAt) session.user.pro_expires_at = expiresAt;
    saveSession(session.user, session.token);
  }

  // ส่ง Event แจ้งเตือนทุกส่วนของหน้าเว็บให้ปรับ UI ทันที
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dd_pro_status_changed", {
      detail: { isPro: Boolean(isPro), expiresAt }
    }));
  }
}

export async function upgradeUserToPro(plan = "monthly", days = 30) {
  const session = getSavedSession();
  let backendResult = null;

  if (session && session.user && session.user.id) {
    try {
      const res = await fetch(`${BASE}/users/${session.user.id}/upgrade-pro`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ plan, days }),
      });
      if (res.ok) {
        backendResult = await res.json();
      }
    } catch (err) {
      console.warn("⚠️ Cannot notify backend of PRO upgrade, fallback to local:", err);
    }
  }

  const expDate = new Date();
  expDate.setDate(expDate.getDate() + days);
  const expStr = backendResult?.pro_expires_at || expDate.toISOString();

  setProStatus(true, expStr);
  return {
    success: true,
    is_pro: true,
    pro_expires_at: expStr,
    plan,
    backendSynced: Boolean(backendResult)
  };
}

/**
 * จำลองการสแกนจ่ายเงินผ่าน PromptPay QR Code (Simulated Payment Gateway)
 * มี Delay เสมือนจริง 1.5 วินาที สำหรับจำลองการ Verify จาก SlipOK หรือ Webhook ธนาคาร
 */
export async function simulatePromptPayPayment({ plan = "monthly", amount = 99 } = {}) {
  const refCode = "PRO-2026-" + Math.floor(100000 + Math.random() * 900000);
  
  // จำลองเวลารอการตรวจสอบสลิปจาก Gateway 1500 ms
  await new Promise(resolve => setTimeout(resolve, 1500));

  const result = await upgradeUserToPro(plan, 30);
  return {
    ...result,
    refCode,
    amount,
    paidAt: new Date().toISOString()
  };
}

export async function toggleAdminUserPro(userId) {
  const token = getAuthToken();
  const res = await fetch(`${BASE}/admin/users/${userId}/toggle-pro`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("ไม่สามารถเปลี่ยนสถานะ PRO ได้");
  return await res.json();
}
