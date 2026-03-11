export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001/api/v1';

export function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('fcp_token') || '';
}

function handleUnauthorized() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('fcp_token');
  if (window.location.pathname !== '/auth') window.location.href = '/auth';
}

export async function api(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, cache: 'no-store' });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || 'Request failed' };
  }

  if (res.status === 401) handleUnauthorized();
  if (!res.ok) throw new Error(data?.error || `Request failed with status ${res.status}`);
  return data;
}
