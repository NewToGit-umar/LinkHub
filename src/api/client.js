const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function signup(data) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function login(data) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchLinks(userId) {
  const url = userId ? `${API_BASE}/api/links?userId=${userId}` : `${API_BASE}/api/links`;
  const res = await fetch(url);
  return res.json();
}

export async function createLink(payload) {
  const res = await fetch(`${API_BASE}/api/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteLink(id) {
  const res = await fetch(`${API_BASE}/api/links/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  return res.json();
}
