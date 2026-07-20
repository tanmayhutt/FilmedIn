const User = require('../models/User');
const Playlist = require('../models/Playlist');
const PlaylistItem = require('../models/PlaylistItem');
const jwt = require('jsonwebtoken');

exports.updateProfile = async (req, res) => {
  try {
    const { username, avatarUrl } = req.body;
    
    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Validate and check username uniqueness
    if (username && username !== user.username) {
      if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long' });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
      }
      
      const existingUser = await User.findOne({ username: username.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      
      user.username = username.toLowerCase();
    }

    if (avatarUrl) {
      user.avatarUrl = avatarUrl;
    }

    await user.save();

    // Generate a new token if username was updated
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -otp -otpExpires');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const userObj = user.toObject();
    userObj.followersCount = userObj.followers ? userObj.followers.length : 0;
    userObj.followingCount = userObj.following ? userObj.following.length : 0;
    
    res.json(userObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('username avatarUrl _id followers following');
    if (!user) return res.status(404).json({ error: 'User not found' });

    let isFollowing = false;
    const authHeader = req.header('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isFollowing = user.followers.includes(decoded.userId);
      } catch (e) {
        // Ignore invalid token
      }
    }

    res.json({
      _id: user._id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.toggleFollow = async (req, res) => {
  try {
    const targetUsername = req.params.username;
    const currentUserId = req.user.id;
    
    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    if (targetUser._id.toString() === currentUserId) return res.status(400).json({ error: 'Cannot follow yourself' });

    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUser._id } });
      await User.findByIdAndUpdate(targetUser._id, { $pull: { followers: currentUserId } });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUser._id } });
      await User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: currentUserId } });
    }

    res.json({ success: true, isFollowing: !isFollowing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).populate('followers', 'username avatarUrl');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.followers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).populate('following', 'username avatarUrl');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.following);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { avatarUrl }, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // Cloudinary returns the secure URL directly on req.file.path
    const avatarUrl = req.file.path;
    const user = await User.findByIdAndUpdate(req.user.id, { avatarUrl }, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find all playlists owned by the user
    const playlists = await Playlist.find({ userId });
    const playlistIds = playlists.map(p => p._id);

    // Delete all playlist items
    await PlaylistItem.deleteMany({ playlistId: { $in: playlistIds } });
    
    // Delete all playlists
    await Playlist.deleteMany({ userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Account and all related data deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    // Search by username or email (case-insensitive)
    const regex = new RegExp(q, 'i');
    const users = await User.find({
      $or: [
        { username: regex },
        { email: regex }
      ]
    }).select('_id username avatarUrl').limit(10);
    
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
