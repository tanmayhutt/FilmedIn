const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Playlist = require('../models/Playlist');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Create new user if they don't exist
      // Generate a valid username from their name or email
      let baseUsername = name ? name.toLowerCase().replace(/[^a-z0-9_]/g, '') : email.split('@')[0].replace(/[^a-z0-9_]/g, '');
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

      // Create preset playlists for the new user
      await Playlist.insertMany([
        { userId: user._id, name: 'Watchlist', type: 'system' },
        { userId: user._id, name: 'Currently Watching', type: 'system' },
        { userId: user._id, name: 'Watched', type: 'system' }
      ]);
    } else if (!user.googleId) {
      // If user exists but hasn't linked Google, update them
      user.googleId = googleId;
      if (!user.avatarUrl) user.avatarUrl = picture;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      isNewUser,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

exports.devLogin = async (req, res) => {
  try {
    const email = 'dev@local.host';
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        email,
        username: 'devuser' + Math.floor(Math.random() * 1000),
        googleId: 'dev-google-id',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
      });
      await user.save();

      await Playlist.insertMany([
        { userId: user._id, name: 'Watchlist', type: 'system' },
        { userId: user._id, name: 'Currently Watching', type: 'system' },
        { userId: user._id, name: 'Watched', type: 'system' }
      ]);
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      isNewUser,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (err) {
    console.error('Dev Auth Error:', err);
    res.status(500).json({ error: 'Dev Auth failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
