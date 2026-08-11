const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { avatarUpload, bannerUpload } = require('../config/cloudinary');
const userController = require('../controllers/user.controller');

router.get('/me', auth, userController.getProfile);
router.get('/search', auth, userController.searchUsers);
router.get('/public/:username', auth, userController.getPublicProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/avatar', auth, userController.updateAvatar);
router.post('/avatar/upload', [auth, avatarUpload.single('file')], userController.uploadAvatar);
router.post('/banner/upload', [auth, bannerUpload.single('file')], userController.uploadBanner);
router.delete('/me', auth, userController.deleteAccount);

router.post('/:username/follow', auth, userController.toggleFollow);
router.get('/:username/followers', auth, userController.getFollowers);
router.get('/:username/following', auth, userController.getFollowing);

module.exports = router;
