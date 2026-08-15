const SESSION_HINT_KEY = 'filmedin_session';
const LEGACY_TOKEN_KEY = 'token';

function notifyAuthChanged() {
  window.dispatchEvent(new Event('auth-changed'));
}

export function hasSessionHint() {
  return localStorage.getItem(SESSION_HINT_KEY) === 'active' || Boolean(localStorage.getItem(LEGACY_TOKEN_KEY));
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
