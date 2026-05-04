'use strict';
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariantStock,
  getLowStockProducts,
} = require('../controllers/product.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const { uploadProductImages } = require('../middlewares/upload.middleware');
const { productValidator, variantValidator } = require('../validators/product.validator');
const { validate } = require('../middlewares/validate.middleware');

// Publiques
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin
router.get('/admin/low-stock', authenticate, isAdmin, getLowStockProducts);
router.post('/', authenticate, isAdmin, uploadProductImages, productValidator, validate, createProduct);
router.put('/:id', authenticate, isAdmin, uploadProductImages, productValidator, validate, updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);
router.post('/:id/variants', authenticate, isAdmin, variantValidator, validate, createVariant);
router.patch('/:id/variants/:variantId/stock', authenticate, isAdmin, updateVariantStock);

module.exports = router;
