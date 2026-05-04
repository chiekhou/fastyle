'use strict';
const { body } = require('express-validator');

const productValidator = [
  body('name').trim().notEmpty().withMessage('Nom du produit requis.'),
  body('category').isIn(['cosmetic', 'clothing']).withMessage('Catégorie invalide.'),
  body('price').isFloat({ min: 0 }).withMessage('Prix invalide.'),
  body('stock_qty').optional().isInt({ min: 0 }).withMessage('Stock invalide.'),
  body('low_stock_threshold').optional().isInt({ min: 0 }),
  body('has_variants').optional().isBoolean(),
  body('description').optional().isString(),
];

const variantValidator = [
  body('label').trim().notEmpty().withMessage('Label de variante requis.'),
  body('stock_qty').isInt({ min: 0 }).withMessage('Stock invalide.'),
  body('price_override').optional().isFloat({ min: 0 }),
];

module.exports = { productValidator, variantValidator };
