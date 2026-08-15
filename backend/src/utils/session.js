const COOKIE_NAME = 'filmedin_session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_MS,
    path: '/',
  };
}

function getSessionCookie(req) {
  const cookieHeader = req.headers.cookie || '';
  for (const pair of cookieHeader.split(';')) {
    const [rawName, ...rawValue] = pair.trim().split('=');
    if (rawName === COOKIE_NAME) {
      try {
        return decodeURIComponent(rawValue.join('='));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
}

function clearSessionCookie(res) {
  const { maxAge: _maxAge, ...options } = getCookieOptions();
  res.clearCookie(COOKIE_NAME, options);
}

module.exports = { clearSessionCookie, getSessionCookie, setSessionCookie };
