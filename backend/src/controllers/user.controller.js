const User = require('../models/User');
const Playlist = require('../models/Playlist');
const PlaylistItem = require('../models/PlaylistItem');
const jwt = require('jsonwebtoken');
const { uploadImage } = require('../config/cloudinary');
const { setSessionCookie } = require('../utils/session');

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
const MAX_FOLLOWING = 5000;
const isSafeImageUrl = (value) => {
  if (value === null || value === '') return true;
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, avatarUrl, bannerUrl, bio } = req.body;
    
    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Validate and check username uniqueness
    if (username && username.toLowerCase() !== user.username) {
      const normalizedUsername = username.trim().toLowerCase();
      if (!USERNAME_PATTERN.test(normalizedUsername)) {
        return res.status(400).json({ error: 'Username must be 3–30 characters and use only letters, numbers, or underscores' });
      }
      
      const existingUser = await User.findOne({ username: normalizedUsername });
      if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      
      user.username = normalizedUsername;
    }

    if (avatarUrl !== undefined) {
      if (!isSafeImageUrl(avatarUrl)) return res.status(400).json({ error: 'Avatar must use a valid secure image URL' });
      user.avatarUrl = avatarUrl;
    }
    if (bannerUrl !== undefined) {
      if (!isSafeImageUrl(bannerUrl)) return res.status(400).json({ error: 'Banner must use a valid secure image URL' });
      user.bannerUrl = bannerUrl;
    }
    if (bio !== undefined) {
      if (typeof bio !== 'string' || bio.length > 280) return res.status(400).json({ error: 'Bio must be 280 characters or fewer' });
      user.bio = bio.trim();
    }

    await user.save();

    // Generate a new token if username was updated
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    setSessionCookie(res, token);

    res.json({ user });
  } catch (err) {
    console.error(err.message);
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
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() }).select('username avatarUrl bannerUrl bio _id followers following');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isFollowing = user.followers.some(followerId => followerId.toString() === req.user.id);

    res.json({
      _id: user._id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bannerUrl: user.bannerUrl,
      bio: user.bio,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing
    });
  } catch (err) {
    console.error(err.message);
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
      const currentUser = await User.findById(currentUserId).select('following');
      if (!currentUser) return res.status(404).json({ error: 'User not found' });
      if (currentUser.following.length >= MAX_FOLLOWING) {
        return res.status(400).json({ error: `You can follow up to ${MAX_FOLLOWING} members` });
      }
      // Follow
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUser._id } });
      await User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: currentUserId } });
    }

    res.json({ success: true, isFollowing: !isFollowing });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() }).populate({
      path: 'followers',
      select: 'username avatarUrl',
      options: { limit: 100 },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.followers);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() }).populate({
      path: 'following',
      select: 'username avatarUrl',
      options: { limit: 100 },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.following);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    if (!isSafeImageUrl(avatarUrl)) return res.status(400).json({ error: 'Avatar must use a valid secure image URL' });
    const user = await User.findByIdAndUpdate(req.user.id, { avatarUrl }, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const upload = await uploadImage(req.file.buffer, {
      folder: 'FilmedIn/avatars',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }]
    });
    const avatarUrl = upload.secure_url;
    const user = await User.findByIdAndUpdate(req.user.id, { avatarUrl }, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.uploadBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const upload = await uploadImage(req.file.buffer, {
      folder: 'FilmedIn/banners',
      transformation: [{ width: 1600, height: 600, crop: 'fill', gravity: 'auto', quality: 'auto' }]
    });
    const bannerUrl = upload.secure_url;
    const user = await User.findByIdAndUpdate(req.user.id, { bannerUrl }, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) {
    console.error(err.message);
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

    // Remove the deleted account from other members' social graphs
    await User.updateMany(
      { $or: [{ followers: userId }, { following: userId }] },
      { $pull: { followers: userId, following: userId } }
    );

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Account and all related data deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err.message);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 64) : '';
    if (q.length < 2) return res.json([]);
    
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedQuery}`, 'i');
    const users = await User.find({ username: regex })
      .select('_id username avatarUrl')
      .limit(10)
      .lean();
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
