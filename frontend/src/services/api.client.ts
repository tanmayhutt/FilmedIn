import { clearSessionHint, completeLegacyMigration, getLegacyToken } from '@/utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const legacyToken = getLegacyToken();
  
  const headers: Record<string, string> = {
    ...Object.fromEntries(new Headers(options.headers).entries())
  };

  if (legacyToken) {
    headers['Authorization'] = `Bearer ${legacyToken}`;
  }

  // Only set Content-Type to application/json if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      clearSessionHint();
    }
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  if (legacyToken) completeLegacyMigration();

  return data;
}
