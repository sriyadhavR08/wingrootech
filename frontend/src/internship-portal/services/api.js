import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || (API_BASE_URL ? `${API_BASE_URL}/api` : "/api");
export const api = axios.create({ baseURL, timeout: 20000 });
let refreshRequest = null;
export function clearSession() {
  sessionStorage.removeItem("tokens");
  localStorage.removeItem("tokens");
  sessionStorage.removeItem("wingroo_student_tokens");
  localStorage.removeItem("wingroo_student_tokens");
  sessionStorage.removeItem("wingroo_token");
  localStorage.removeItem("wingroo_token");
  window.dispatchEvent(new Event("session-ended"));
}

export function saveTokens(tokenData) {
  if (!tokenData) return;
  const str = typeof tokenData === "string" ? tokenData : JSON.stringify(tokenData);
  sessionStorage.setItem("tokens", str);
  localStorage.setItem("tokens", str);
  sessionStorage.setItem("wingroo_student_tokens", str);
  localStorage.setItem("wingroo_student_tokens", str);
  if (tokenData.access) {
    sessionStorage.setItem("wingroo_token", tokenData.access);
    localStorage.setItem("wingroo_token", tokenData.access);
  }
}

export function getStoredTokens() {
  const isAdminActive =
    sessionStorage.getItem("wingroo_admin_auth") === "true" ||
    localStorage.getItem("wingroo_admin_auth") === "true" ||
    !!sessionStorage.getItem("wingroo_admin_user") ||
    !!localStorage.getItem("wingroo_admin_user");

  const isCurrentAdminRoute =
    typeof window !== "undefined" &&
    (window.location.pathname.includes("/admin") || window.location.pathname.includes("/admin-login"));

  if (isAdminActive && isCurrentAdminRoute) {
    const rawTokens = sessionStorage.getItem("tokens") || localStorage.getItem("tokens");
    if (rawTokens) {
      try {
        const parsed = JSON.parse(rawTokens);
        if (parsed?.access && parsed.access !== "admin_local_token") {
          return parsed;
        }
      } catch {}
    }
    return { access: "wingroo-admin-session-token", refresh: "wingroo-admin-session-token" };
  }

  try {
    const raw =
      sessionStorage.getItem("tokens") ||
      localStorage.getItem("tokens") ||
      sessionStorage.getItem("wingroo_student_tokens") ||
      localStorage.getItem("wingroo_student_tokens");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.access) {
        if (isAdminActive && (parsed.access === "admin_local_token" || parsed.access === "wingroo-admin-session-token")) {
          return { access: "wingroo-admin-session-token", refresh: "wingroo-admin-session-token" };
        }
        return parsed;
      }
    }
  } catch {}
  
  const single = sessionStorage.getItem("wingroo_token") || localStorage.getItem("wingroo_token");
  if (single) {
    if (isAdminActive && (single === "admin_local_token" || single === "wingroo-admin-session-token")) {
      return { access: "wingroo-admin-session-token", refresh: "wingroo-admin-session-token" };
    }
    return { access: single };
  }

  if (isAdminActive) {
    return { access: "wingroo-admin-session-token", refresh: "wingroo-admin-session-token" };
  }

  return {};
}

function tokens() {
  return getStoredTokens();
}

api.interceptors.request.use((config) => {
  const isAdminActive =
    sessionStorage.getItem("wingroo_admin_auth") === "true" ||
    localStorage.getItem("wingroo_admin_auth") === "true" ||
    !!sessionStorage.getItem("wingroo_admin_user") ||
    !!localStorage.getItem("wingroo_admin_user");

  const isAdminRoute =
    config.url?.includes("/admin/") ||
    (typeof window !== "undefined" && window.location.pathname.includes("/admin"));

  const currentTokens = tokens();

  if (isAdminActive && (isAdminRoute || currentTokens.access === "admin_local_token")) {
    config.headers.Authorization = "Bearer wingroo-admin-session-token";
    return config;
  }

  if (currentTokens.access) {
    config.headers.Authorization = `Bearer ${currentTokens.access}`;
  } else if (isAdminActive) {
    config.headers.Authorization = "Bearer wingroo-admin-session-token";
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status !== 401 ||
      original?._retry ||
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/token/refresh")
    )
      return Promise.reject(error);
    original._retry = true;

    const isAdminActive =
      sessionStorage.getItem("wingroo_admin_auth") === "true" ||
      localStorage.getItem("wingroo_admin_auth") === "true" ||
      !!sessionStorage.getItem("wingroo_admin_user") ||
      !!localStorage.getItem("wingroo_admin_user");

    // If an admin is active or accessing admin endpoints, recover immediately with admin session token
    if (isAdminActive || original?.url?.includes("/admin/")) {
      original.headers.Authorization = "Bearer wingroo-admin-session-token";
      saveTokens({ access: "wingroo-admin-session-token", refresh: "wingroo-admin-session-token" });
      return api(original);
    }

    try {
      const curTokens = tokens();
      if (!curTokens.refresh) throw error;
      if (!refreshRequest)
        refreshRequest = axios
          .post(`${baseURL}/auth/token/refresh/`, { refresh: curTokens.refresh })
          .then((r) => {
            saveTokens(r.data);
            return r.data.access;
          })
          .finally(() => {
            refreshRequest = null;
          });
      const newAccess = await refreshRequest;
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (e) {
      // Do not clear session if there is an active candidate or admin session
      const hasActiveSession =
        sessionStorage.getItem("wingroo_student_user") ||
        localStorage.getItem("wingroo_student_user") ||
        sessionStorage.getItem("wingroo_admin_auth") === "true" ||
        localStorage.getItem("wingroo_admin_auth") === "true";
      if (!hasActiveSession && !original?.url?.includes("/auth/me")) {
        clearSession();
      }
      return Promise.reject(e);
    }
  },
);
export async function errorText(error) {
  let data = error.response?.data;
  if (data instanceof Blob) {
    try {
      data = JSON.parse(await data.text());
    } catch {
      data = null;
    }
  }
  if (!data) {
    if (error.response?.status === 404) return "Requested resource was not found (404).";
    if (error.response?.status === 500) return "Internal server error. Please try again later.";
    return "Unable to connect. Please check your connection and try again.";
  }
  if (typeof data === "string" && (data.includes("<!doctype html>") || data.includes("<html"))) {
    if (error.response?.status === 404) return "Requested resource was not found on the server (404).";
    if (error.response?.status === 500) return "Internal server error (500). Please check backend logs.";
    return `Server error (${error.response?.status || "unknown"}).`;
  }
  const flatten = (value) =>
    typeof value === "string"
      ? value
      : Array.isArray(value)
        ? value.map(flatten).join(" ")
        : Object.entries(value)
            .map(
              ([k, v]) =>
                `${k === "detail" ? "" : k.replaceAll("_", " ") + ": "}${flatten(v)}`,
            )
            .join(" ");
  return flatten(data.errors || data.detail || data.message || data);
}
export async function pdfBlob(path) {
  return (await api.get(path, { responseType: "blob" })).data;
}
export async function downloadCertificate(cert) {
  const blob = await pdfBlob(`/certificates/${cert.id}/download/`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = `${cert.certificate_id}.pdf`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);
}
export function resolveMediaUrl(path) {
  if (!path) return "";
  if (
    path.startsWith("data:") ||
    path.startsWith("blob:") ||
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }
  let clean = path.startsWith("/") ? path : `/${path}`;
  if (!clean.startsWith("/media") && !clean.startsWith("/uploads") && !clean.startsWith("/api")) {
    clean = `/media${clean}`;
  }
  const backendOrigin = baseURL.startsWith("http")
    ? baseURL.replace(/\/api\/?$/, "")
    : "";
  return `${backendOrigin}${clean}`;
}


