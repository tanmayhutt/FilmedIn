const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.post('/google', authController.googleLogin);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
