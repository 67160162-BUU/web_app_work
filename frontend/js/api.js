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
    return JSON.parse(data);
  } catch {
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
    pose_key: scoreData.pose_key || "dab",
    score: Number(scoreData.score) || 0,
    dab_count: Number(scoreData.count) || 0,
    count: Number(scoreData.count) || 0,
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
  }
}

export function clearSession() {
  setAuthToken(null);
  localStorage.removeItem("dd_user_session");
  localStorage.removeItem("dd_current_user");
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
    dab: getBoard("dab", "count"),
    six_seven: getBoard("six_seven", "count"),
    scuba: getBoard("scuba", "count"),
  };
}

export async function submitScore(scoreData) {
  const payload = {
    ...scoreData,
    score: Math.round(Number(scoreData.score) || 0)
  };

  // 1. ส่งบันทึกเข้า MySQL Database โดยตรงเป็นหลัก
  try {
    const res = await fetch(`${BASE}/scores/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const dbResult = await res.json();
      console.log("✅ Saved successfully to MySQL Database:", dbResult);
      return dbResult;
    } else {
      console.warn("⚠️ MySQL DB API returned non-OK status:", res.status, await res.text());
    }
  } catch (err) {
    console.warn("⚠️ Cannot connect to MySQL DB Server, using LocalStorage fallback:", err);
  }

  // 2. สำรองลง LocalStorage เฉพาะกรณี DB หลุดหรือเชื่อมต่อไม่ได้เท่านั้น
  const saved = saveLocalScore(payload);
  return {
    id: saved.id,
    user_id: saved.user_id,
    display_name: saved.nickname,
    pose_key: saved.pose_key,
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

export async function registerUser(username, password, displayName, email = null) {
  const cleanUname = username.trim().toLowerCase();
  try {
    const res = await fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: cleanUname, password, display_name: displayName, email: email || null }),
    });

    if (res.ok) {
      const data = await res.json();
      saveSession(data.user, data.access_token);
      return data;
    } else {
      if (res.status === 404) {
        console.warn("⚠️ Auth API returned 404, using local session fallback");
        const localUser = { id: Date.now(), username: cleanUname, display_name: displayName, email: email || null, role: "player", is_guest: false };
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
      const localUser = { id: Date.now(), username: cleanUname, display_name: displayName, email: email || null, role: "player", is_guest: false };
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
      const updatedUser = await res.json();
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
