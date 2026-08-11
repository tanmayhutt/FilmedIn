const express = require('express');
const router = express.Router();
const { generateWallpaper } = require('../controllers/wallpaper.controller');
const auth = require('../middleware/auth');

router.post('/generate', auth, generateWallpaper);

module.exports = router;
