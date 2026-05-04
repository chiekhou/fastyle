'use strict';
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const serviceRoutes = require('./service.routes');
const slotRoutes = require('./slot.routes');
const reservationRoutes = require('./reservation.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const reviewRoutes = require('./review.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/slots', slotRoutes);
router.use('/reservations', reservationRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API opérationnelle 🚀', timestamp: new Date() });
});

module.exports = router;
