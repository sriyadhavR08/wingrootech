import { createContext, useContext, useEffect, useState } from "react";
import { api, clearSession, saveTokens } from "../services/api";
const AuthContext = createContext(null);
const getStoredCandidate = () => {
  try {
    const adminRaw =
      sessionStorage.getItem("wingroo_admin_user") ||
      localStorage.getItem("wingroo_admin_user");
    if (adminRaw) {
      const parsed = JSON.parse(adminRaw);
      return { ...parsed, role: "ADMIN" };
    }
    const studentRaw =
      sessionStorage.getItem("wingroo_student_user") ||
      localStorage.getItem("wingroo_student_user");
    if (studentRaw) {
      const parsed = JSON.parse(studentRaw);
      return { ...parsed, role: parsed.role || "STUDENT" };
    }
  } catch {}
  return null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredCandidate);
  const [loading, setLoading] = useState(!getStoredCandidate());

  useEffect(() => {
    let live = true;
    const syncCurrent = () => {
      const current = getStoredCandidate();
      if (live) setUser(current);
    };

    const ended = () => {
      const stillActive = getStoredCandidate();
      if (!stillActive && live) setUser(null);
    };

    window.addEventListener("session-ended", ended);
    window.addEventListener("wingroo_auth_state_changed", syncCurrent);
    window.addEventListener("wingroo_student_logged_in", syncCurrent);
    window.addEventListener("wingroo_admin_logged_in", syncCurrent);
    window.addEventListener("wingroo_student_logged_out", ended);
    window.addEventListener("wingroo_admin_logged_out", ended);

    const savedTokens = sessionStorage.getItem("tokens") || localStorage.getItem("tokens");
    const mainSiteCandidate = getStoredCandidate();

    if (savedTokens) {
      api
        .get("/auth/me/")
        .then((r) => {
          if (live && r.data) {
            setUser((prev) => ({ ...prev, ...r.data }));
            if (r.data.role !== "ADMIN") {
              const updated = { ...(mainSiteCandidate || {}), ...r.data };
              sessionStorage.setItem("wingroo_student_user", JSON.stringify(updated));
              localStorage.setItem("wingroo_student_user", JSON.stringify(updated));
            }
          }
        })
        .catch(() => {
          if (live && mainSiteCandidate) {
            setUser(mainSiteCandidate);
          }
        })
        .finally(() => {
          if (live) setLoading(false);
        });
    } else if (mainSiteCandidate) {
      setUser(mainSiteCandidate);
      setLoading(false);
    } else {
      setLoading(false);
    }

    return () => {
      live = false;
      window.removeEventListener("session-ended", ended);
      window.removeEventListener("wingroo_auth_state_changed", syncCurrent);
      window.removeEventListener("wingroo_student_logged_in", syncCurrent);
      window.removeEventListener("wingroo_admin_logged_in", syncCurrent);
      window.removeEventListener("wingroo_student_logged_out", ended);
      window.removeEventListener("wingroo_admin_logged_out", ended);
    };
  }, []);

  async function login(values) {
    const { data } = await api.post("/auth/login/", values);
    saveTokens({ access: data.access, refresh: data.refresh });
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      const t = JSON.parse(sessionStorage.getItem("tokens") || localStorage.getItem("tokens") || "{}");
      if (t.refresh) await api.post("/auth/logout/", { refresh: t.refresh });
    } catch {
      // Local sign-out must still work when the server is unreachable.
    } finally {
      clearSession();
      sessionStorage.removeItem("wingroo_student_user");
      localStorage.removeItem("wingroo_student_user");
      sessionStorage.removeItem("wingroo_admin_user");
      localStorage.removeItem("wingroo_admin_user");
      sessionStorage.removeItem("wingroo_admin_auth");
      localStorage.removeItem("wingroo_admin_auth");
      sessionStorage.removeItem("tokens");
      localStorage.removeItem("tokens");
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
