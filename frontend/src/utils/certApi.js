import { API_BASE_URL } from '../config/api';

const BASE = API_BASE_URL || '';

export function getAuthTokens() {
  try {
    return JSON.parse(sessionStorage.getItem('wingroo_student_tokens') || '{}');
  } catch {
    return {};
  }
}

export function saveAuthTokens(tokens) {
  if (tokens) {
    sessionStorage.setItem('wingroo_student_tokens', JSON.stringify(tokens));
  }
}

export function clearStudentSession() {
  sessionStorage.removeItem('wingroo_student_tokens');
  sessionStorage.removeItem('wingroo_current_student');
}

export function getCurrentStudentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('wingroo_current_student') || 'null');
  } catch {
    return null;
  }
}

export function saveCurrentStudentUser(user) {
  if (user) {
    sessionStorage.setItem('wingroo_current_student', JSON.stringify(user));
  }
}

export async function certFetch(endpoint, options = {}) {
  const tokens = getAuthTokens();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (tokens.access) {
    headers['Authorization'] = `Bearer ${tokens.access}`;
  }

  const url = `${BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  let res = await fetch(url, { ...options, headers });

  // If 401 and refresh token exists, attempt refresh
  if (res.status === 401 && tokens.refresh && !options._retry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/token/refresh')) {
    options._retry = true;
    try {
      const refreshRes = await fetch(`${BASE}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: tokens.refresh })
      });
      const refreshData = await refreshRes.json();
      if (refreshRes.ok && refreshData.access) {
        saveAuthTokens({ ...tokens, access: refreshData.access });
        headers['Authorization'] = `Bearer ${refreshData.access}`;
        res = await fetch(url, { ...options, headers });
      } else {
        clearStudentSession();
      }
    } catch {
      clearStudentSession();
    }
  }

  return res;
}

export async function downloadCertificatePdf(certId, filename = 'Wingroo-Certificate.pdf') {
  const tokens = getAuthTokens();
  const headers = {};
  if (tokens.access) {
    headers['Authorization'] = `Bearer ${tokens.access}`;
  }
  const url = `${BASE}/api/certificates/${certId}/download/`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || 'Failed to download certificate PDF.');
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 2000);
}
