'use strict';
const { Review, User } = require('../models');
const { success, created, paginated } = require('../utils/response.utils');
const { AppError } = require('../middlewares/error.middleware');

// GET /api/reviews/stats
const getReviewStats = async (_req, res, next) => {
  try {
    const { sequelize } = require('../models');
    const [[row]] = await sequelize.query(
      `SELECT COUNT(*)::int AS total, ROUND(AVG(rating)::numeric, 1) AS average
       FROM reviews WHERE status = 'approved'`
    );
    return success(res, { total: row.total, average: row.average ? parseFloat(row.average) : null });
  } catch (err) {
    next(err);
  }
};

// GET /api/reviews (publiques : uniquement approved)
const getPublicReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
      where: { status: 'approved' },
      include: [{ model: User, as: 'user', attributes: ['full_name'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

// POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.create({
      user_id: req.user.id,
      rating,
      comment,
      status: 'pending', // toujours en attente de modération
    });

    return created(res, review, 'Avis soumis. Il sera visible après validation.');
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/reviews
const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/reviews/:id/moderate
const moderateReview = async (req, res, next) => {
  try {
    const { status, admin_note } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      throw new AppError('Statut invalide.', 400);
    }

    const review = await Review.findByPk(req.params.id);
    if (!review) throw new AppError('Avis introuvable.', 404);

    await review.update({ status, admin_note });
    return success(res, review, `Avis ${status === 'approved' ? 'approuvé' : 'rejeté'}.`);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) throw new AppError('Avis introuvable.', 404);
    await review.destroy();
    return success(res, {}, 'Avis supprimé.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getReviewStats, getPublicReviews, createReview, getAllReviews, moderateReview, deleteReview };
