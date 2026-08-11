const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    ...Object.fromEntries(new Headers(options.headers).entries())
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type to application/json if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-changed'));
    }
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}
