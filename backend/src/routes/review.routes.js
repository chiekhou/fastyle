'use strict';
const express = require('express');
const router = express.Router();
const {
  getReviewStats,
  getPublicReviews,
  createReview,
  getAllReviews,
  moderateReview,
  deleteReview,
} = require('../controllers/review.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate.middleware');

const reviewValidator = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Note entre 1 et 5.'),
  body('comment').optional().isString().isLength({ max: 1000 }),
];

// Publique
router.get('/stats', getReviewStats);
router.get('/', getPublicReviews);

// Cliente connectée
router.post('/', authenticate, reviewValidator, validate, createReview);

// Admin
router.get('/admin/all', authenticate, isAdmin, getAllReviews);
router.patch('/:id/moderate', authenticate, isAdmin, moderateReview);
router.delete('/:id', authenticate, isAdmin, deleteReview);

module.exports = router;
