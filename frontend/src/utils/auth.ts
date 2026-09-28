const SESSION_HINT_KEY = 'filmedin_session';
const LEGACY_TOKEN_KEY = 'token';

function notifyAuthChanged() {
  window.dispatchEvent(new Event('auth-changed'));
}

export function hasSessionHint() {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === 'active' || Boolean(localStorage.getItem(LEGACY_TOKEN_KEY));
  } catch {
    return false;
  }
}

// Lets components re-render when the session starts or ends, including from another tab.
export function subscribeToSession(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SESSION_HINT_KEY || event.key === LEGACY_TOKEN_KEY) callback();
  };
  window.addEventListener('auth-changed', callback);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener('auth-changed', callback);
    window.removeEventListener('storage', handleStorage);
  };
}

export function markSessionActive() {
  localStorage.setItem(SESSION_HINT_KEY, 'active');
  notifyAuthChanged();
}

export function clearSessionHint() {
  localStorage.removeItem(SESSION_HINT_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  notifyAuthChanged();
}

export function getLegacyToken() {
  return localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function completeLegacyMigration() {
  if (localStorage.getItem(LEGACY_TOKEN_KEY)) {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    markSessionActive();
  }
}
