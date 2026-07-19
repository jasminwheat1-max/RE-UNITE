// In dev, the Vite proxy forwards relative /api calls to the local server.
// In prod (client and server on separate domains), set VITE_API_URL to the
// deployed server's origin, e.g. https://your-server.onrender.com
const BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  me: () => request('/auth/me'),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (email, password, name) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  listEvents: () => request('/events'),
  getEvent: (id) => request(`/events/${id}`),
  buyTicket: (id, payload) =>
    request(`/events/${id}/tickets`, { method: 'POST', body: JSON.stringify(payload) }),
  myEvents: () => request('/events/host/mine'),
  createEvent: (payload) => request('/events', { method: 'POST', body: JSON.stringify(payload) }),
  updateEvent: (id, payload) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  setEventStatus: (id, status) =>
    request(`/events/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),

  activeOffers: () => request('/offers/active'),
  myOffers: () => request('/offers/mine'),
  createOffer: (payload) => request('/offers', { method: 'POST', body: JSON.stringify(payload) }),
  pendingOffers: () => request('/offers/host/pending'),
  reviewOffer: (id, approve) =>
    request(`/offers/${id}/review`, { method: 'POST', body: JSON.stringify({ approve }) }),

  myCollaborations: () => request('/collaborations/mine'),
  createCollaboration: (payload) =>
    request('/collaborations', { method: 'POST', body: JSON.stringify(payload) }),
  pendingCollaborations: () => request('/collaborations/host/pending'),
  reviewCollaboration: (id, approve) =>
    request(`/collaborations/${id}/review`, { method: 'POST', body: JSON.stringify({ approve }) }),

  listPosts: () => request('/posts'),
  createPost: (payload) => request('/posts', { method: 'POST', body: JSON.stringify(payload) }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
};

export function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
