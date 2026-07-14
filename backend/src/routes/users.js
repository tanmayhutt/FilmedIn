const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const userController = require('../controllers/user.controller');

router.get('/me', auth, userController.getProfile);
router.put('/avatar', auth, userController.updateAvatar);
router.post('/avatar/upload', [auth, upload.single('file')], userController.uploadAvatar);

module.exports = router;
