'use strict';
const express = require('express');
const router = express.Router();
const {
  createOrder,
  captureOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Cliente
router.post('/', authenticate, createOrder);
router.post('/:id/capture', authenticate, captureOrder);
router.get('/my', authenticate, getMyOrders);

// Admin
router.get('/', authenticate, isAdmin, getAllOrders);
router.patch('/:id/status', authenticate, isAdmin, updateOrderStatus);

module.exports = router;
