const express = require('express');
const router = express.Router();
const { generateWallpaper } = require('../controllers/wallpaper.controller');
const protect = require('../middleware/auth');

// Route to generate AI wallpaper
router.post('/generate', protect, generateWallpaper);

module.exports = router;
