const express = require('express');
const { login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/login', loginLimiter, login);
router.get('/me', requireAuth, me);

module.exports = router;
