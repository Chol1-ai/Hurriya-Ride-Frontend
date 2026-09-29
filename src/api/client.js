function getApiUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (!configuredUrl) return import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

  const withProtocol = /^https?:\/\//i.test(configuredUrl) ? configuredUrl : `https://${configuredUrl}`;
  const normalizedUrl = withProtocol.replace(/\/+$/, '');
  return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;
}

const API_URL = getApiUrl();

function getStoredToken() {
  try {
    const raw = localStorage.getItem('hurriya-auth-session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.token || null;
  } catch (error) {
    return null;
  }
}

let authToken = getStoredToken();

async function apiRequest(path, options = {}) {
  const token = options.token || authToken || getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const api = {
  setToken(token) {
    authToken = token || null;
  },
  clearToken() {
    authToken = null;
  },
  health: () => apiRequest('/health'),
  login: (payload) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  register: (payload) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  me: () => apiRequest('/auth/me'),
  getRides: () => apiRequest('/rides'),
  requestRide: (payload) => apiRequest('/rides/request', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getDrivers: () => apiRequest('/drivers/available'),
  getPayments: () => apiRequest('/payments'),
  topup: (amount) => apiRequest('/payments/topup', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }),
  getAdminOverview: () => apiRequest('/admin/overview'),
};

export default api;
