'use strict';
const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const { User } = require('../models');
const { success, paginated } = require('../utils/response.utils');
const { AppError } = require('../middlewares/error.middleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate.middleware');

const updateProfileValidator = [
  body('full_name').optional().trim().notEmpty().withMessage('Le nom complet ne peut pas être vide.'),
  body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Numéro de téléphone invalide.'),
];

const changePasswordValidator = [
  body('current_password').notEmpty().withMessage('Mot de passe actuel requis.'),
  body('new_password')
    .isLength({ min: 8 }).withMessage('8 caractères minimum.')
    .matches(/[A-Z]/).withMessage('Au moins une majuscule.')
    .matches(/[0-9]/).withMessage('Au moins un chiffre.'),
];

// GET /api/users/profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    return success(res, req.user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/profile
router.put('/profile', authenticate, updateProfileValidator, validate, async (req, res, next) => {
  try {
    const { full_name, phone } = req.body;
    await req.user.update({ full_name, phone });
    return success(res, req.user, 'Profil mis à jour.');
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/change-password
router.put('/change-password', authenticate, changePasswordValidator, validate, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    const userWithPwd = await User.scope('withPassword').findByPk(req.user.id);
    const isValid = await userWithPwd.validatePassword(current_password);
    if (!isValid) throw new AppError('Mot de passe actuel incorrect.', 401);

    await userWithPwd.update({ password_hash: new_password });
    return success(res, {}, 'Mot de passe mis à jour.');
  } catch (err) {
    next(err);
  }
});

// ── Admin routes ──────────────────────────────────────────────
// GET /api/users  (liste toutes les clientes)
router.get('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    const { Op } = require('sequelize');
    const where = { role: 'client' };
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({ where, limit, offset, order: [['created_at', 'DESC']] });
    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/toggle-active
router.patch('/:id/toggle-active', authenticate, isAdmin, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('Utilisateur introuvable.', 404);
    await user.update({ is_active: !user.is_active });
    return success(res, user, `Compte ${user.is_active ? 'activé' : 'désactivé'}.`);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('Utilisateur introuvable.', 404);
    if (user.role === 'admin') throw new AppError('Impossible de supprimer un compte administrateur.', 403);
    await user.destroy();
    return success(res, {}, 'Compte supprimé.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
