const test = require('node:test');
const assert = require('node:assert/strict');
const {
  clearSessionCookie,
  getSessionCookie,
  setSessionCookie,
} = require('../src/utils/session');

test('reads the FilmedIn session cookie without changing its token', () => {
  const token = 'header.payload.signature=';
  const req = {
    headers: {
      cookie: `theme=dark; filmedin_session=${encodeURIComponent(token)}; consent=yes`,
    },
  };

  assert.equal(getSessionCookie(req), token);
});

test('returns null for a missing or malformed session cookie', () => {
  assert.equal(getSessionCookie({ headers: {} }), null);
  assert.equal(getSessionCookie({ headers: { cookie: 'filmedin_session=%E0%A4%A' } }), null);
});

test('sets a protected, same-site session cookie', () => {
  let call;
  const res = { cookie: (...args) => { call = args; } };

  setSessionCookie(res, 'signed-token');

  assert.equal(call[0], 'filmedin_session');
  assert.equal(call[1], 'signed-token');
  assert.equal(call[2].httpOnly, true);
  assert.equal(call[2].sameSite, 'lax');
  assert.equal(call[2].path, '/');
  assert.equal(call[2].maxAge, 7 * 24 * 60 * 60 * 1000);
});

test('clears the cookie with matching scope attributes', () => {
  let call;
  const res = { clearCookie: (...args) => { call = args; } };

  clearSessionCookie(res);

  assert.equal(call[0], 'filmedin_session');
  assert.equal(call[1].httpOnly, true);
  assert.equal(call[1].sameSite, 'lax');
  assert.equal(call[1].path, '/');
  assert.equal('maxAge' in call[1], false);
});
