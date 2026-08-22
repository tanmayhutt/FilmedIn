const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const { clearSessionCookie, setSessionCookie } = require('../utils/session');

const DEFAULT_GOOGLE_CLIENT_ID = '741007561589-smjao34064v663da3h7nsak6vnh0g11g.apps.googleusercontent.com';
const googleClientIds = Array.from(new Set([
  process.env.GOOGLE_CLIENT_ID,
  ...(process.env.GOOGLE_CLIENT_IDS || '').split(','),
  DEFAULT_GOOGLE_CLIENT_ID,
].map(value => value?.trim()).filter(Boolean)));
const client = new OAuth2Client();
const PRESET_PLAYLISTS = ['Watchlist', 'Currently Watching', 'Watched', 'Liked'];

async function ensurePresetPlaylists(userId) {
  await Promise.all(PRESET_PLAYLISTS.map(name => Playlist.updateOne(
    { userId, name },
    { $setOnInsert: { userId, name, type: 'system' } },
    { upsert: true }
  )));
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // Verify the Google JWT token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientIds,
    });
    const payload = ticket.getPayload();
    const { email, email_verified: emailVerified, name, picture, sub: googleId } = payload;

    if (!email || !emailVerified) {
      return res.status(400).json({ error: 'A verified Google email is required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Create new user if they don't exist
      // Generate a valid username from their name or email
      let baseUsername = name ? name.toLowerCase().replace(/[^a-z0-9_]/g, '') : email.split('@')[0].replace(/[^a-z0-9_]/g, '');
      baseUsername = baseUsername.slice(0, 24);
      if (!baseUsername || baseUsername.length < 3) baseUsername = 'user' + Math.floor(Math.random() * 10000);
      
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = baseUsername + counter;
        counter++;
      }

      user = new User({
        email: email.toLowerCase(),
        username,
        googleId,
        avatarUrl: picture,
      });
      await user.save();

    } else if (user) {
      // If user exists but hasn't linked Google, update them
      if (!user.googleId) user.googleId = googleId;
      // Upgrade placeholder avatar to Google PFP
      if (!user.avatarUrl || user.avatarUrl.includes('dicebear.com')) {
        user.avatarUrl = picture;
      }
      await user.save();
    }

    await ensurePresetPlaylists(user._id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    setSessionCookie(res, token);

    res.json({
      isNewUser,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (err) {
    console.error('Google Auth Error:', err.message);
    if (err?.code === 11000) return res.status(409).json({ error: 'This Google account or username is already registered. Please try signing in again.' });
    if (err?.name === 'MongoServerSelectionError' || err?.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ error: 'Sign-in is temporarily unavailable. Please try again shortly.' });
    }
    if (/wrong recipient|invalid token|token used too late|no pem found/i.test(err?.message || '')) {
      return res.status(401).json({ error: 'Google could not verify this sign-in. Please try again.' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
};

exports.logout = (_req, res) => {
  clearSessionCookie(res);
  res.json({ success: true });
};



exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
