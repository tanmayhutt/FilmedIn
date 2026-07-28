const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const userController = require('../controllers/user.controller');

router.get('/me', auth, userController.getProfile);
router.get('/search', userController.searchUsers);
router.get('/public/:username', userController.getPublicProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/avatar', auth, userController.updateAvatar);
router.post('/avatar/upload', [auth, upload.single('file')], userController.uploadAvatar);
router.post('/banner/upload', [auth, upload.single('file')], userController.uploadBanner);
router.delete('/me', auth, userController.deleteAccount);

router.post('/:username/follow', auth, userController.toggleFollow);
router.get('/:username/followers', userController.getFollowers);
router.get('/:username/following', userController.getFollowing);

module.exports = router;
