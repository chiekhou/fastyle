'use strict';

// Erreur personnalisée
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Middleware de gestion globale des erreurs
const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message } = err;

  // Erreurs Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 422;
    message = err.errors.map((e) => e.message).join(', ');
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Cette valeur existe déjà.';
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 409;
    message = 'Référence invalide.';
  }

  // Log en dev
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Attraper les routes inconnues
const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} introuvable.` });
};

module.exports = { AppError, errorHandler, notFound };
