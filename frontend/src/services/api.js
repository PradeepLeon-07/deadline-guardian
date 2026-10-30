const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getDeadlines: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/deadlines${qs ? '?' + qs : ''}`);
  },
  createDeadline: (body) => request('/deadlines', { method: 'POST', body: JSON.stringify(body) }),
  getDeadline: (id) => request(`/deadlines/${id}`),
  updateDeadline: (id, body) => request(`/deadlines/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteDeadline: (id) => request(`/deadlines/${id}`, { method: 'DELETE' }),
  completeDeadline: (id) => request(`/deadlines/${id}/complete`, { method: 'PATCH' }),
  getDashboard: () => request('/dashboard'),
  sendDeadlineReminder: (id) => request(`/deadlines/${encodeURIComponent(id)}/remind`, { method: 'POST' }),
};
