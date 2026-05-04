'use strict';
const express = require('express');
const router = express.Router();
const {
  createReservation,
  captureDeposit,
  cancelReservation,
  getMyReservations,
  getAllReservations,
  completeReservation,
} = require('../controllers/reservation.controller');
const { authenticate, isAdmin, isAdminOrClient } = require('../middlewares/auth.middleware');
const { createReservationValidator } = require('../validators/reservation.validator');
const { validate } = require('../middlewares/validate.middleware');

// Cliente
router.post('/', authenticate, createReservationValidator, validate, createReservation);
router.post('/:id/capture-deposit', authenticate, captureDeposit);
router.get('/my', authenticate, getMyReservations);
router.delete('/:id', authenticate, isAdminOrClient, cancelReservation);

// Admin
router.get('/', authenticate, isAdmin, getAllReservations);
router.patch('/:id/complete', authenticate, isAdmin, completeReservation);

module.exports = router;
