'use strict';
const { validationResult } = require('express-validator');

// Middleware qui vérifie les résultats de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const list = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return res.status(422).json({
      success: false,
      message: list[0].message,
      errors: list,
    });
  }
  next();
};

module.exports = { validate };
