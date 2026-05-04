'use strict';
const { Op } = require('sequelize');
const { Product, ProductVariant } = require('../models');
const cloudinary = require('../config/cloudinary');
const { success, created, paginated } = require('../utils/response.utils');
const { AppError } = require('../middlewares/error.middleware');

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;
    const offset = (page - 1) * limit;
    const where = { is_active: true };

    if (category) where.category = category;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: ProductVariant, as: 'variants', where: { is_active: true }, required: false }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, is_active: true },
      include: [{ model: ProductVariant, as: 'variants', where: { is_active: true }, required: false }],
    });
    if (!product) throw new AppError('Produit introuvable.', 404);
    return success(res, product);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/products
const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, stock_qty, low_stock_threshold, has_variants } = req.body;

    const urls = (req.files || []).map((f) => f.path);
    const product = await Product.create({
      name, description, category, price,
      stock_qty: stock_qty || 0,
      low_stock_threshold: low_stock_threshold || 3,
      has_variants: has_variants || false,
      image_url: urls[0] || null,
      images_urls: urls,
    });

    return created(res, product, 'Produit créé.');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Produit introuvable.', 404);

    const newUrls = (req.files || []).map((f) => f.path);

    // Supprimer les anciennes images Cloudinary si remplacement
    if (newUrls.length > 0 && product.images_urls?.length > 0) {
      await Promise.all(
        product.images_urls.map((url) => {
          const publicId = url.split('/').pop().split('.')[0];
          return cloudinary.uploader.destroy(`beauty-app/products/${publicId}`).catch(console.error);
        })
      );
    }

    await product.update({
      ...req.body,
      ...(newUrls.length > 0 && {
        image_url: newUrls[0],
        images_urls: newUrls,
      }),
    });

    return success(res, product, 'Produit mis à jour.');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/products/:id (soft delete)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Produit introuvable.', 404);
    await product.update({ is_active: false });
    return success(res, {}, 'Produit désactivé.');
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/products/:id/variants
const createVariant = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Produit introuvable.', 404);

    const variant = await ProductVariant.create({
      product_id: product.id,
      ...req.body,
    });

    return created(res, variant, 'Variante créée.');
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/products/:id/variants/:variantId/stock
const updateVariantStock = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findOne({
      where: { id: req.params.variantId, product_id: req.params.id },
    });
    if (!variant) throw new AppError('Variante introuvable.', 404);

    const { stock_qty } = req.body;
    await variant.update({ stock_qty });
    return success(res, variant, 'Stock mis à jour.');
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/products/low-stock
const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: {
        is_active: true,
        has_variants: false,
        stock_qty: { [Op.lte]: sequelize.col('low_stock_threshold') },
      },
    });
    return success(res, products);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariantStock,
  getLowStockProducts,
};
