'use strict';
const { body } = require('express-validator');

const registerValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Mot de passe : 8 caractères minimum.')
    .matches(/[A-Z]/).withMessage('Mot de passe : au moins une majuscule.')
    .matches(/[0-9]/).withMessage('Mot de passe : au moins un chiffre.'),
  body('full_name').trim().notEmpty().withMessage('Nom complet requis.'),
  body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Numéro de téléphone invalide.'),
];

const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide.'),
  body('password').notEmpty().withMessage('Mot de passe requis.'),
];

module.exports = { registerValidator, loginValidator };
