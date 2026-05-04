'use strict';
const express = require('express');
const router = express.Router();
const { getSlots, getAvailableSlots, blockSlot, generateSlots } = require('../controllers/slot.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Publiques (lecture)
router.get('/', getSlots);
router.get('/available', getAvailableSlots);

// Admin seulement
router.patch('/:id/block', authenticate, isAdmin, blockSlot);
router.post('/generate', authenticate, isAdmin, generateSlots);

module.exports = router;
