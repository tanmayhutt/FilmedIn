const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/google', authController.googleLogin);
router.post('/dev-login', authController.devLogin);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
