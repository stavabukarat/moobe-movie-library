const BASE = 'http://localhost:3001';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  register: (email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  search: (q) => request(`/search?q=${encodeURIComponent(q)}`),

  getLibrary: () => request('/library'),

  addToLibrary: (item) =>
    request('/library', { method: 'POST', body: JSON.stringify(item) }),

  updateLibraryItem: (id, patch) =>
    request(`/library/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  getTrending: (type) => request(`/${type}/trending`),          // type: 'movies' | 'tv'
  getByGenre: (type, genreId) => request(`/${type}/genre/${genreId}`),
};
