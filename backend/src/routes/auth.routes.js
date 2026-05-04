'use strict';
const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, refresh, logout, logoutAll, me } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { validate } = require('../middlewares/validate.middleware');
const rateLimit = require('express-rate-limit');

// Limiter les tentatives d'auth (register / login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});

// Limiter le renouvellement de token (évite le bruteforce de refresh tokens)
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Trop de renouvellements. Réessayez dans 15 minutes.' },
});

router.post('/register', authLimiter, registerValidator, validate, register);
router.get('/verify-email', verifyEmail);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);
router.post('/logout-all', authenticate, logoutAll);
router.get('/me', authenticate, me);

module.exports = router;
