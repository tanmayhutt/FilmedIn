// Signed-in API flows against a throwaway in-memory MongoDB. TMDB lookups degrade to
// placeholder titles when TMDB_API_KEY is absent, so these tests need no credentials.
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo, server, base, app, jwt, mongoose, User, Playlist;

async function createMember(username) {
  const user = await User.create({ email: `${username}@example.test`, username, googleId: username });
  const lists = {};
  for (const name of ['Watchlist', 'Currently Watching', 'Watched', 'Liked']) {
    lists[name] = (await Playlist.create({ userId: user._id, name, type: 'system' }))._id.toString();
  }
  const token = jwt.sign({ userId: user._id, username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { user, lists, cookie: `filmedin_session=${encodeURIComponent(token)}` };
}

async function api(member, method, url, body) {
  const res = await fetch(`${base}/api${url}`, {
    method,
    headers: { cookie: member?.cookie || '', 'content-type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json, headers: res.headers };
}

const add = (member, list, tmdbId, mediaType) => api(member, 'POST', '/playlists/items', { playlistId: member.lists[list], tmdbId, mediaType });

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
  process.env.TMDB_API_KEY = '';
  process.env.NODE_ENV = 'test';
  app = require('../src/server');
  jwt = require('jsonwebtoken');
  mongoose = require('mongoose');
  User = require('../src/models/User');
  Playlist = require('../src/models/Playlist');
  await mongoose.connection.asPromise();
  await Promise.all([User.init(), Playlist.init()]);
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  server?.close();
  await mongoose?.disconnect();
  await mongo?.stop();
});

test('viewing states are exclusive and ownership is enforced', async () => {
  const a = await createMember('state_a');
  const b = await createMember('state_b');
  await add(a, 'Watchlist', 27205, 'movie');
  const moved = await add(a, 'Watched', 27205, 'movie');
  assert.equal(moved.status, 201);
  const saved = (await api(a, 'GET', '/playlists/saved-ids')).json;
  assert.deepEqual(saved.itemMap['movie:27205'], [a.lists.Watched]);
  assert.ok(saved.playlists.every(p => p.type === 'system'));

  assert.equal((await add(a, 'Watched', 27205, 'movie')).status, 400, 'duplicate add');
  assert.equal((await api(a, 'POST', '/playlists/items', { playlistId: 'nope', tmdbId: 1, mediaType: 'movie' })).status, 400);
  assert.equal((await api(a, 'POST', '/playlists/items', { playlistId: b.lists.Watchlist, tmdbId: 1, mediaType: 'movie' })).status, 403);
});

test('playlist items are returned with media type in one request', async () => {
  const a = await createMember('items_a');
  await add(a, 'Watchlist', 1396, 'tv');
  const res = await api(a, 'GET', `/playlists/${a.lists.Watchlist}/items`);
  assert.equal(res.status, 200);
  assert.equal(res.json[0].id, 1396);
  assert.equal(res.json[0].media_type, 'tv');
});

test('taste blend uses system lists only and keeps TV titles as TV', async () => {
  const a = await createMember('blend_a');
  const b = await createMember('blend_b');
  await add(a, 'Watchlist', 1396, 'tv');
  await add(b, 'Watchlist', 1396, 'tv');
  await add(a, 'Watched', 1399, 'tv');
  const custom = await api(b, 'POST', '/playlists', { name: 'Watched with Dad' });
  await api(b, 'POST', '/playlists/items', { playlistId: custom.json.id, tmdbId: 1399, mediaType: 'tv' });

  const blend = await api(a, 'GET', '/playlists/blend/blend_b');
  assert.equal(blend.status, 200);
  assert.equal(blend.json.presetBreakdown.watchlist.mutualCount, 1);
  assert.equal(blend.json.presetBreakdown.watched.u2Count, 0, 'custom list must not count as Watched');
  assert.equal((await api(a, 'GET', '/playlists/blend/blend_a')).status, 400, 'self blend');
});

test('follow, profile edits, and account deletion', async () => {
  const a = await createMember('social_a');
  await createMember('social_b');
  const follow = await api(a, 'POST', '/users/Social_B/follow');
  assert.equal(follow.json.isFollowing, true);
  assert.equal((await api(a, 'GET', '/users/public/social_b')).json.followersCount, 1);

  assert.equal((await api(a, 'PUT', '/users/profile', { username: 'social_b' })).status, 400);
  assert.equal((await api(a, 'PUT', '/users/profile', { username: 42 })).status, 400);
  const renamed = await api(a, 'PUT', '/users/profile', { username: 'social_c', bio: 'hi' });
  assert.equal(renamed.json.user.username, 'social_c');
  assert.equal('followers' in renamed.json.user, false);

  const deleted = await api(a, 'DELETE', '/users/me');
  assert.equal(deleted.status, 200);
  assert.match(deleted.headers.get('set-cookie') || '', /filmedin_session=;/);
});

test('error responses are JSON', async () => {
  const a = await createMember('errors_a');
  const malformed = await api(a, 'POST', '/playlists/items', '{bad');
  assert.equal(malformed.status, 400);
  assert.equal(typeof malformed.json.error, 'string');
  const missing = await api(null, 'GET', '/nope');
  assert.equal(missing.status, 404);
  assert.equal((await api(null, 'GET', '/users/me')).status, 401);
});

test('duplicate system lists are blocked by the database', async () => {
  const a = await createMember('index_a');
  await assert.rejects(Playlist.create({ userId: a.user._id, name: 'Watchlist', type: 'system' }), { code: 11000 });
  await Playlist.create({ userId: a.user._id, name: 'Watchlist', type: 'custom' });
});
