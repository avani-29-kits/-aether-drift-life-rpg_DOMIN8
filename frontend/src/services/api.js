const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g. 204) — that's fine
  }

  if (!res.ok) {
    const message = (data && data.error) || 'Something went wrong. Please try again.';
    throw new Error(message);
  }

  return data;
}

export const api = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  getCharacter: () => request('/character'),
  getQuests: (completed) =>
    request(`/quests${completed !== undefined ? `?completed=${completed}` : ''}`),
  createQuest: (payload) => request('/quests', { method: 'POST', body: payload }),
  updateQuest: (id, payload) => request(`/quests/${id}`, { method: 'PUT', body: payload }),
  deleteQuest: (id) => request(`/quests/${id}`, { method: 'DELETE' }),
  completeQuest: (id) => request(`/quests/${id}/complete`, { method: 'POST' }),
  getShopItems: () => request('/shop'),
  purchaseItem: (itemId) => request(`/shop/${itemId}/purchase`, { method: 'POST' }),
  equipItem: (itemId) => request(`/shop/${itemId}/equip`, { method: 'POST' }),
  getAchievements: () => request('/achievements'),
};
