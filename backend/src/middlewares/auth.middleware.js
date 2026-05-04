'use strict';
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Vérifier le JWT access token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant ou invalide.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Utilisateur introuvable ou désactivé.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Token invalide.' });
  }
};

// Restreindre à un ou plusieurs rôles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    next();
  };
};

// Raccourcis
const isAdmin = authorize('admin');
const isClient = authorize('client');
const isAdminOrClient = authorize('admin', 'client');

module.exports = { authenticate, authorize, isAdmin, isClient, isAdminOrClient };
