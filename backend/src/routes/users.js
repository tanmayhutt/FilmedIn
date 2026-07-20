const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const userController = require('../controllers/user.controller');

router.get('/me', auth, userController.getProfile);
router.get('/public/:username', userController.getPublicProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/avatar', auth, userController.updateAvatar);
router.post('/avatar/upload', [auth, upload.single('file')], userController.uploadAvatar);
router.delete('/me', auth, userController.deleteAccount);

module.exports = router;
