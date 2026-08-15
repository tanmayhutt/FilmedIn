const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const auth = require('../middleware/auth');
const { avatarUpload, bannerUpload } = require('../config/cloudinary');
const userController = require('../controllers/user.controller');
const uploadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

router.get('/me', auth, userController.getProfile);
router.get('/search', auth, userController.searchUsers);
router.get('/public/:username', auth, userController.getPublicProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/avatar', auth, userController.updateAvatar);
router.post('/avatar/upload', [auth, uploadLimiter, avatarUpload.single('file')], userController.uploadAvatar);
router.post('/banner/upload', [auth, uploadLimiter, bannerUpload.single('file')], userController.uploadBanner);
router.delete('/me', auth, userController.deleteAccount);

router.post('/:username/follow', auth, userController.toggleFollow);
router.get('/:username/followers', auth, userController.getFollowers);
router.get('/:username/following', auth, userController.getFollowing);

module.exports = router;
