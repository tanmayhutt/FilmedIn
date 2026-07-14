const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -otp -otpExpires');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
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
    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, { avatarUrl: publicUrl }, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
